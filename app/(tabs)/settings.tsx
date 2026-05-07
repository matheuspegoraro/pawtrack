import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { User, Bell, Crown, Share2, CircleHelp, LogOut } from 'lucide-react-native';
import { Colors, Spacing, Radius } from '@/constants/theme';

const MENU_ITEMS = [
  { icon: User, label: 'Account', color: Colors.terracotta },
  { icon: Bell, label: 'Notifications', color: Colors.amber },
  { icon: Crown, label: 'PawTrack Pro', color: Colors.plum },
  { icon: Share2, label: 'Share & Invite', color: Colors.sage },
  { icon: CircleHelp, label: 'Help & Support', color: Colors.textSecondary },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.menu}>
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Pressable key={item.label} style={styles.menuItem}>
              <Icon size={20} color={item.color} />
              <Text style={styles.menuLabel}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable style={styles.logoutBtn}>
        <LogOut size={18} color={Colors.coral} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </Pressable>
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
  menu: {
    margin: Spacing.lg,
    backgroundColor: Colors.warmWhite,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuLabel: { fontSize: 16, fontWeight: '500', color: Colors.textPrimary },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: Spacing.lg,
    padding: 16,
    backgroundColor: Colors.warmWhite,
    borderRadius: Radius.md,
  },
  logoutText: { fontSize: 16, fontWeight: '600', color: Colors.coral },
});
