import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ArrowLeft,
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  Music,
  Waves,
  Wind,
  Zap,
  Heart,
  Leaf,
  Plus,
  X,
  Upload,
  Trash2,
} from 'lucide-react-native';

interface Track {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  url: string;
  isUserAdded?: boolean;
}

export default function MusicScreen() {
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTrackTitle, setNewTrackTitle] = useState('');
  const [newTrackDescription, setNewTrackDescription] = useState('');
  const [userTracks, setUserTracks] = useState<Track[]>([]);

  const { colors } = useTheme();
  const router = useRouter();

  const defaultTracks: Track[] = [
    {
      id: 'rain',
      title: 'Gentle Rain',
      description: 'Soft rainfall sounds for relaxation',
      icon: Waves,
      color: colors.primary,
      url: 'rain-sound',
    },
    {
      id: 'forest',
      title: 'Forest Ambience',
      description: 'Birds chirping in a peaceful forest',
      icon: Leaf,
      color: colors.secondary,
      url: 'forest-sound',
    },
    {
      id: 'ocean',
      title: 'Ocean Waves',
      description: 'Calming ocean waves on the shore',
      icon: Waves,
      color: colors.accent,
      url: 'ocean-sound',
    },
    {
      id: 'wind',
      title: 'Gentle Breeze',
      description: 'Soft wind through the trees',
      icon: Wind,
      color: colors.warning,
      url: 'wind-sound',
    },
    {
      id: 'meditation',
      title: 'Meditation Bell',
      description: 'Tibetan singing bowl for meditation',
      icon: Heart,
      color: colors.error,
      url: 'meditation-sound',
    },
    {
      id: 'focus',
      title: 'Focus Tones',
      description: 'Binaural beats for concentration',
      icon: Zap,
      color: '#9333EA',
      url: 'focus-sound',
    },
  ];

  const allTracks = [...defaultTracks, ...userTracks];

  useEffect(() => {
    loadUserTracks();
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const loadUserTracks = async () => {
    try {
      const saved = await AsyncStorage.getItem('userMusicTracks');
      if (saved) {
        setUserTracks(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading user tracks:', error);
    }
  };

  const saveUserTracks = async (tracks: Track[]) => {
    try {
      await AsyncStorage.setItem('userMusicTracks', JSON.stringify(tracks));
    } catch (error) {
      console.error('Error saving user tracks:', error);
    }
  };

  const playTrack = async (track: Track) => {
    try {
      // Stop current sound if playing
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      if (currentTrack === track.id && isPlaying) {
        // If same track is playing, pause it
        setIsPlaying(false);
        setCurrentTrack(null);
        return;
      }

      // For web or default tracks, create a simple audio context tone
      if (Platform.OS === 'web' || !track.isUserAdded) {
        playWebAudio(track);
        setCurrentTrack(track.id);
        setIsPlaying(true);
        return;
      }

      // For user-added tracks on mobile
      if (track.isUserAdded && track.url) {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: track.url },
          { shouldPlay: true, isLooping: true, volume: isMuted ? 0 : volume }
        );

        setSound(newSound);
        setCurrentTrack(track.id);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing track:', error);
      Alert.alert('Audio Error', 'Unable to play this track. Playing a generated tone instead.');
      playWebAudio(track);
      setCurrentTrack(track.id);
      setIsPlaying(true);
    }
  };

  const playWebAudio = (track: Track) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different frequencies for different tracks
      const frequencies: Record<string, number> = {
        rain: 200,
        forest: 300,
        ocean: 150,
        wind: 250,
        meditation: 432,
        focus: 40,
      };

      oscillator.frequency.setValueAtTime(frequencies[track.id] || 200, audioContext.currentTime);
      oscillator.type = track.id === 'focus' ? 'sine' : 'triangle';

      gainNode.gain.setValueAtTime(isMuted ? 0 : volume * 0.3, audioContext.currentTime);

      oscillator.start();

      // Store reference to stop later
      (window as any).currentOscillator = oscillator;
      (window as any).currentGainNode = gainNode;
      (window as any).currentAudioContext = audioContext;
    } catch (error) {
      console.log('Web Audio not available');
    }
  };

  const stopCurrentTrack = async () => {
    try {
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      // Stop web audio
      if (Platform.OS === 'web') {
        if ((window as any).currentOscillator) {
          (window as any).currentOscillator.stop();
          (window as any).currentOscillator = null;
        }
        if ((window as any).currentGainNode) {
          (window as any).currentGainNode = null;
        }
        if ((window as any).currentAudioContext) {
          await (window as any).currentAudioContext.close();
          (window as any).currentAudioContext = null;
        }
      }

      setIsPlaying(false);
      setCurrentTrack(null);
    } catch (error) {
      console.error('Error stopping track:', error);
    }
  };

  const toggleMute = async () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);

    if (sound) {
      await sound.setVolumeAsync(newMuted ? 0 : volume);
    }

    if (Platform.OS === 'web' && (window as any).currentGainNode) {
      (window as any).currentGainNode.gain.setValueAtTime(
        newMuted ? 0 : volume * 0.3,
        (window as any).currentGainNode.context.currentTime
      );
    }
  };

  const adjustVolume = async (newVolume: number) => {
    setVolume(newVolume);

    if (!isMuted) {
      if (sound) {
        await sound.setVolumeAsync(newVolume);
      }

      if (Platform.OS === 'web' && (window as any).currentGainNode) {
        (window as any).currentGainNode.gain.setValueAtTime(
          newVolume * 0.3,
          (window as any).currentGainNode.context.currentTime
        );
      }
    }
  };

  const addUserTrack = async () => {
    if (!newTrackTitle.trim()) {
      Alert.alert('Error', 'Please enter a track title');
      return;
    }

    try {
      let trackUrl = '';
      
      if (Platform.OS !== 'web') {
        // On mobile, allow file picking
        const result = await DocumentPicker.getDocumentAsync({
          type: 'audio/*',
          copyToCacheDirectory: true,
        });

        if (result.canceled) {
          return;
        }

        trackUrl = result.assets[0].uri;
      } else {
        // On web, create a placeholder URL
        trackUrl = `user-track-${Date.now()}`;
      }

      const newTrack: Track = {
        id: `user-${Date.now()}`,
        title: newTrackTitle.trim(),
        description: newTrackDescription.trim() || 'User added track',
        icon: Music,
        color: colors.primary,
        url: trackUrl,
        isUserAdded: true,
      };

      const updatedUserTracks = [...userTracks, newTrack];
      setUserTracks(updatedUserTracks);
      await saveUserTracks(updatedUserTracks);

      setNewTrackTitle('');
      setNewTrackDescription('');
      setShowAddModal(false);

      Alert.alert('Success', 'Track added successfully!');
    } catch (error) {
      console.error('Error adding track:', error);
      Alert.alert('Error', 'Failed to add track. Please try again.');
    }
  };

  const deleteUserTrack = async (trackId: string) => {
    Alert.alert(
      'Delete Track',
      'Are you sure you want to delete this track?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Stop track if it's currently playing
              if (currentTrack === trackId) {
                await stopCurrentTrack();
              }

              const updatedUserTracks = userTracks.filter(track => track.id !== trackId);
              setUserTracks(updatedUserTracks);
              await saveUserTracks(updatedUserTracks);

              Alert.alert('Success', 'Track deleted successfully!');
            } catch (error) {
              console.error('Error deleting track:', error);
              Alert.alert('Error', 'Failed to delete track');
            }
          },
        },
      ]
    );
  };

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.accent]}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Music size={48} color="#FFFFFF" />
          <Text style={styles.headerTitle}>Wellness Music</Text>
          <Text style={styles.headerSubtitle}>Relax and focus with ambient sounds</Text>
        </View>

        <TouchableOpacity 
          style={styles.addTrackButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Current Playing */}
        {currentTrack && (
          <View style={styles.nowPlayingCard}>
            <Text style={styles.nowPlayingTitle}>Now Playing</Text>
            <View style={styles.nowPlayingContent}>
              <Text style={styles.nowPlayingTrack}>
                {allTracks.find(t => t.id === currentTrack)?.title}
              </Text>
              <View style={styles.playbackControls}>
                <TouchableOpacity
                  style={styles.pauseButton}
                  onPress={stopCurrentTrack}
                >
                  <Pause size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.stopButton}
                  onPress={stopCurrentTrack}
                >
                  <Square size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.muteButton}
                  onPress={toggleMute}
                >
                  {isMuted ? (
                    <VolumeX size={20} color={colors.textSecondary} />
                  ) : (
                    <Volume2 size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Volume Control */}
        <View style={styles.volumeCard}>
          <Text style={styles.volumeTitle}>Volume Control</Text>
          <View style={styles.volumeControls}>
            <TouchableOpacity onPress={() => adjustVolume(Math.max(0, volume - 0.1))}>
              <Text style={styles.volumeButton}>-</Text>
            </TouchableOpacity>
            <View style={styles.volumeBar}>
              <View 
                style={[
                  styles.volumeFill, 
                  { width: `${volume * 100}%`, backgroundColor: colors.primary }
                ]} 
              />
            </View>
            <TouchableOpacity onPress={() => adjustVolume(Math.min(1, volume + 0.1))}>
              <Text style={styles.volumeButton}>+</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.volumeText}>{Math.round(volume * 100)}%</Text>
        </View>

        {/* Default Tracks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ambient Sounds</Text>
          {defaultTracks.map((track) => (
            <TouchableOpacity
              key={track.id}
              style={[
                styles.trackCard,
                currentTrack === track.id && styles.trackCardActive
              ]}
              onPress={() => playTrack(track)}
            >
              <View style={[styles.trackIcon, { backgroundColor: track.color + '20' }]}>
                <track.icon size={24} color={track.color} />
              </View>
              <View style={styles.trackContent}>
                <Text style={styles.trackTitle}>{track.title}</Text>
                <Text style={styles.trackDescription}>{track.description}</Text>
              </View>
              <View style={styles.trackAction}>
                {currentTrack === track.id && isPlaying ? (
                  <Pause size={20} color={colors.primary} />
                ) : (
                  <Play size={20} color={colors.textSecondary} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* User Added Tracks */}
        {userTracks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Music</Text>
            {userTracks.map((track) => (
              <View key={track.id} style={styles.userTrackContainer}>
                <TouchableOpacity
                  style={[
                    styles.trackCard,
                    currentTrack === track.id && styles.trackCardActive
                  ]}
                  onPress={() => playTrack(track)}
                >
                  <View style={[styles.trackIcon, { backgroundColor: track.color + '20' }]}>
                    <track.icon size={24} color={track.color} />
                  </View>
                  <View style={styles.trackContent}>
                    <Text style={styles.trackTitle}>{track.title}</Text>
                    <Text style={styles.trackDescription}>{track.description}</Text>
                  </View>
                  <View style={styles.trackAction}>
                    {currentTrack === track.id && isPlaying ? (
                      <Pause size={20} color={colors.primary} />
                    ) : (
                      <Play size={20} color={colors.textSecondary} />
                    )}
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteTrackButton}
                  onPress={() => deleteUserTrack(track.id)}
                >
                  <Trash2 size={16} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>🎵 Music Tips</Text>
          <Text style={styles.tipsText}>
            • Use ambient sounds during work or study sessions
          </Text>
          <Text style={styles.tipsText}>
            • Try meditation sounds for mindfulness practice
          </Text>
          <Text style={styles.tipsText}>
            • Ocean waves can help with sleep and relaxation
          </Text>
          <Text style={styles.tipsText}>
            • Add your own music files for a personalized experience
          </Text>
          <Text style={styles.tipsText}>
            • Adjust volume to a comfortable level for your environment
          </Text>
        </View>
      </ScrollView>

      {/* Add Track Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Music Track</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Track Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., My Favorite Song"
                placeholderTextColor={colors.textSecondary}
                value={newTrackTitle}
                onChangeText={setNewTrackTitle}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Describe this track..."
                placeholderTextColor={colors.textSecondary}
                value={newTrackDescription}
                onChangeText={setNewTrackDescription}
              />
            </View>

            <View style={styles.uploadInfo}>
              <Upload size={24} color={colors.primary} />
              <Text style={styles.uploadText}>
                {Platform.OS === 'web' 
                  ? 'On web, tracks will use generated tones. Use the mobile app to upload audio files.'
                  : 'Tap "Add Track" to select an audio file from your device.'
                }
              </Text>
            </View>

            <TouchableOpacity style={styles.addButton} onPress={addUserTrack}>
              <Plus size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add Track</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTrackButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
  },
  nowPlayingCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 24,
    marginTop: 24,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  nowPlayingTitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  nowPlayingContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nowPlayingTrack: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  playbackControls: {
    flexDirection: 'row',
    gap: 8,
  },
  pauseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  muteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  volumeCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 24,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
  },
  volumeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  volumeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  volumeButton: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    width: 30,
    textAlign: 'center',
  },
  volumeBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  volumeFill: {
    height: '100%',
    borderRadius: 3,
  },
  volumeText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  section: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  userTrackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  trackCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
  },
  trackCardActive: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  trackIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  trackContent: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  trackDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  trackAction: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteTrackButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  tipsCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 32,
    borderRadius: 16,
    padding: 20,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  tipsText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  uploadInfo: {
    flexDirection: 'row',
    backgroundColor: colors.primary + '20',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  uploadText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    marginLeft: 12,
    lineHeight: 20,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});