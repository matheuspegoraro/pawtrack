import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Bell, Bug, Pill, Syringe, Stethoscope, HeartPulse } from 'lucide-react-native';
import { Colors, Spacing, Radius } from '@/constants/theme';

const REMINDERS = [
  { id: '1', title: 'Flea Treatment — Max', sub: 'Every 3 months', icon: Bug, iconBg: Colors.coralLight, iconColor: Colors.coral, badge: 'Overdue', badgeBg: Colors.coralLight, badgeColor: Colors.coral },
  { id: '2', title: 'Heartworm Pill — Max', sub: 'Monthly — Next: May 6', icon: Pill, iconBg: Colors.amberLight, iconColor: Colors.amber, badge: 'Today', badgeBg: Colors.amberLight, badgeColor: Colors.amber },
  { id: '3', title: 'Rabies Vaccine — Luna', sub: 'Annual — Next: May 6', icon: Syringe, iconBg: Colors.plumLight, iconColor: Colors.plum, badge: 'Today', badgeBg: Colors.amberLight, badgeColor: Colors.amber },
  { id: '4', title: 'Annual Checkup — Max', sub: 'May 12, 2026', icon: Stethoscope, iconBg: Colors.sageLight, iconColor: Colors.sage, badge: 'In 6 days', badgeBg: Colors.sageLight, badgeColor: Colors.sage },
  { id: '5', title: 'DHPP Vaccine — Buddy', sub: 'May 20, 2026', icon: Syringe, iconBg: Colors.plumLight, iconColor: Colors.plum, badge: 'In 14 days', badgeBg: Colors.sageLight, badgeColor: Colors.sage },
  { id: '6', title: 'Dental Cleaning — Luna', sub: 'Jun 3, 2026', icon: HeartPulse, iconBg: Colors.sageLight, iconColor: Colors.sage, badge: 'In 28 days', badgeBg: Colors.sageLight, badgeColor: Colors.sage },
];

export default function AlertsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
          <Text style={styles.title}>Reminders</Text>
        </View>

        <View style={styles.list}>
          {REMINDERS.map((r) => {
            const Icon = r.icon;
            return (
              <View key={r.id} style={styles.row}>
                <View style={[styles.rowIcon, { backgroundColor: r.iconBg }]}>
                  <Icon size={18} color={r.iconColor} />
                </View>
                <View style={styles.rowBody}>
                  <Text style={styles.rowTitle}>{r.title}</Text>
                  <Text style={styles.rowSub}>{r.sub}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: r.badgeBg }]}>
                  <Text style={[styles.badgeText, { color: r.badgeColor }]}>{r.badge}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.sand },
  header: {
    backgroundColor: Colors.warmWhite,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  title: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
  list: { padding: Spacing.lg, gap: Spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: Colors.warmWhite,
    borderRadius: Radius.md,
  },
  rowIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rowBody: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  rowSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  badgeText: { fontSize: 11, fontWeight: '700' },
});
