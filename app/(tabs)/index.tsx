import { View, Text, ScrollView, StyleSheet, Pressable, Image, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { User, Pill, Syringe, TriangleAlert, Plus, PawPrint, CircleCheck } from 'lucide-react-native';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { useHome } from '@/hooks/useHome';
import { useAuthStore } from '@/stores/auth';
import { format } from 'date-fns';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { ReminderWithPet, UpcomingRecord } from '@/hooks/useHome';

const TASK_ICON: Record<string, { icon: typeof Pill; bg: string; color: string }> = {
  meds: { icon: Pill, bg: Colors.amberLight, color: Colors.amber },
  vaccine: { icon: Syringe, bg: Colors.plumLight, color: Colors.plum },
  urgent: { icon: TriangleAlert, bg: Colors.coralLight, color: Colors.coral },
  medication: { icon: Pill, bg: Colors.amberLight, color: Colors.amber },
  vet_visit: { icon: Syringe, bg: Colors.sageLight, color: Colors.sage },
  symptom: { icon: TriangleAlert, bg: Colors.coralLight, color: Colors.coral },
  weight: { icon: Pill, bg: Colors.amberLight, color: Colors.amber },
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function getFirstName(fullName: string | undefined): string {
  if (!fullName) return 'there';
  return fullName.split(' ')[0];
}

function getTaskType(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes('vaccine') || lower.includes('vacc') || lower.includes('shot') || lower.includes('booster')) return 'vaccine';
  if (lower.includes('pill') || lower.includes('med') || lower.includes('dose') || lower.includes('treatment')) return 'medication';
  if (lower.includes('visit') || lower.includes('checkup') || lower.includes('check-up') || lower.includes('cleaning')) return 'vet_visit';
  return 'medication';
}

function formatReminderTime(remindAt: string): string {
  try {
    return format(new Date(remindAt), 'h:mm a');
  } catch {
    return '';
  }
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { pets, todayTasks, overdue, upcoming, loading, refresh } = useHome();
  const user = useAuthStore((s) => s.user);
  const firstName = getFirstName(user?.user_metadata?.full_name);

  const allTodayItems: Array<{ task: ReminderWithPet; isOverdue: boolean }> = [
    ...overdue.map((task) => ({ task, isOverdue: true })),
    ...todayTasks.map((task) => ({ task, isOverdue: false })),
  ];

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={Colors.terracotta}
            colors={[Colors.terracotta]}
          />
        }
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greetingSub}>{getGreeting()}</Text>
              <Text style={styles.greetingName}>{firstName}</Text>
            </View>
            <Pressable
              style={styles.avatar}
              onPress={() => router.push('/(tabs)/settings')}
            >
              <User size={20} color={Colors.terracotta} />
            </Pressable>
          </View>

          {/* Pet pills */}
          {pets.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.petsRow}>
              {pets.map((pet, i) => (
                <Pressable
                  key={pet.id}
                  style={[styles.petPill, i === 0 && styles.petPillActive]}
                  onPress={() => router.push(`/pet/${pet.id}`)}
                >
                  {pet.photo_url ? (
                    <Image source={{ uri: pet.photo_url }} style={styles.petAvatar} />
                  ) : (
                    <View style={[styles.petAvatar, styles.petAvatarFallback]}>
                      <PawPrint size={16} color={Colors.terracotta} />
                    </View>
                  )}
                  <Text style={styles.petName}>{pet.name}</Text>
                </Pressable>
              ))}
              <Pressable
                style={styles.petAdd}
                onPress={() => router.push('/(tabs)/add-record')}
              >
                <Plus size={14} color={Colors.textTertiary} />
              </Pressable>
            </ScrollView>
          ) : !loading ? (
            <Animated.View entering={FadeInDown.duration(400)} style={styles.emptyPets}>
              <View style={styles.emptyPetsIcon}>
                <PawPrint size={28} color={Colors.terracotta} />
              </View>
              <Text style={styles.emptyPetsTitle}>Add your first pet</Text>
              <Text style={styles.emptyPetsText}>
                Start tracking your pet's health by adding them to PawTrack.
              </Text>
              <Pressable
                style={styles.emptyPetsButton}
                onPress={() => router.push('/(tabs)/add-record')}
              >
                <Plus size={16} color={Colors.warmWhite} />
                <Text style={styles.emptyPetsButtonText}>Add Pet</Text>
              </Pressable>
            </Animated.View>
          ) : null}
        </View>

        {/* Today */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Today</Text>
            {allTodayItems.length > 0 && (
              <Pressable onPress={() => router.push('/(tabs)/alerts')}>
                <Text style={styles.sectionAction}>View all</Text>
              </Pressable>
            )}
          </View>

          {allTodayItems.length > 0 ? (
            allTodayItems.map(({ task, isOverdue }, index) => {
              const type = isOverdue ? 'urgent' : getTaskType(task.title);
              const config = TASK_ICON[type] ?? TASK_ICON.medication;
              const Icon = config.icon;

              return (
                <Animated.View
                  key={task.id}
                  entering={FadeInDown.duration(400).delay(index * 80)}
                >
                  <Pressable style={styles.taskRow}>
                    <View style={[styles.taskIcon, { backgroundColor: config.bg }]}>
                      <Icon size={20} color={config.color} />
                    </View>
                    <View style={styles.taskBody}>
                      <Text style={styles.taskName}>{task.title}</Text>
                      <Text style={styles.taskSub}>{task.pet_name}</Text>
                    </View>
                    <View style={[
                      styles.badge,
                      isOverdue ? styles.badgeOverdue : styles.badgeTime,
                    ]}>
                      <Text style={[
                        styles.badgeText,
                        isOverdue ? styles.badgeOverdueText : styles.badgeTimeText,
                      ]}>
                        {isOverdue ? 'Overdue' : formatReminderTime(task.remind_at)}
                      </Text>
                    </View>
                  </Pressable>
                </Animated.View>
              );
            })
          ) : !loading ? (
            <Animated.View entering={FadeInDown.duration(400)} style={styles.emptyToday}>
              <View style={styles.emptyTodayIcon}>
                <CircleCheck size={28} color={Colors.sage} />
              </View>
              <Text style={styles.emptyTodayTitle}>All clear!</Text>
              <Text style={styles.emptyTodayText}>No tasks for today</Text>
            </Animated.View>
          ) : null}
        </View>

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Upcoming</Text>
            </View>

            {upcoming.map((item, index) => {
              const dueDate = item.next_due_date ? new Date(item.next_due_date) : null;
              const month = dueDate ? format(dueDate, 'MMM') : '';
              const day = dueDate ? format(dueDate, 'dd') : '';

              return (
                <Animated.View
                  key={item.id}
                  entering={FadeInDown.duration(400).delay(index * 80)}
                >
                  <View style={styles.upcomingRow}>
                    <View style={styles.upcomingCal}>
                      <Text style={styles.calMonth}>{month}</Text>
                      <Text style={styles.calDay}>{day}</Text>
                    </View>
                    <View style={styles.upcomingBody}>
                      <Text style={styles.upcomingTitle}>{item.title}</Text>
                      <Text style={styles.upcomingDetail}>
                        {item.pet_name}
                        {item.vet_name ? ` -- ${item.vet_name}` : ''}
                        {item.vet_clinic ? ` -- ${item.vet_clinic}` : ''}
                      </Text>
                    </View>
                    {item.pet_photo ? (
                      <Image source={{ uri: item.pet_photo }} style={styles.upcomingPet} />
                    ) : (
                      <View style={[styles.upcomingPet, styles.upcomingPetFallback]}>
                        <PawPrint size={14} color={Colors.terracotta} />
                      </View>
                    )}
                  </View>
                </Animated.View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.sand },
  scroll: { flex: 1 },

  header: {
    backgroundColor: Colors.warmWhite,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  greetingSub: { fontSize: 13, fontWeight: '500', color: Colors.textTertiary },
  greetingName: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.terracottaLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petsRow: { gap: 10, paddingVertical: 2 },
  petPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingLeft: 6,
    paddingRight: 14,
    backgroundColor: Colors.sand,
    borderRadius: Radius.full,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  petPillActive: {
    backgroundColor: Colors.terracottaLight,
    borderColor: Colors.terracotta,
  },
  petAvatar: { width: 32, height: 32, borderRadius: 16 },
  petAvatarFallback: {
    backgroundColor: Colors.terracottaLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  petAdd: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },

  // Empty pets state
  emptyPets: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  emptyPetsIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.terracottaLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyPetsTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  emptyPetsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  emptyPetsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.terracotta,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    borderRadius: Radius.full,
  },
  emptyPetsButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.warmWhite,
  },

  section: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  sectionAction: { fontSize: 13, fontWeight: '600', color: Colors.terracotta },

  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: Colors.warmWhite,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
  },
  taskIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskBody: { flex: 1 },
  taskName: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  taskSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },

  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  badgeTime: { backgroundColor: Colors.sand },
  badgeOverdue: { backgroundColor: Colors.coralLight },
  badgeText: { fontSize: 11, fontWeight: '700' },
  badgeTimeText: { color: Colors.textSecondary },
  badgeOverdueText: { color: Colors.coral },

  // Empty today state
  emptyToday: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.warmWhite,
    borderRadius: Radius.md,
  },
  emptyTodayIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.sageLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  emptyTodayTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  emptyTodayText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },

  upcomingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    backgroundColor: Colors.warmWhite,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
  },
  upcomingCal: {
    width: 46,
    height: 50,
    borderRadius: Radius.sm,
    backgroundColor: Colors.terracottaLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calMonth: { fontSize: 10, fontWeight: '700', color: Colors.terracotta, textTransform: 'uppercase' },
  calDay: { fontSize: 22, fontWeight: '900', color: Colors.terracottaDark, lineHeight: 24 },
  upcomingBody: { flex: 1 },
  upcomingTitle: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  upcomingDetail: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  upcomingPet: { width: 28, height: 28, borderRadius: 14 },
  upcomingPetFallback: {
    backgroundColor: Colors.terracottaLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
