import { View, Text, ScrollView, StyleSheet, Pressable, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { User, Pill, Syringe, TriangleAlert, Plus } from 'lucide-react-native';
import { Colors, Spacing, Radius } from '@/constants/theme';

const MOCK_PETS = [
  { id: '1', name: 'Max', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=100&h=100&fit=crop&crop=face' },
  { id: '2', name: 'Luna', image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=100&h=100&fit=crop&crop=face' },
  { id: '3', name: 'Buddy', image: 'https://images.unsplash.com/photo-1596854407944-bf87f6fcebc4?w=100&h=100&fit=crop&crop=face' },
];

const MOCK_TASKS = [
  { id: '1', title: 'Heartworm Pill', sub: 'Max — Monthly dose', type: 'meds' as const, time: '8:00 AM' },
  { id: '2', title: 'Rabies Vaccine', sub: 'Luna — Annual booster', type: 'vaccine' as const, time: '2:30 PM' },
  { id: '3', title: 'Flea Treatment', sub: 'Max — 3 days overdue', type: 'urgent' as const, time: 'Overdue' },
];

const MOCK_UPCOMING = [
  { id: '1', title: 'Annual Checkup', detail: 'Dr. Miller — City Vet Clinic', month: 'May', day: '12', petImage: MOCK_PETS[0].image },
  { id: '2', title: 'DHPP Vaccine', detail: 'Buddy — Booster shot', month: 'May', day: '20', petImage: MOCK_PETS[2].image },
  { id: '3', title: 'Dental Cleaning', detail: 'Luna — Scheduled procedure', month: 'Jun', day: '03', petImage: MOCK_PETS[1].image },
];

const TASK_ICON: Record<string, { icon: typeof Pill; bg: string; color: string }> = {
  meds: { icon: Pill, bg: Colors.amberLight, color: Colors.amber },
  vaccine: { icon: Syringe, bg: Colors.plumLight, color: Colors.plum },
  urgent: { icon: TriangleAlert, bg: Colors.coralLight, color: Colors.coral },
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greetingSub}>Good morning</Text>
              <Text style={styles.greetingName}>Sarah</Text>
            </View>
            <View style={styles.avatar}>
              <User size={20} color={Colors.terracotta} />
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.petsRow}>
            {MOCK_PETS.map((pet, i) => (
              <Pressable key={pet.id} style={[styles.petPill, i === 0 && styles.petPillActive]}>
                <Image source={{ uri: pet.image }} style={styles.petAvatar} />
                <Text style={styles.petName}>{pet.name}</Text>
              </Pressable>
            ))}
            <View style={styles.petAdd}>
              <Plus size={14} color={Colors.textTertiary} />
            </View>
          </ScrollView>
        </View>

        {/* Today */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Today</Text>
            <Text style={styles.sectionAction}>View all</Text>
          </View>

          {MOCK_TASKS.map((task) => {
            const config = TASK_ICON[task.type];
            const Icon = config.icon;
            return (
              <Pressable key={task.id} style={styles.taskRow}>
                <View style={[styles.taskIcon, { backgroundColor: config.bg }]}>
                  <Icon size={20} color={config.color} />
                </View>
                <View style={styles.taskBody}>
                  <Text style={styles.taskName}>{task.title}</Text>
                  <Text style={styles.taskSub}>{task.sub}</Text>
                </View>
                <View style={[
                  styles.badge,
                  task.type === 'urgent' ? styles.badgeOverdue : styles.badgeTime,
                ]}>
                  <Text style={[
                    styles.badgeText,
                    task.type === 'urgent' ? styles.badgeOverdueText : styles.badgeTimeText,
                  ]}>{task.time}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Upcoming */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Upcoming</Text>
          </View>

          {MOCK_UPCOMING.map((item) => (
            <View key={item.id} style={styles.upcomingRow}>
              <View style={styles.upcomingCal}>
                <Text style={styles.calMonth}>{item.month}</Text>
                <Text style={styles.calDay}>{item.day}</Text>
              </View>
              <View style={styles.upcomingBody}>
                <Text style={styles.upcomingTitle}>{item.title}</Text>
                <Text style={styles.upcomingDetail}>{item.detail}</Text>
              </View>
              <Image source={{ uri: item.petImage }} style={styles.upcomingPet} />
            </View>
          ))}
        </View>
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
});
