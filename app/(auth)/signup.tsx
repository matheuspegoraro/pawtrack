import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { PawPrint, User, Mail, Lock, ChevronLeft } from 'lucide-react-native';
import { useAuthStore } from '@/stores/auth';
import { Colors, Spacing, Radius } from '@/constants/theme';

export default function SignupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ from?: string }>();
  const fromSettings = params.from === 'settings';
  const { signUp, loading } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }

    try {
      await signUp(email.trim(), password, name.trim());
      Alert.alert(
        'Account created',
        'Check your email for a confirmation link, then sign in.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login?from=' + (params.from ?? '')) }],
      );
    } catch (error: any) {
      Alert.alert('Sign up failed', error.message ?? 'An unexpected error occurred.');
    }
  };

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header — only when coming from settings */}
        {fromSettings && (
          <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ChevronLeft size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create Account</Text>
            <View style={{ width: 36 }} />
          </View>
        )}

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            !fromSettings && { paddingTop: insets.top + Spacing.xl },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <View style={styles.iconCircle}>
              <PawPrint size={48} color={Colors.terracotta} strokeWidth={2} />
            </View>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Start tracking your pet's health journey</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputWrapper}>
              <User size={20} color={Colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full name"
                placeholderTextColor={Colors.textTertiary}
                value={name}
                onChangeText={setName}
                autoComplete="name"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Mail size={20} color={Colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={Colors.textTertiary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Lock size={20} color={Colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password (min. 6 characters)"
                placeholderTextColor={Colors.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="new-password"
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSignUp}
              activeOpacity={0.8}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Creating account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login?from=' + (params.from ?? ''))}>
              <Text style={styles.footerLink}> Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.sand,
  },
  flex: {
    flex: 1,
  },

  /* Header — matches app pattern */
  header: {
    backgroundColor: Colors.warmWhite,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 6,
    zIndex: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.sand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.terracottaLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    shadowColor: Colors.terracotta,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  form: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warmWhite,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 56,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    color: Colors.textPrimary,
    height: '100%',
  },
  button: {
    backgroundColor: Colors.terracotta,
    borderRadius: Radius.md,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    shadowColor: Colors.terracotta,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 15,
    fontWeight: '400',
    color: Colors.textSecondary,
  },
  footerLink: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.terracotta,
  },
});
