import { View, Text, ScrollView, StyleSheet, Pressable, Image, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import {
  User, Pill, Syringe, TriangleAlert, Plus, PawPrint, CircleCheck,
  Heart, Shield, Calendar, Bell, Stethoscope, ClipboardList,
} from 'lucide-react-native';
import Svg, { Ellipse } from 'react-native-svg';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { useHome } from '@/hooks/useHome';
import { useAuthStore } from '@/stores/auth';
import { format } from 'date-fns';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import type { ReminderWithPet, UpcomingRecord } from '@/hooks/useHome';

const TASK_ICON: Record<string, { icon: typeof Pill; bg: string; color: string }> = {
  meds: { icon: Pill, bg: Colors.amberLight, color: Colors.amber },
  vaccine: { icon: Syringe, bg: Colors.plumLight, color: Colors.plum },
  urgent: { icon: TriangleAlert, bg: Colors.coralLight, color: Colors.coral },
  medication: { icon: Pill, bg: Colors.amberLight, color: Colors.amber },
  vet_visit: { icon: Stethoscope, bg: Colors.sageLight, color: Colors.sage },
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

function PawSvg({ size = 20, color = Colors.terracotta }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Ellipse cx="35" cy="22" rx="13" ry="15" fill={color} rotation={-12} origin="35,22" />
      <Ellipse cx="65" cy="22" rx="13" ry="15" fill={color} rotation={12} origin="65,22" />
      <Ellipse cx="20" cy="50" rx="11" ry="13" fill={color} rotation={-25} origin="20,50" />
      <Ellipse cx="80" cy="50" rx="11" ry="13" fill={color} rotation={25} origin="80,50" />
      <Ellipse cx="50" cy="68" rx="24" ry="21" fill={color} />
    </Svg>
  );
}

const QUICK_ACTIONS = [
  { key: 'vaccine', label: 'Vaccine', icon: Syringe, bg: Colors.plumLight, color: Colors.plum },
  { key: 'medication', label: 'Meds', icon: Pill, bg: Colors.amberLight, color: Colors.amber },
  { key: 'vet_visit', label: 'Vet Visit', icon: Stethoscope, bg: Colors.sageLight, color: Colors.sage },
  { key: 'weight', label: 'Weight', icon: ClipboardList, bg: Colors.terracottaLight, color: Colors.terracotta },
];

const TIPS = [
  { title: 'Vaccines up to date?', desc: 'Most dogs need DHPP and Rabies annually.', icon: Shield, bg: Colors.plumLight, color: Colors.plum },
  { title: 'Heartworm season', desc: 'Monthly prevention is key from spring to fall.', icon: Heart, bg: Colors.coralLight, color: Colors.coral },
  { title: 'Schedule a checkup', desc: 'Annual vet visits catch issues early.', icon: Calendar, bg: Colors.sageLight, color: Colors.sage },
];

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

  const hasPets = pets.length > 0;

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={Colors.terracotta}
            colors={[Colors.terracotta]}
          />
        }
      >
        {/* Header with rounded bottom */}
        <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
          {/* Decorative paw prints */}
          <View style={styles.headerDecoration}>
            <View style={{ opacity: 0.06, position: 'absolute', top: -10, right: -5 }}>
              <PawSvg size={80} color={Colors.terracotta} />
            </View>
            <View style={{ opacity: 0.04, position: 'absolute', top: 40, right: 60 }}>
              <PawSvg size={40} color={Colors.terracotta} />
            </View>
          </View>

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
          {hasPets ? (
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
                onPress={() => router.push('/pet/add')}
              >
                <Plus size={14} color={Colors.textTertiary} />
              </Pressable>
            </ScrollView>
          ) : null}
        </View>

        {/* ============================================ */}
        {/* EMPTY STATE — No pets yet                    */}
        {/* ============================================ */}
        {!hasPets && !loading ? (
          <>
            {/* Welcome hero card */}
            <Animated.View entering={FadeInDown.duration(500).delay(100)} style={styles.welcomeCard}>
              <View style={styles.welcomeIconRow}>
                <View style={styles.welcomePawCircle}>
                  <PawSvg size={36} color={Colors.terracotta} />
                </View>
              </View>
              <Text style={styles.welcomeTitle}>Welcome to PawTrack</Text>
              <Text style={styles.welcomeDesc}>
                Keep all your pet's health records in one place. Start by adding your first furry friend.
              </Text>
              <Pressable
                style={styles.welcomeButton}
                onPress={() => router.push('/pet/add')}
              >
                <PawPrint size={18} color={Colors.warmWhite} />
                <Text style={styles.welcomeButtonText}>Add Your Pet</Text>
              </Pressable>
            </Animated.View>

            {/* Quick actions preview */}
            <Animated.View entering={FadeInDown.duration(500).delay(250)}>
              <View style={styles.section}>
                <View style={styles.sectionHead}>
                  <Text style={styles.sectionTitle}>Quick Actions</Text>
                </View>
                <View style={styles.quickGrid}>
                  {QUICK_ACTIONS.map((action) => {
                    const Icon = action.icon;
                    return (
                      <Pressable
                        key={action.key}
                        style={styles.quickCard}
                        onPress={() => router.push('/pet/add')}
                      >
                        <View style={[styles.quickIcon, { backgroundColor: action.bg }]}>
                          <Icon size={20} color={action.color} />
                        </View>
                        <Text style={styles.quickLabel}>{action.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </Animated.View>

            {/* Health tips */}
            <Animated.View entering={FadeInDown.duration(500).delay(400)}>
              <View style={styles.section}>
                <View style={styles.sectionHead}>
                  <Text style={styles.sectionTitle}>Pet Health Tips</Text>
                </View>
                {TIPS.map((tip, i) => {
                  const Icon = tip.icon;
                  return (
                    <View key={i} style={styles.tipCard}>
                      <View style={[styles.tipIcon, { backgroundColor: tip.bg }]}>
                        <Icon size={18} color={tip.color} />
                      </View>
                      <View style={styles.tipBody}>
                        <Text style={styles.tipTitle}>{tip.title}</Text>
                        <Text style={styles.tipDesc}>{tip.desc}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </Animated.View>

            {/* Features showcase */}
            <Animated.View entering={FadeInDown.duration(500).delay(550)}>
              <View style={styles.section}>
                <View style={styles.sectionHead}>
                  <Text style={styles.sectionTitle}>What you can do</Text>
                </View>
                <View style={styles.featureRow}>
                  <View style={styles.featureCard}>
                    <Syringe size={22} color={Colors.plum} />
                    <Text style={styles.featureTitle}>Track Vaccines</Text>
                    <Text style={styles.featureDesc}>Never miss a booster shot</Text>
                  </View>
                  <View style={styles.featureCard}>
                    <Bell size={22} color={Colors.amber} />
                    <Text style={styles.featureTitle}>Reminders</Text>
                    <Text style={styles.featureDesc}>Get alerts for due dates</Text>
                  </View>
                </View>
                <View style={styles.featureRow}>
                  <View style={styles.featureCard}>
                    <ClipboardList size={22} color={Colors.sage} />
                    <Text style={styles.featureTitle}>Health History</Text>
                    <Text style={styles.featureDesc}>Full timeline for your vet</Text>
                  </View>
                  <View style={styles.featureCard}>
                    <Heart size={22} color={Colors.coral} />
                    <Text style={styles.featureTitle}>Weight Tracking</Text>
                    <Text style={styles.featureDesc}>Monitor their health</Text>
                  </View>
                </View>
              </View>
            </Animated.View>
          </>
        ) : (
          <>
            {/* ============================================ */}
            {/* WITH DATA — Today + Upcoming                 */}
            {/* ============================================ */}

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
                    <CircleCheck size={24} color={Colors.sage} />
                  </View>
                  <View>
                    <Text style={styles.emptyTodayTitle}>All clear!</Text>
                    <Text style={styles.emptyTodayText}>No tasks for today</Text>
                  </View>
                </Animated.View>
              ) : null}
            </View>

            {/* Quick Actions */}
            <Animated.View entering={FadeInDown.duration(400).delay(200)}>
              <View style={styles.section}>
                <View style={styles.sectionHead}>
                  <Text style={styles.sectionTitle}>Quick Add</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                  {QUICK_ACTIONS.map((action) => {
                    const Icon = action.icon;
                    return (
                      <Pressable
                        key={action.key}
                        style={styles.quickChip}
                        onPress={() => router.push('/(tabs)/add-record')}
                      >
                        <View style={[styles.quickChipIcon, { backgroundColor: action.bg }]}>
                          <Icon size={16} color={action.color} />
                        </View>
                        <Text style={styles.quickChipLabel}>{action.label}</Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            </Animated.View>

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
                            {item.vet_name ? ` — ${item.vet_name}` : ''}
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

            {/* Tips when has data but few records */}
            {upcoming.length === 0 && allTodayItems.length === 0 && (
              <Animated.View entering={FadeInDown.duration(400).delay(300)}>
                <View style={styles.section}>
                  <View style={styles.sectionHead}>
                    <Text style={styles.sectionTitle}>Pet Health Tips</Text>
                  </View>
                  {TIPS.slice(0, 2).map((tip, i) => {
                    const Icon = tip.icon;
                    return (
                      <View key={i} style={styles.tipCard}>
                        <View style={[styles.tipIcon, { backgroundColor: tip.bg }]}>
                          <Icon size={18} color={tip.color} />
                        </View>
                        <View style={styles.tipBody}>
                          <Text style={styles.tipTitle}>{tip.title}</Text>
                          <Text style={styles.tipDesc}>{tip.desc}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </Animated.View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.sand },
  scroll: { flex: 1 },

  /* ============================== */
  /* HEADER with overlapping bottom */
  /* ============================== */
  header: {
    backgroundColor: Colors.warmWhite,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    position: 'relative',
    overflow: 'hidden',
    // Shadow to emphasize the overlap
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: -8,
    zIndex: 10,
  },
  headerDecoration: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 140,
    height: 140,
    zIndex: 0,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    zIndex: 1,
  },
  greetingSub: { fontSize: 13, fontWeight: '500', color: Colors.textTertiary, letterSpacing: 0.3 },
  greetingName: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, marginTop: 2 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.terracottaLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  petsRow: { gap: 10, paddingVertical: 2, zIndex: 1 },
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

  /* ============================== */
  /* WELCOME CARD (empty state)     */
  /* ============================== */
  welcomeCard: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg + 8,
    backgroundColor: Colors.warmWhite,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  welcomeIconRow: {
    marginBottom: Spacing.md,
  },
  welcomePawCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.terracottaLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.warmWhite,
    shadowColor: Colors.terracotta,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  welcomeDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
    maxWidth: 260,
  },
  welcomeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.terracotta,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: Radius.md,
    shadowColor: Colors.terracotta,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  welcomeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.warmWhite,
  },

  /* ============================== */
  /* QUICK ACTIONS (empty state)    */
  /* ============================== */
  quickGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  quickCard: {
    flex: 1,
    backgroundColor: Colors.warmWhite,
    borderRadius: Radius.md,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  quickIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },

  /* Quick chips (with data state) */
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.warmWhite,
    paddingVertical: 10,
    paddingLeft: 10,
    paddingRight: 16,
    borderRadius: Radius.full,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  quickChipIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickChipLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },

  /* ============================== */
  /* TIPS                           */
  /* ============================== */
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.warmWhite,
    borderRadius: Radius.md,
    padding: 16,
    marginBottom: Spacing.sm,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipBody: { flex: 1 },
  tipTitle: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  tipDesc: { fontSize: 13, color: Colors.textSecondary, marginTop: 2, lineHeight: 18 },

  /* ============================== */
  /* FEATURES SHOWCASE              */
  /* ============================== */
  featureRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  featureCard: {
    flex: 1,
    backgroundColor: Colors.warmWhite,
    borderRadius: Radius.md,
    padding: 18,
    gap: 6,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  featureDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },

  /* ============================== */
  /* SECTIONS                       */
  /* ============================== */
  section: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  sectionAction: { fontSize: 13, fontWeight: '600', color: Colors.terracotta },

  /* ============================== */
  /* TASK ROWS                      */
  /* ============================== */
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: Colors.warmWhite,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
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

  /* ============================== */
  /* EMPTY TODAY                    */
  /* ============================== */
  emptyToday: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 20,
    paddingHorizontal: 18,
    backgroundColor: Colors.warmWhite,
    borderRadius: Radius.md,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyTodayIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.sageLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTodayTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  emptyTodayText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 1,
  },

  /* ============================== */
  /* UPCOMING                       */
  /* ============================== */
  upcomingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    backgroundColor: Colors.warmWhite,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  upcomingCal: {
    width: 46,
    height: 50,
    borderRadius: Radius.sm,
    backgroundColor: Colors.terracottaLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calMonth: { fontSize: 10, fontWeight: '700', color: Colors.terracotta, textTransform: 'uppercase', letterSpacing: 0.5 },
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
