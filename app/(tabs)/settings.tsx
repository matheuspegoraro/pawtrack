import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import {
  User,
  Bell,
  Crown,
  CircleHelp,
  Shield,
  FileText,
  LogOut,
  ChevronRight,
  PawPrint,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { useAuthStore } from '@/stores/auth';
import { usePremiumStore } from '@/stores/premium';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const isPremium = usePremiumStore((s) => s.isPremium);

  const [pushNotifications, setPushNotifications] = useState(true);

  const isAnonymous = !user?.email;
  const userName =
    user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email || '';

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => signOut(),
      },
    ]);
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info Card */}
        <Animated.View entering={FadeInDown.duration(500).delay(100)}>
          <View style={styles.userCard}>
            <View style={styles.userAvatarWrapper}>
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>
                  {userName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.avatarBadge}>
                <PawPrint size={10} color={Colors.warmWhite} />
              </View>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {isAnonymous ? 'Anonymous User' : userName}
              </Text>
              {isAnonymous ? (
                <Pressable onPress={() => router.push('/(auth)/signup')}>
                  <Text style={styles.userPrompt}>
                    Create an account for backup
                  </Text>
                </Pressable>
              ) : (
                <Text style={styles.userEmail}>{userEmail}</Text>
              )}
            </View>
          </View>
        </Animated.View>

        {/* Account Section */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(200)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuGroup}>
            <Pressable style={styles.menuItem}>
              <View style={[styles.menuIcon, { backgroundColor: Colors.terracottaLight }]}>
                <User size={18} color={Colors.terracotta} />
              </View>
              <Text style={styles.menuLabel}>Edit Profile</Text>
              <ChevronRight size={18} color={Colors.textTertiary} />
            </Pressable>
          </View>
        </Animated.View>

        {/* Notifications Section */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(300)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.menuGroup}>
            <View style={styles.menuItem}>
              <View style={[styles.menuIcon, { backgroundColor: Colors.amberLight }]}>
                <Bell size={18} color={Colors.amber} />
              </View>
              <Text style={[styles.menuLabel, { flex: 1 }]}>Push Notifications</Text>
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
                trackColor={{
                  false: Colors.border,
                  true: Colors.terracottaLight,
                }}
                thumbColor={pushNotifications ? Colors.terracotta : Colors.textTertiary}
              />
            </View>
          </View>
        </Animated.View>

        {/* Subscription Section */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(400)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Subscription</Text>
          <View style={styles.menuGroup}>
            <Pressable
              style={styles.menuItem}
              onPress={() => router.push('/premium')}
            >
              <View style={[styles.menuIcon, { backgroundColor: Colors.plumLight }]}>
                <Crown size={18} color={Colors.plum} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuLabel}>PawTrack Pro</Text>
                <Text style={styles.menuSublabel}>
                  {isPremium ? 'Active' : 'Free plan'}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  isPremium ? styles.statusBadgePro : styles.statusBadgeFree,
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    isPremium
                      ? styles.statusBadgeTextPro
                      : styles.statusBadgeTextFree,
                  ]}
                >
                  {isPremium ? 'PRO' : 'FREE'}
                </Text>
              </View>
              <ChevronRight size={18} color={Colors.textTertiary} />
            </Pressable>
          </View>
        </Animated.View>

        {/* Support Section */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(500)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.menuGroup}>
            <Pressable style={[styles.menuItem, styles.menuItemBorder]}>
              <View style={[styles.menuIcon, { backgroundColor: Colors.sageLight }]}>
                <CircleHelp size={18} color={Colors.sage} />
              </View>
              <Text style={styles.menuLabel}>Help</Text>
              <ChevronRight size={18} color={Colors.textTertiary} />
            </Pressable>

            <Pressable style={[styles.menuItem, styles.menuItemBorder]}>
              <View style={[styles.menuIcon, { backgroundColor: Colors.sand }]}>
                <Shield size={18} color={Colors.textSecondary} />
              </View>
              <Text style={styles.menuLabel}>Privacy Policy</Text>
              <ChevronRight size={18} color={Colors.textTertiary} />
            </Pressable>

            <Pressable style={styles.menuItem}>
              <View style={[styles.menuIcon, { backgroundColor: Colors.sand }]}>
                <FileText size={18} color={Colors.textSecondary} />
              </View>
              <Text style={styles.menuLabel}>Terms of Service</Text>
              <ChevronRight size={18} color={Colors.textTertiary} />
            </Pressable>
          </View>
        </Animated.View>

        {/* Sign Out */}
        <Animated.View entering={FadeInDown.duration(500).delay(600)}>
          <Pressable style={styles.signOutButton} onPress={handleSignOut}>
            <LogOut size={18} color={Colors.coral} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
        </Animated.View>

        {/* Version */}
        <Animated.View entering={FadeInDown.duration(500).delay(700)}>
          <Text style={styles.versionText}>PawTrack v1.0.0</Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.sand,
  },
  header: {
    backgroundColor: Colors.warmWhite,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 32,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#2A2017',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: -8,
    zIndex: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    margin: Spacing.lg,
    marginTop: Spacing.lg + 8,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.warmWhite,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    shadowColor: '#2A2017',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  userAvatarWrapper: {
    position: 'relative',
  },
  userAvatar: {
    width: 52,
    height: 52,
    borderRadius: Radius.full,
    backgroundColor: Colors.terracottaLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.terracotta,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.terracotta,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.warmWhite,
  },
  userAvatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.terracotta,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  userEmail: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  userPrompt: {
    fontSize: 13,
    color: Colors.terracotta,
    fontWeight: '500',
    marginTop: 2,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  menuGroup: {
    backgroundColor: Colors.warmWhite,
    borderRadius: Radius.md,
    overflow: 'hidden',
    shadowColor: '#2A2017',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  menuSublabel: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.full,
    marginRight: 4,
  },
  statusBadgeFree: {
    backgroundColor: Colors.sand,
  },
  statusBadgePro: {
    backgroundColor: Colors.plumLight,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statusBadgeTextFree: {
    color: Colors.textTertiary,
  },
  statusBadgeTextPro: {
    color: Colors.plum,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.warmWhite,
    borderRadius: Radius.md,
    shadowColor: '#2A2017',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.coral,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: Spacing.md,
  },
});
