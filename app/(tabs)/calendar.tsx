import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Calendar as CalendarIcon } from 'lucide-react-native';
import { Colors, Spacing } from '@/constants/theme';

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Text style={styles.title}>Calendar</Text>
      </View>
      <View style={styles.empty}>
        <CalendarIcon size={48} color={Colors.terracottaLight} strokeWidth={1.5} />
        <Text style={styles.emptyTitle}>Coming soon</Text>
        <Text style={styles.emptyText}>View all your pet's health events in a calendar view.</Text>
      </View>
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
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  emptyText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
});
