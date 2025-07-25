import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  RefreshControl,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/services/supabase';
import { Habit, HabitCompletion } from '@/types';
import { Plus, CircleCheck as CheckCircle, Circle, Target, TrendingUp, Calendar, X, Trash2 } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';

export default function HabitsScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitDescription, setNewHabitDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isMountedRef = useRef(true);

  const { colors } = useTheme();
  const { user, updatePoints } = useAuth();

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        fetchHabits();
        fetchTodayCompletions();
      }
    }, [user])
  );

  useEffect(() => {
    if (user) {
      fetchHabits();
      fetchTodayCompletions();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [user]);

  const fetchHabits = async () => {
    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (isMountedRef.current) {
        setHabits(data || []);
      }
    } catch (error) {
      console.error('Error fetching habits:', error);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  const fetchTodayCompletions = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('habit_completions')
        .select(`
          *,
          habits!inner(user_id)
        `)
        .eq('habits.user_id', user?.id)
        .gte('completed_at', `${today}T00:00:00`)
        .lt('completed_at', `${today}T23:59:59`);

      if (error) throw error;
      if (isMountedRef.current) {
        setCompletions(data || []);
      }
    } catch (error) {
      console.error('Error fetching completions:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchHabits();
    fetchTodayCompletions();
  };

  const addHabit = async () => {
    if (!newHabitTitle.trim()) {
      Alert.alert('Error', 'Please enter a habit title');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('habits')
        .insert({
          title: newHabitTitle.trim(),
          description: newHabitDescription.trim(),
          user_id: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      if (isMountedRef.current) {
        setHabits([data, ...habits]);
        setNewHabitTitle('');
        setNewHabitDescription('');
        setShowAddModal(false);
        Alert.alert('Success', 'Habit added successfully!');
      }
    } catch (error) {
      console.error('Error adding habit:', error);
      Alert.alert('Error', 'Failed to add habit');
    }
  };

  const deleteHabit = async (habitId: string) => {
    Alert.alert(
      'Delete Habit',
      'Are you sure you want to delete this habit? This will also remove all completion records.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // First delete all completions for this habit
              const { error: completionsError } = await supabase
                .from('habit_completions')
                .delete()
                .eq('habit_id', habitId);

              if (completionsError) throw completionsError;

              // Then delete the habit
              const { error: habitError } = await supabase
                .from('habits')
                .delete()
                .eq('id', habitId)
                .eq('user_id', user?.id);

              if (habitError) throw habitError;

              // Update local state immediately
              setHabits(prev => prev.filter(habit => habit.id !== habitId));
              setCompletions(prev => prev.filter(completion => completion.habit_id !== habitId));
              
              Alert.alert('Success', 'Habit deleted successfully!');
            } catch (error) {
              console.error('Error deleting habit:', error);
              Alert.alert('Error', 'Failed to delete habit');
            }
          },
        },
      ]
    );
  };

  const toggleHabitCompletion = async (habitId: string) => {
    const existingCompletion = completions.find(c => c.habit_id === habitId);

    if (existingCompletion) {
      // Remove completion
      try {
        const { error } = await supabase
          .from('habit_completions')
          .delete()
          .eq('id', existingCompletion.id);

        if (error) throw error;

        // Update local state immediately
        setCompletions(prev => prev.filter(c => c.id !== existingCompletion.id));
        await updatePoints(-10); // Deduct 10 points
      } catch (error) {
        console.error('Error removing completion:', error);
        Alert.alert('Error', 'Failed to remove completion');
      }
    } else {
      // Add completion
      try {
        const { data, error } = await supabase
          .from('habit_completions')
          .insert({
            habit_id: habitId,
            completed_at: new Date().toISOString(),
            points_earned: 10,
          })
          .select()
          .single();

        if (error) throw error;

        // Update local state immediately
        setCompletions(prev => [...prev, data]);
        await updatePoints(10); // Award 10 points
      } catch (error) {
        console.error('Error adding completion:', error);
        Alert.alert('Error', 'Failed to add completion');
      }
    }
  };

  const isHabitCompleted = (habitId: string) => {
    return completions.some(c => c.habit_id === habitId);
  };

  const getCompletionRate = () => {
    if (habits.length === 0) return 0;
    return Math.round((completions.length / habits.length) * 100);
  };

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Habits</Text>
          <Text style={styles.headerSubtitle}>Build better daily routines</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Target size={24} color={colors.primary} />
          <Text style={styles.statValue}>{habits.length}</Text>
          <Text style={styles.statLabel}>Total Habits</Text>
        </View>
        <View style={styles.statCard}>
          <TrendingUp size={24} color={colors.secondary} />
          <Text style={styles.statValue}>{getCompletionRate()}%</Text>
          <Text style={styles.statLabel}>Today's Progress</Text>
        </View>
        <View style={styles.statCard}>
          <Calendar size={24} color={colors.accent} />
          <Text style={styles.statValue}>{completions.length}</Text>
          <Text style={styles.statLabel}>Completed Today</Text>
        </View>
      </View>

      {/* Habits List */}
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {habits.map((habit) => (
          <View
            key={habit.id}
            style={[
              styles.habitCard,
              isHabitCompleted(habit.id) && styles.habitCompleted
            ]}
          >
            <TouchableOpacity
              style={styles.habitContent}
              onPress={() => toggleHabitCompletion(habit.id)}
            >
              {isHabitCompleted(habit.id) ? (
                <CheckCircle size={24} color={colors.secondary} />
              ) : (
                <Circle size={24} color={colors.textSecondary} />
              )}
              <View style={styles.habitText}>
                <Text style={[
                  styles.habitTitle,
                  isHabitCompleted(habit.id) && styles.habitTitleCompleted
                ]}>
                  {habit.title}
                </Text>
                {habit.description && (
                  <Text style={styles.habitDescription}>
                    {habit.description}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
            <View style={styles.habitActions}>
              <View style={styles.pointsBadge}>
                <Text style={styles.pointsText}>+10</Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteHabit(habit.id)}
              >
                <Trash2 size={16} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {habits.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Target size={48} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>No Habits Yet</Text>
            <Text style={styles.emptyDescription}>
              Create your first habit to start building better routines
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add Habit Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Habit</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={true}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Habit Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Drink 8 glasses of water"
                placeholderTextColor={colors.textSecondary}
                value={newHabitTitle}
                onChangeText={setNewHabitTitle}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Add more details about this habit..."
                placeholderTextColor={colors.textSecondary}
                value={newHabitDescription}
                onChangeText={setNewHabitDescription}
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity style={styles.createButton} onPress={addHabit}>
              <Text style={styles.createButtonText}>Create Habit</Text>
            </TouchableOpacity>
          </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  habitCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  habitCompleted: {
    backgroundColor: colors.secondary + '20',
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  habitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  habitText: {
    marginLeft: 12,
    flex: 1,
  },
  habitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  habitTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  habitDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  habitActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pointsBadge: {
    backgroundColor: colors.warning,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  deleteButton: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});