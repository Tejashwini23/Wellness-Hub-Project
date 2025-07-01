// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   Alert,
//   Platform,
//   Modal,
//   TextInput,
// } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Audio } from 'expo-av';
// import { useTheme } from '@/contexts/ThemeContext';
// import { useRouter } from 'expo-router';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import {
//   ArrowLeft,
//   Play,
//   Pause,
//   Volume2,
//   VolumeX,
//   Music,
//   Waves,
//   Wind,
//   Zap,
//   Heart,
//   Leaf,
//   Plus,
//   X,
//   Trash2,
// } from 'lucide-react-native';

// interface Track {
//   id: string;
//   title: string;
//   description: string;
//   icon: any;
//   color: string;
//   url: string;
//   isCustom?: boolean;
// }

// export default function MusicScreen() {
//   const [currentTrack, setCurrentTrack] = useState<string | null>(null);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [sound, setSound] = useState<Audio.Sound | null>(null);
//   const [volume, setVolume] = useState(0.7);
//   const [isMuted, setIsMuted] = useState(false);
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [newTrackTitle, setNewTrackTitle] = useState('');
//   const [newTrackUrl, setNewTrackUrl] = useState('');
//   const [customTracks, setCustomTracks] = useState<Track[]>([]);

//   const { colors } = useTheme();
//   const router = useRouter();

//   const defaultTracks: Track[] = [
//     {
//       id: 'rain',
//       title: 'Gentle Rain',
//       description: 'Soft rainfall sounds for relaxation',
//       icon: Waves,
//       color: colors.primary,
//       url: 'https://www.soundjay.com/misc/sounds/rain-01.wav',
//     },
//     {
//       id: 'forest',
//       title: 'Forest Ambience',
//       description: 'Birds chirping in a peaceful forest',
//       icon: Leaf,
//       color: colors.secondary,
//       url: 'https://www.soundjay.com/nature/sounds/forest-1.wav',
//     },
//     {
//       id: 'ocean',
//       title: 'Ocean Waves',
//       description: 'Calming ocean waves on the shore',
//       icon: Waves,
//       color: colors.accent,
//       url: 'https://www.soundjay.com/nature/sounds/ocean-1.wav',
//     },
//     {
//       id: 'wind',
//       title: 'Gentle Breeze',
//       description: 'Soft wind through the trees',
//       icon: Wind,
//       color: colors.warning,
//       url: 'https://www.soundjay.com/nature/sounds/wind-1.wav',
//     },
//     {
//       id: 'meditation',
//       title: 'Meditation Bell',
//       description: 'Tibetan singing bowl for meditation',
//       icon: Heart,
//       color: colors.error,
//       url: 'https://www.soundjay.com/misc/sounds/bell-1.wav',
//     },
//     {
//       id: 'focus',
//       title: 'Focus Tones',
//       description: 'Binaural beats for concentration',
//       icon: Zap,
//       color: '#9333EA',
//       url: 'https://www.soundjay.com/misc/sounds/tone-1.wav',
//     },
//   ];

//   const [tracks, setTracks] = useState<Track[]>(defaultTracks);

//   useEffect(() => {
//     loadCustomTracks();
//     return sound
//       ? () => {
//           sound.unloadAsync();
//         }
//       : undefined;
//   }, [sound]);

//   useEffect(() => {
//     setTracks([...defaultTracks, ...customTracks]);
//   }, [customTracks]);

//   const loadCustomTracks = async () => {
//     try {
//       const saved = await AsyncStorage.getItem('customMusicTracks');
//       if (saved) {
//         const parsed = JSON.parse(saved);
//         setCustomTracks(parsed);
//       }
//     } catch (error) {
//       console.error('Error loading custom tracks:', error);
//     }
//   };

//   const saveCustomTracks = async (tracks: Track[]) => {
//     try {
//       await AsyncStorage.setItem('customMusicTracks', JSON.stringify(tracks));
//     } catch (error) {
//       console.error('Error saving custom tracks:', error);
//     }
//   };

//   const addCustomTrack = async () => {
//     if (!newTrackTitle.trim()) {
//       Alert.alert('Error', 'Please enter a track title');
//       return;
//     }

//     if (!newTrackUrl.trim()) {
//       Alert.alert('Error', 'Please enter a track URL');
//       return;
//     }

//     // Basic URL validation
//     try {
//       new URL(newTrackUrl);
//     } catch {
//       Alert.alert('Error', 'Please enter a valid URL');
//       return;
//     }

//     const newTrack: Track = {
//       id: `custom_${Date.now()}`,
//       title: newTrackTitle.trim(),
//       description: 'Custom track',
//       icon: Music,
//       color: colors.primary,
//       url: newTrackUrl.trim(),
//       isCustom: true,
//     };

//     const updatedCustomTracks = [...customTracks, newTrack];
//     setCustomTracks(updatedCustomTracks);
//     await saveCustomTracks(updatedCustomTracks);

//     setNewTrackTitle('');
//     setNewTrackUrl('');
//     setShowAddModal(false);
//     Alert.alert('Success', 'Custom track added successfully!');
//   };

//   const deleteCustomTrack = async (trackId: string) => {
//     Alert.alert(
//       'Delete Track',
//       'Are you sure you want to delete this custom track?',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Delete',
//           style: 'destructive',
//           onPress: async () => {
//             const updatedCustomTracks = customTracks.filter(track => track.id !== trackId);
//             setCustomTracks(updatedCustomTracks);
//             await saveCustomTracks(updatedCustomTracks);
            
//             // Stop playing if this track is currently playing
//             if (currentTrack === trackId) {
//               await stopCurrentTrack();
//             }
//           },
//         },
//       ]
//     );
//   };

//   const playTrack = async (track: Track) => {
//     try {
//       // Stop current sound if playing
//       if (sound) {
//         await sound.unloadAsync();
//         setSound(null);
//       }

//       if (currentTrack === track.id && isPlaying) {
//         // If same track is playing, pause it
//         setIsPlaying(false);
//         setCurrentTrack(null);
//         return;
//       }

//       // For web, create a simple audio context tone for default tracks
//       if (Platform.OS === 'web' && !track.isCustom) {
//         playWebAudio(track);
//         setCurrentTrack(track.id);
//         setIsPlaying(true);
//         return;
//       }

//       // For mobile or custom tracks, try to load the audio file
//       const { sound: newSound } = await Audio.Sound.createAsync(
//         { uri: track.url },
//         { 
//           shouldPlay: true, 
//           isLooping: true, 
//           volume: isMuted ? 0 : volume,
//         }
//       );

//       setSound(newSound);
//       setCurrentTrack(track.id);
//       setIsPlaying(true);

//       // Set up playback status update
//       newSound.setOnPlaybackStatusUpdate((status) => {
//         if (status.isLoaded && !status.isPlaying && !status.didJustFinish) {
//           // Track stopped unexpectedly
//           setIsPlaying(false);
//           setCurrentTrack(null);
//         }
//       });

//     } catch (error) {
//       console.error('Error playing track:', error);
//       Alert.alert('Audio Error', 'Unable to play this track. Please check the URL or try again.');
      
//       // Fallback to web audio for default tracks
//       if (!track.isCustom && Platform.OS === 'web') {
//         playWebAudio(track);
//         setCurrentTrack(track.id);
//         setIsPlaying(true);
//       }
//     }
//   };

//   const playWebAudio = (track: Track) => {
//     try {
//       const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
//       const oscillator = audioContext.createOscillator();
//       const gainNode = audioContext.createGain();

//       oscillator.connect(gainNode);
//       gainNode.connect(audioContext.destination);

//       // Different frequencies for different tracks
//       const frequencies: Record<string, number> = {
//         rain: 200,
//         forest: 300,
//         ocean: 150,
//         wind: 250,
//         meditation: 432,
//         focus: 40, // Binaural beat base frequency
//       };

//       oscillator.frequency.setValueAtTime(frequencies[track.id] || 200, audioContext.currentTime);
//       oscillator.type = track.id === 'focus' ? 'sine' : 'triangle';

//       gainNode.gain.setValueAtTime(isMuted ? 0 : volume * 0.3, audioContext.currentTime);

//       oscillator.start();

//       // Store reference to stop later
//       (window as any).currentOscillator = oscillator;
//       (window as any).currentGainNode = gainNode;
//       (window as any).currentAudioContext = audioContext;
//     } catch (error) {
//       console.log('Web Audio not available');
//     }
//   };

//   const stopCurrentTrack = async () => {
//     if (sound) {
//       await sound.unloadAsync();
//       setSound(null);
//     }

//     // Stop web audio
//     if (Platform.OS === 'web') {
//       if ((window as any).currentOscillator) {
//         (window as any).currentOscillator.stop();
//         (window as any).currentOscillator = null;
//       }
//       if ((window as any).currentGainNode) {
//         (window as any).currentGainNode = null;
//       }
//       if ((window as any).currentAudioContext) {
//         (window as any).currentAudioContext.close();
//         (window as any).currentAudioContext = null;
//       }
//     }

//     setIsPlaying(false);
//     setCurrentTrack(null);
//   };

//   const toggleMute = async () => {
//     const newMuted = !isMuted;
//     setIsMuted(newMuted);

//     if (sound) {
//       await sound.setVolumeAsync(newMuted ? 0 : volume);
//     }

//     if (Platform.OS === 'web' && (window as any).currentGainNode) {
//       (window as any).currentGainNode.gain.setValueAtTime(
//         newMuted ? 0 : volume * 0.3,
//         (window as any).currentGainNode.context.currentTime
//       );
//     }
//   };

//   const adjustVolume = async (newVolume: number) => {
//     setVolume(newVolume);

//     if (!isMuted) {
//       if (sound) {
//         await sound.setVolumeAsync(newVolume);
//       }

//       if (Platform.OS === 'web' && (window as any).currentGainNode) {
//         (window as any).currentGainNode.gain.setValueAtTime(
//           newVolume * 0.3,
//           (window as any).currentGainNode.context.currentTime
//         );
//       }
//     }
//   };

//   const styles = createStyles(colors);

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <LinearGradient
//         colors={[colors.primary, colors.accent]}
//         style={styles.header}
//       >
//         <TouchableOpacity 
//           style={styles.backButton}
//           onPress={() => router.back()}
//         >
//           <ArrowLeft size={24} color="#FFFFFF" />
//         </TouchableOpacity>
        
//         <View style={styles.headerContent}>
//           <Music size={48} color="#FFFFFF" />
//           <Text style={styles.headerTitle}>Wellness Music</Text>
//           <Text style={styles.headerSubtitle}>Relax and focus with ambient sounds</Text>
//         </View>

//         <TouchableOpacity 
//           style={styles.addButton}
//           onPress={() => setShowAddModal(true)}
//         >
//           <Plus size={24} color="#FFFFFF" />
//         </TouchableOpacity>
//       </LinearGradient>

//       <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
//         {/* Current Playing */}
//         {currentTrack && (
//           <View style={styles.nowPlayingCard}>
//             <Text style={styles.nowPlayingTitle}>Now Playing</Text>
//             <View style={styles.nowPlayingContent}>
//               <Text style={styles.nowPlayingTrack}>
//                 {tracks.find(t => t.id === currentTrack)?.title}
//               </Text>
//               <View style={styles.playbackControls}>
//                 <TouchableOpacity
//                   style={styles.playButton}
//                   onPress={stopCurrentTrack}
//                 >
//                   <Pause size={24} color="#FFFFFF" />
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={styles.muteButton}
//                   onPress={toggleMute}
//                 >
//                   {isMuted ? (
//                     <VolumeX size={20} color={colors.textSecondary} />
//                   ) : (
//                     <Volume2 size={20} color={colors.primary} />
//                   )}
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>
//         )}

//         {/* Volume Control */}
//         <View style={styles.volumeCard}>
//           <Text style={styles.volumeTitle}>Volume Control</Text>
//           <View style={styles.volumeControls}>
//             <TouchableOpacity onPress={() => adjustVolume(Math.max(0, volume - 0.1))}>
//               <Text style={styles.volumeButton}>-</Text>
//             </TouchableOpacity>
//             <View style={styles.volumeBar}>
//               <View 
//                 style={[
//                   styles.volumeFill, 
//                   { width: `${volume * 100}%`, backgroundColor: colors.primary }
//                 ]} 
//               />
//             </View>
//             <TouchableOpacity onPress={() => adjustVolume(Math.min(1, volume + 0.1))}>
//               <Text style={styles.volumeButton}>+</Text>
//             </TouchableOpacity>
//           </View>
//           <Text style={styles.volumeText}>{Math.round(volume * 100)}%</Text>
//         </View>

//         {/* Track List */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Ambient Sounds</Text>
//           {tracks.map((track) => (
//             <View key={track.id} style={styles.trackContainer}>
//               <TouchableOpacity
//                 style={[
//                   styles.trackCard,
//                   currentTrack === track.id && styles.trackCardActive
//                 ]}
//                 onPress={() => playTrack(track)}
//               >
//                 <View style={[styles.trackIcon, { backgroundColor: track.color + '20' }]}>
//                   <track.icon size={24} color={track.color} />
//                 </View>
//                 <View style={styles.trackContent}>
//                   <Text style={styles.trackTitle}>{track.title}</Text>
//                   <Text style={styles.trackDescription}>{track.description}</Text>
//                   {track.isCustom && (
//                     <Text style={styles.trackUrl} numberOfLines={1}>{track.url}</Text>
//                   )}
//                 </View>
//                 <View style={styles.trackAction}>
//                   {currentTrack === track.id && isPlaying ? (
//                     <Pause size={20} color={colors.primary} />
//                   ) : (
//                     <Play size={20} color={colors.textSecondary} />
//                   )}
//                 </View>
//               </TouchableOpacity>
//               {track.isCustom && (
//                 <TouchableOpacity
//                   style={styles.deleteButton}
//                   onPress={() => deleteCustomTrack(track.id)}
//                 >
//                   <Trash2 size={16} color={colors.error} />
//                 </TouchableOpacity>
//               )}
//             </View>
//           ))}
//         </View>

//         {/* Tips */}
//         <View style={styles.tipsCard}>
//           <Text style={styles.tipsTitle}>🎵 Music Tips</Text>
//           <Text style={styles.tipsText}>
//             • Use ambient sounds during work or study sessions
//           </Text>
//           <Text style={styles.tipsText}>
//             • Try meditation sounds for mindfulness practice
//           </Text>
//           <Text style={styles.tipsText}>
//             • Ocean waves can help with sleep and relaxation
//           </Text>
//           <Text style={styles.tipsText}>
//             • Add your own music URLs for personalized playlists
//           </Text>
//         </View>
//       </ScrollView>

//       {/* Add Track Modal */}
//       <Modal
//         visible={showAddModal}
//         animationType="slide"
//         presentationStyle="pageSheet"
//       >
//         <View style={styles.modalContainer}>
//           <View style={styles.modalHeader}>
//             <Text style={styles.modalTitle}>Add Custom Track</Text>
//             <TouchableOpacity onPress={() => setShowAddModal(false)}>
//               <X size={24} color={colors.text} />
//             </TouchableOpacity>
//           </View>

//           <View style={styles.modalContent}>
//             <View style={styles.inputGroup}>
//               <Text style={styles.inputLabel}>Track Title *</Text>
//               <TextInput
//                 style={styles.input}
//                 placeholder="e.g., My Favorite Song"
//                 placeholderTextColor={colors.textSecondary}
//                 value={newTrackTitle}
//                 onChangeText={setNewTrackTitle}
//               />
//             </View>

//             <View style={styles.inputGroup}>
//               <Text style={styles.inputLabel}>Track URL *</Text>
//               <TextInput
//                 style={styles.input}
//                 placeholder="https://example.com/music.mp3"
//                 placeholderTextColor={colors.textSecondary}
//                 value={newTrackUrl}
//                 onChangeText={setNewTrackUrl}
//                 autoCapitalize="none"
//                 keyboardType="url"
//               />
//               <Text style={styles.inputNote}>
//                 Enter a direct link to an audio file (mp3, wav, etc.)
//               </Text>
//             </View>

//             <TouchableOpacity style={styles.addTrackButton} onPress={addCustomTrack}>
//               <Text style={styles.addTrackButtonText}>Add Track</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const createStyles = (colors: any) => StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.background,
//   },
//   header: {
//     paddingTop: 60,
//     paddingBottom: 32,
//     paddingHorizontal: 24,
//     position: 'relative',
//   },
//   backButton: {
//     position: 'absolute',
//     top: 60,
//     left: 24,
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   addButton: {
//     position: 'absolute',
//     top: 60,
//     right: 24,
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   headerContent: {
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   headerTitle: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#FFFFFF',
//     marginTop: 16,
//   },
//   headerSubtitle: {
//     fontSize: 16,
//     color: '#FFFFFF',
//     opacity: 0.8,
//     marginTop: 8,
//   },
//   scrollView: {
//     flex: 1,
//   },
//   nowPlayingCard: {
//     backgroundColor: colors.surface,
//     marginHorizontal: 24,
//     marginTop: 24,
//     borderRadius: 16,
//     padding: 20,
//     borderWidth: 2,
//     borderColor: colors.primary,
//   },
//   nowPlayingTitle: {
//     fontSize: 14,
//     color: colors.textSecondary,
//     marginBottom: 8,
//   },
//   nowPlayingContent: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   nowPlayingTrack: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: colors.text,
//     flex: 1,
//   },
//   playbackControls: {
//     flexDirection: 'row',
//     gap: 12,
//   },
//   playButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: colors.primary,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   muteButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: colors.background,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   volumeCard: {
//     backgroundColor: colors.surface,
//     marginHorizontal: 24,
//     marginTop: 16,
//     borderRadius: 16,
//     padding: 20,
//   },
//   volumeTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: colors.text,
//     marginBottom: 16,
//   },
//   volumeControls: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 16,
//   },
//   volumeButton: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: colors.primary,
//     width: 30,
//     textAlign: 'center',
//   },
//   volumeBar: {
//     flex: 1,
//     height: 6,
//     backgroundColor: colors.border,
//     borderRadius: 3,
//     overflow: 'hidden',
//   },
//   volumeFill: {
//     height: '100%',
//     borderRadius: 3,
//   },
//   volumeText: {
//     fontSize: 14,
//     color: colors.textSecondary,
//     textAlign: 'center',
//     marginTop: 8,
//   },
//   section: {
//     paddingHorizontal: 24,
//     marginTop: 32,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: colors.text,
//     marginBottom: 16,
//   },
//   trackContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   trackCard: {
//     flexDirection: 'row',
//     backgroundColor: colors.surface,
//     borderRadius: 12,
//     padding: 16,
//     alignItems: 'center',
//     flex: 1,
//   },
//   trackCardActive: {
//     borderWidth: 2,
//     borderColor: colors.primary,
//   },
//   trackIcon: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 16,
//   },
//   trackContent: {
//     flex: 1,
//   },
//   trackTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: colors.text,
//   },
//   trackDescription: {
//     fontSize: 14,
//     color: colors.textSecondary,
//     marginTop: 2,
//   },
//   trackUrl: {
//     fontSize: 12,
//     color: colors.textSecondary,
//     marginTop: 2,
//     fontStyle: 'italic',
//   },
//   trackAction: {
//     width: 40,
//     height: 40,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   deleteButton: {
//     width: 40,
//     height: 40,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginLeft: 8,
//   },
//   tipsCard: {
//     backgroundColor: colors.surface,
//     marginHorizontal: 24,
//     marginTop: 24,
//     marginBottom: 32,
//     borderRadius: 16,
//     padding: 20,
//   },
//   tipsTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: colors.text,
//     marginBottom: 12,
//   },
//   tipsText: {
//     fontSize: 14,
//     color: colors.text,
//     lineHeight: 20,
//     marginBottom: 8,
//   },
//   modalContainer: {
//     flex: 1,
//     backgroundColor: colors.background,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 24,
//     paddingTop: 60,
//     paddingBottom: 24,
//     borderBottomWidth: 1,
//     borderBottomColor: colors.border,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: colors.text,
//   },
//   modalContent: {
//     flex: 1,
//     padding: 24,
//   },
//   inputGroup: {
//     marginBottom: 24,
//   },
//   inputLabel: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: colors.text,
//     marginBottom: 8,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: colors.border,
//     borderRadius: 12,
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     fontSize: 16,
//     color: colors.text,
//     backgroundColor: colors.surface,
//   },
//   inputNote: {
//     fontSize: 12,
//     color: colors.textSecondary,
//     marginTop: 4,
//   },
//   addTrackButton: {
//     backgroundColor: colors.primary,
//     borderRadius: 12,
//     paddingVertical: 16,
//     alignItems: 'center',
//   },
//   addTrackButtonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });
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
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ArrowLeft,
  Play,
  Pause,
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
  Trash2,
} from 'lucide-react-native';

interface Track {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  url: string;
  isCustom?: boolean;
}

export default function MusicScreen() {
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTrackTitle, setNewTrackTitle] = useState('');
  const [newTrackUrl, setNewTrackUrl] = useState('');
  const [customTracks, setCustomTracks] = useState<Track[]>([]);

  const { colors } = useTheme();
  const router = useRouter();

  // Define default tracks using useCallback to prevent re-creation
  const defaultTracks: Track[] = useCallback([
    {
      id: 'rain',
      title: 'Gentle Rain',
      description: 'Soft rainfall sounds for relaxation',
      icon: Waves,
      color: colors.primary,
      url: 'https://www.soundjay.com/misc/sounds/rain-01.wav',
    },
    {
      id: 'forest',
      title: 'Forest Ambience',
      description: 'Birds chirping in a peaceful forest',
      icon: Leaf,
      color: colors.secondary, // Using colors.secondary
      url: 'https://www.soundjay.com/nature/sounds/forest-1.wav',
    },
    {
      id: 'ocean',
      title: 'Ocean Waves',
      description: 'Calming ocean waves on the shore',
      icon: Waves,
      color: colors.accent, // Using colors.accent
      url: 'https://www.soundjay.com/nature/sounds/ocean-1.wav',
    },
    {
      id: 'wind',
      title: 'Gentle Breeze',
      description: 'Soft wind through the trees',
      icon: Wind,
      color: colors.warning, // Using colors.warning
      url: 'https://www.soundjay.com/nature/sounds/wind-1.wav',
    },
    {
      id: 'meditation',
      title: 'Meditation Bell',
      description: 'Tibetan singing bowl for meditation',
      icon: Heart,
      color: colors.error, // Using colors.error
      url: 'https://www.soundjay.com/misc/sounds/bell-1.wav',
    },
    {
      id: 'focus',
      title: 'Focus Tones',
      description: 'Binaural beats for concentration',
      icon: Zap,
      color: colors.info, // Using colors.info or similar from your theme
      url: 'https://www.soundjay.com/misc/sounds/tone-1.wav', // Note: Binaural beats often require specific freq setups, simple tone might not work as intended.
    },
  ], [colors]); // colors is a dependency because track colors use it


  const [tracks, setTracks] = useState<Track[]>(defaultTracks()); // Initialize with default tracks

  // Effect to handle sound cleanup
  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  // Effect to update combined tracks when custom tracks change
  useEffect(() => {
    setTracks([...defaultTracks(), ...customTracks]);
  }, [customTracks, defaultTracks]); // defaultTracks is now a dependency because it's a dependency of the effect

  // Effect to load custom tracks on mount
  useEffect(() => {
    loadCustomTracks();
  }, []); // Empty dependency array means this runs once on mount

  const loadCustomTracks = async () => {
    try {
      const saved = await AsyncStorage.getItem('customMusicTracks');
      if (saved) {
        // Ensure parsed tracks have 'isCustom' set, as AsyncStorage might not preserve it
        const parsed: Track[] = JSON.parse(saved);
        const tracksWithCustomFlag = parsed.map(track => ({
          ...track,
          isCustom: true, // Ensure this flag is true for loaded custom tracks
          // Set a default icon and color if they weren't saved (though they should be if added correctly)
          icon: track.icon || Music, 
          color: track.color || colors.primary,
        }));
        setCustomTracks(tracksWithCustomFlag);
      }
    } catch (error) {
      console.error('Error loading custom tracks:', error);
      Alert.alert('Loading Error', 'Failed to load custom music tracks.');
    }
  };

  const saveCustomTracks = async (tracksToSave: Track[]) => {
    try {
      await AsyncStorage.setItem('customMusicTracks', JSON.stringify(tracksToSave));
    } catch (error) {
      console.error('Error saving custom tracks:', error);
      Alert.alert('Saving Error', 'Failed to save custom music tracks.');
    }
  };

  const addCustomTrack = async () => {
    const title = newTrackTitle.trim();
    const url = newTrackUrl.trim();

    if (!title) {
      Alert.alert('Error', 'Please enter a track title');
      return;
    }

    if (!url) {
      Alert.alert('Error', 'Please enter a track URL');
      return;
    }

    // Basic URL validation - doesn't guarantee it's an audio file, but checks format
    try {
      new URL(url);
    } catch {
      Alert.alert('Error', 'Please enter a valid URL format (e.g., https://...)');
      return;
    }
     // Simple check for common audio extensions (optional but can help)
     if (!/\.(mp3|wav|ogg|aac|m4a|flac)$/i.test(url)) {
        Alert.alert('Warning', 'The URL does not seem to end with a common audio file extension. It might not play.');
        // Continue anyway, let expo-av try
     }


    const newTrack: Track = {
      id: `custom_${Date.now()}`, // Use timestamp for unique ID
      title: title,
      description: 'Custom track', // Default description
      icon: Music, // Default icon for custom tracks
      color: colors.primary, // Default color for custom tracks
      url: url,
      isCustom: true,
    };

    const updatedCustomTracks = [...customTracks, newTrack];
    setCustomTracks(updatedCustomTracks);
    await saveCustomTracks(updatedCustomTracks);

    // Reset form and close modal
    setNewTrackTitle('');
    setNewTrackUrl('');
    setShowAddModal(false);
    Alert.alert('Success', `'${title}' added successfully!`);
  };

  const deleteCustomTrack = async (trackId: string) => {
    Alert.alert(
      'Delete Track',
      'Are you sure you want to delete this custom track?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // Stop playing if this track is currently playing
            if (currentTrack === trackId) {
              await stopCurrentTrack();
            }
            
            const updatedCustomTracks = customTracks.filter(track => track.id !== trackId);
            setCustomTracks(updatedCustomTracks);
            await saveCustomTracks(updatedCustomTracks);
          },
        },
      ]
    );
  };

  const playTrack = async (track: Track) => {
    try {
      // If the clicked track is already the current track...
      if (currentTrack === track.id) {
        if (sound) {
          // Toggle play/pause for the current sound
          if (isPlaying) {
            await sound.pauseAsync();
          } else {
            await sound.playAsync();
          }
          setIsPlaying(!isPlaying);
        } else {
           // If currentTrack is set but sound is null (e.g., stopped unexpectedly),
           // treat this as playing the track anew.
           setCurrentTrack(null); // Reset currentTrack state to trigger new load below
           playTrack(track); // Re-call playTrack to load/play
        }
      } else {
        // If a different track is clicked or no track is playing...
        // Stop current sound if any is playing
        if (sound) {
          await sound.unloadAsync();
          setSound(null);
        }

        // Load and play the new track
        console.log('Attempting to load and play:', track.url);
        const { sound: newSound, status } = await Audio.Sound.createAsync(
          { uri: track.url },
          {
            shouldPlay: true,
            isLooping: true,
            volume: isMuted ? 0 : volume, // Apply current volume/mute state
          },
          (playbackStatus) => {
             // Optional: Listen for playback status updates
             if (playbackStatus.isLoaded && !playbackStatus.isPlaying && playbackStatus.didJustFinish) {
               // Playback finished (if not looping), or stopped unexpectedly
               console.log(`Playback finished for ${track.title}`);
               // If you want it to stop and reset when done (and not looping):
               // setIsPlaying(false);
               // setCurrentTrack(null);
               // setSound(null);
             } else if (playbackStatus.isLoaded && playbackStatus.isPlaying) {
                // console.log(`Playback is playing for ${track.title}`);
             } else if (!playbackStatus.isLoaded) {
                console.log(`Playback failed to load for ${track.title}`);
                setIsPlaying(false);
                setCurrentTrack(null);
                setSound(null); // Clear sound state on error
                Alert.alert('Audio Error', `Unable to play "${track.title}". It might be an invalid or inaccessible URL.`);
             }
          }
        );

        // Check initial status for potential errors immediately
        if (status.isLoaded && status.isPlaying) {
            setSound(newSound);
            setCurrentTrack(track.id);
            setIsPlaying(true);
            console.log(`Playing: ${track.title}`);
        } else if (!status.isLoaded) {
             // Handle load errors that happen immediately
             console.error(`Failed to load sound for ${track.title}`, status.error);
             setSound(null); // Ensure sound state is null on load error
             setCurrentTrack(null);
             setIsPlaying(false);
             Alert.alert('Audio Error', `Failed to load "${track.title}". Check the URL or try again.`);
        }
      }
    } catch (error) {
      console.error('Error in playTrack:', error);
      setSound(null); // Clear sound state on error
      setCurrentTrack(null);
      setIsPlaying(false);
      Alert.alert('Audio Error', `An unexpected error occurred while trying to play this track: ${error.message}`);
    }
  };
  
  // Function specifically for the Now Playing section's button to toggle play/pause
  const togglePlayPauseNowPlaying = async () => {
      if (!sound) return; // Can't toggle if no sound is loaded

      try {
          if (isPlaying) {
              await sound.pauseAsync();
              console.log('Paused current track');
          } else {
              await sound.playAsync();
              console.log('Played current track');
          }
          setIsPlaying(!isPlaying);
      } catch (error) {
          console.error('Error toggling play/pause:', error);
          Alert.alert('Playback Error', 'Could not toggle play/pause for the current track.');
      }
  };


  const stopCurrentTrack = async () => {
    if (sound) {
      console.log('Stopping current track');
      try {
        await sound.unloadAsync();
      } catch (error) {
         console.error('Error unloading sound:', error);
      } finally {
        setSound(null);
        setCurrentTrack(null);
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = async () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);

    if (sound) {
      try {
         await sound.setVolumeAsync(newMuted ? 0 : volume);
         console.log('Volume set to', newMuted ? 0 : volume);
      } catch (error) {
         console.error('Error setting mute/volume:', error);
      }
    }
  };

  const adjustVolume = async (newVolume: number) => {
    // Clamp volume between 0 and 1
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);

    // Only adjust sound volume if not muted
    if (!isMuted && sound) {
       try {
         await sound.setVolumeAsync(clampedVolume);
         console.log('Volume adjusted to', clampedVolume);
       } catch (error) {
         console.error('Error adjusting volume:', error);
       }
    }
  };

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.accent]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            // Optionally stop music when navigating back
            // stopCurrentTrack();
            router.back();
          }}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Music size={48} color="#FFFFFF" />
          <Text style={styles.headerTitle}>Wellness Music</Text>
          <Text style={styles.headerSubtitle}>Relax and focus with ambient sounds</Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Current Playing - Only show if a track is selected */}
        {currentTrack !== null && (
          <View style={styles.nowPlayingCard}>
            <Text style={styles.nowPlayingTitle}>Now Playing</Text>
            <View style={styles.nowPlayingContent}>
              <Text style={styles.nowPlayingTrack} numberOfLines={1}>
                {tracks.find(t => t.id === currentTrack)?.title || 'Unknown Track'}
              </Text>
              <View style={styles.playbackControls}>
                {/* Button to toggle Play/Pause for the current track */}
                <TouchableOpacity
                  style={styles.playButton}
                  onPress={togglePlayPauseNowPlaying} // Use dedicated toggle function
                >
                  {isPlaying ? (
                    <Pause size={24} color="#FFFFFF" />
                  ) : (
                    <Play size={24} color="#FFFFFF" />
                  )}
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
            <TouchableOpacity onPress={() => adjustVolume(volume - 0.1)}>
              <Text style={styles.volumeButton}>-</Text>
            </TouchableOpacity>
            {/* Basic Visual Volume Bar (not interactive slider) */}
            <View style={styles.volumeBar}>
              <View
                style={[
                  styles.volumeFill,
                  { width: `${volume * 100}%`, backgroundColor: colors.primary }
                ]}
              />
            </View>
            <TouchableOpacity onPress={() => adjustVolume(volume + 0.1)}>
              <Text style={styles.volumeButton}>+</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.volumeText}>{Math.round(volume * 100)}%</Text>
        </View>

        {/* Track List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ambient Sounds</Text>
          {tracks.map((track) => (
            <View key={track.id} style={styles.trackContainer}>
              <TouchableOpacity
                style={[
                  styles.trackCard,
                  currentTrack === track.id && styles.trackCardActive
                ]}
                onPress={() => playTrack(track)} // Use the main playTrack function for list items
                activeOpacity={0.8}
              >
                <View style={[styles.trackIcon, { backgroundColor: track.color + '20' }]}>
                  {/* Render the icon component */}
                  {track.icon && React.createElement(track.icon, { size: 24, color: track.color })}
                </View>
                <View style={styles.trackContent}>
                  <Text style={styles.trackTitle} numberOfLines={1}>{track.title}</Text>
                  <Text style={styles.trackDescription} numberOfLines={1}>{track.description}</Text>
                  {track.isCustom && (
                    <Text style={styles.trackUrl} numberOfLines={1}>{track.url}</Text>
                  )}
                </View>
                <View style={styles.trackAction}>
                  {/* Show Play or Pause icon based on state */}
                  {currentTrack === track.id && isPlaying ? (
                    <Pause size={20} color={colors.primary} />
                  ) : (
                    <Play size={20} color={colors.textSecondary} />
                  )}
                </View>
              </TouchableOpacity>
              {track.isCustom && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteCustomTrack(track.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Make it easier to press
                >
                  <Trash2 size={18} color={colors.error} />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>🎵 Music Tips</Text>
          <Text style={styles.tipsText}>
            • Tap a track to play or pause it.
          </Text>
           <Text style={styles.tipsText}>
            • Add custom tracks using direct audio file URLs.
          </Text>
          <Text style={styles.tipsText}>
            • Adjust volume using the controls above.
          </Text>
           <Text style={styles.tipsText}>
            • Use ambient sounds for focus or relaxation.
          </Text>
        </View>
         {/* Spacer for bottom */}
        <View style={{ height: 50 }} />
      </ScrollView>

      {/* Add Track Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet" // iOS style
        onRequestClose={() => setShowAddModal(false)} // Android back button handling
        transparent={true} // Use transparent background for more customization if needed
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Custom Track</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Track Title <Text style={{ color: colors.error }}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., My Favorite Song"
                  placeholderTextColor={colors.textSecondary}
                  value={newTrackTitle}
                  onChangeText={setNewTrackTitle}
                  returnKeyType="next"
                  onSubmitEditing={() => { /* Focus next input */ }}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Track URL <Text style={{ color: colors.error }}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://example.com/music.mp3"
                  placeholderTextColor={colors.textSecondary}
                  value={newTrackUrl}
                  onChangeText={setNewTrackUrl}
                  autoCapitalize="none"
                  keyboardType="url"
                  returnKeyType="done"
                  onSubmitEditing={addCustomTrack}
                />
                <Text style={styles.inputNote}>
                  Enter a direct link to an audio file (mp3, wav, ogg, etc.). URLs that require authentication or are not direct file links may not work.
                </Text>
              </View>

              <TouchableOpacity style={styles.addTrackButton} onPress={addCustomTrack}>
                <Text style={styles.addTrackButtonText}>Add Track</Text>
              </TouchableOpacity>
               {/* Add some padding at the bottom if keyboard might cover inputs */}
              <View style={{ height: Platform.OS === 'ios' ? 0 : 100 }} /> 
            </ScrollView>
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
    paddingTop: 60, // Adjust for status bar
    paddingBottom: 32,
    paddingHorizontal: 24,
    position: 'relative',
    // Ensure content is below the absolute buttons
    paddingLeft: 60, // Make space for back button
    paddingRight: 60, // Make space for add button
  },
  backButton: {
    position: 'absolute',
    top: 60, // Adjust for status bar
    left: 20, // Slightly smaller margin
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1, // Ensure button is tappable
  },
  addButton: {
    position: 'absolute',
    top: 60, // Adjust for status bar
    right: 20, // Slightly smaller margin
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1, // Ensure button is tappable
  },
  headerContent: {
    alignItems: 'center',
    // marginTop: 20, // Adjusted padding top on header instead
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    textAlign: 'center', // Center text
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9, // Slightly less transparent
    marginTop: 8,
    textAlign: 'center', // Center text
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
    borderWidth: 1, // Use border width 1 for consistency
    borderColor: colors.primary,
  },
  nowPlayingTitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    fontWeight: '600',
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
    flex: 1, // Allow text to take space
    marginRight: 12, // Space between text and controls
  },
  playbackControls: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center', // Vertically align buttons
  },
  playButton: {
    width: 44, // Slightly larger button
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  muteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background, // Use background color
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1, // Add a border
    borderColor: colors.border,
  },
  volumeCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 24,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1, // Consistent border
    borderColor: colors.border, // Use border color
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
    fontSize: 20, // Slightly smaller font
    fontWeight: 'bold',
    color: colors.primary,
    width: 30,
    textAlign: 'center',
  },
  volumeBar: {
    flex: 1,
    height: 8, // Slightly thicker bar
    backgroundColor: colors.border,
    borderRadius: 4, // Match height/2
    overflow: 'hidden',
  },
  volumeFill: {
    height: '100%',
    borderRadius: 4,
  },
  volumeText: {
    fontSize: 14,
    color: colors.textSecondary,
    width: 40, // Give it fixed width
    textAlign: 'center',
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
  trackContainer: {
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
    borderWidth: 1, // Default border
    borderColor: colors.surface, // Border matches background by default
  },
  trackCardActive: {
    borderColor: colors.primary, // Active border color
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
    justifyContent: 'center', // Vertically center content
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  trackDescription: {
    fontSize: 13, // Slightly smaller description
    color: colors.textSecondary,
    marginTop: 2,
  },
  trackUrl: {
    fontSize: 11, // Smaller URL text
    color: colors.textSecondary,
    marginTop: 2,
    fontStyle: 'italic',
  },
  trackAction: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8, // Space between content and icon
  },
  deleteButton: {
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
    borderWidth: 1, // Consistent border
    borderColor: colors.border,
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
    marginBottom: 6, // Smaller margin bottom
  },
   modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    justifyContent: 'flex-end', // Position modal at bottom
  },
  modalContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden', // Clip content to rounded corners
    // Adjust height as needed, or let content define it
    maxHeight: '90%', // Limit modal height
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20, // Smaller top padding
    paddingBottom: 16, // Smaller bottom padding
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalContent: {
    padding: 24,
    // flexGrow: 1, // Allow scroll view content to grow
  },
  inputGroup: {
    marginBottom: 20, // Smaller margin bottom
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
    minHeight: 48, // Ensure minimum height
  },
  inputNote: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 6, // Slightly larger margin top
    lineHeight: 16,
  },
  addTrackButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16, // Space above button
  },
  addTrackButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});