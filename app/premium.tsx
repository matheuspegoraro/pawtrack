import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import {
  X,
  Crown,
  FileText,
  Bell,
  TrendingUp,
  Users,
  Check,
} from 'lucide-react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { usePremiumStore } from '@/stores/premium';

type Plan = 'monthly' | 'annual';

const FEATURES = [
  {
    icon: FileText,
    title: 'Export Reports',
    description: 'Download & share PDF health reports with your vet',
    color: Colors.terracotta,
    bgColor: Colors.terracottaLight,
  },
  {
    icon: Bell,
    title: 'Smart Reminders',
    description: 'Never miss a vaccine, medication, or appointment',
    color: Colors.amber,
    bgColor: Colors.amberLight,
  },
  {
    icon: TrendingUp,
    title: 'Health Trends',
    description: 'Track weight, symptoms, and wellness over time',
    color: Colors.sage,
    bgColor: Colors.sageLight,
  },
  {
    icon: Users,
    title: 'Family Sharing',
    description: 'Share pet profiles with family members & caregivers',
    color: Colors.plum,
    bgColor: Colors.plumLight,
  },
];

function PawDecorations() {
  return (
    <View style={styles.pawDecorationsContainer} pointerEvents="none">
      {/* Top-left paw */}
      <Svg
        width={48}
        height={48}
        viewBox="0 0 48 48"
        style={{ position: 'absolute', top: 20, left: 20, opacity: 0.15 }}
      >
        <Circle cx="15" cy="8" r="5" fill="white" />
        <Circle cx="30" cy="6" r="5.5" fill="white" />
        <Circle cx="7" cy="20" r="4.5" fill="white" />
        <Circle cx="38" cy="17" r="4.5" fill="white" />
        <Path
          d="M12 28 C12 22, 18 16, 24 20 C30 16, 36 22, 36 28 C36 36, 24 42, 24 42 C24 42, 12 36, 12 28Z"
          fill="white"
        />
      </Svg>
      {/* Top-right paw */}
      <Svg
        width={36}
        height={36}
        viewBox="0 0 48 48"
        style={{ position: 'absolute', top: 12, right: 60, opacity: 0.1 }}
      >
        <Circle cx="15" cy="8" r="5" fill="white" />
        <Circle cx="30" cy="6" r="5.5" fill="white" />
        <Circle cx="7" cy="20" r="4.5" fill="white" />
        <Circle cx="38" cy="17" r="4.5" fill="white" />
        <Path
          d="M12 28 C12 22, 18 16, 24 20 C30 16, 36 22, 36 28 C36 36, 24 42, 24 42 C24 42, 12 36, 12 28Z"
          fill="white"
        />
      </Svg>
      {/* Bottom-right paw */}
      <Svg
        width={40}
        height={40}
        viewBox="0 0 48 48"
        style={{ position: 'absolute', bottom: 8, right: 24, opacity: 0.12 }}
      >
        <Circle cx="15" cy="8" r="5" fill="white" />
        <Circle cx="30" cy="6" r="5.5" fill="white" />
        <Circle cx="7" cy="20" r="4.5" fill="white" />
        <Circle cx="38" cy="17" r="4.5" fill="white" />
        <Path
          d="M12 28 C12 22, 18 16, 24 20 C30 16, 36 22, 36 28 C36 36, 24 42, 24 42 C24 42, 12 36, 12 28Z"
          fill="white"
        />
      </Svg>
      {/* Bottom-left paw */}
      <Svg
        width={32}
        height={32}
        viewBox="0 0 48 48"
        style={{ position: 'absolute', bottom: 20, left: 40, opacity: 0.08 }}
      >
        <Circle cx="15" cy="8" r="5" fill="white" />
        <Circle cx="30" cy="6" r="5.5" fill="white" />
        <Circle cx="7" cy="20" r="4.5" fill="white" />
        <Circle cx="38" cy="17" r="4.5" fill="white" />
        <Path
          d="M12 28 C12 22, 18 16, 24 20 C30 16, 36 22, 36 28 C36 36, 24 42, 24 42 C24 42, 12 36, 12 28Z"
          fill="white"
        />
      </Svg>
    </View>
  );
}

export default function PremiumScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const setPremium = usePremiumStore((s) => s.setPremium);
  const [selectedPlan, setSelectedPlan] = useState<Plan>('annual');

  const handleSubscribe = () => {
    // TODO: Replace with RevenueCat purchase flow
    Alert.alert(
      'Start Free Trial',
      `You selected the ${selectedPlan} plan. In-app purchases will be available soon!`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Activate (Demo)',
          onPress: () => {
            setPremium(true);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={[styles.hero, { paddingTop: Spacing.lg }]}>
          <PawDecorations />

          {/* Close button */}
          <Pressable
            onPress={() => router.back()}
            style={styles.closeButton}
            hitSlop={12}
          >
            <X size={24} color="rgba(255,255,255,0.8)" />
          </Pressable>

          <View style={styles.crownContainer}>
            <Crown size={40} color={Colors.warmWhite} />
          </View>
          <Text style={styles.heroTitle}>Unlock PawTrack Pro</Text>
          <Text style={styles.heroSubtitle}>
            Everything you need to keep your furry friends healthy and happy
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <View key={feature.title} style={styles.featureRow}>
                <View
                  style={[styles.featureIcon, { backgroundColor: feature.bgColor }]}
                >
                  <Icon size={20} color={feature.color} />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDesc}>{feature.description}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Plans */}
        <View style={styles.plansSection}>
          {/* Annual */}
          <Pressable
            style={[
              styles.planCard,
              selectedPlan === 'annual' && styles.planCardSelected,
            ]}
            onPress={() => setSelectedPlan('annual')}
          >
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>SAVE 30%</Text>
            </View>
            <View style={styles.planRadio}>
              {selectedPlan === 'annual' && (
                <View style={styles.planRadioInner} />
              )}
            </View>
            <View style={styles.planInfo}>
              <Text style={styles.planName}>Annual</Text>
              <Text style={styles.planPrice}>$49.99/yr</Text>
              <Text style={styles.planPriceNote}>$4.17/month</Text>
            </View>
          </Pressable>

          {/* Monthly */}
          <Pressable
            style={[
              styles.planCard,
              selectedPlan === 'monthly' && styles.planCardSelected,
            ]}
            onPress={() => setSelectedPlan('monthly')}
          >
            <View style={styles.planRadio}>
              {selectedPlan === 'monthly' && (
                <View style={styles.planRadioInner} />
              )}
            </View>
            <View style={styles.planInfo}>
              <Text style={styles.planName}>Monthly</Text>
              <Text style={styles.planPrice}>$5.99/mo</Text>
            </View>
          </Pressable>
        </View>

        {/* CTA */}
        <View style={styles.ctaSection}>
          <Pressable style={styles.ctaButton} onPress={handleSubscribe}>
            <Text style={styles.ctaButtonText}>Start 7-Day Free Trial</Text>
          </Pressable>
          <Text style={styles.ctaNote}>
            Cancel anytime. No charge until trial ends.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.sand,
  },
  hero: {
    backgroundColor: Colors.terracotta,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 40,
    alignItems: 'center',
    overflow: 'hidden',
  },
  pawDecorationsContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: Spacing.md,
    marginTop: 54,
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crownContainer: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  heroSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  featuresSection: {
    margin: Spacing.lg,
    backgroundColor: Colors.warmWhite,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    gap: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  plansSection: {
    marginHorizontal: Spacing.lg,
    gap: 12,
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warmWhite,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    gap: 14,
  },
  planCardSelected: {
    borderColor: Colors.terracotta,
    backgroundColor: Colors.terracottaLight,
  },
  planBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: Colors.amber,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  planBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  planRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.terracotta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.terracotta,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  planPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.terracotta,
    marginTop: 2,
  },
  planPriceNote: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  ctaSection: {
    padding: Spacing.lg,
    alignItems: 'center',
    gap: 12,
  },
  ctaButton: {
    width: '100%',
    backgroundColor: Colors.terracotta,
    paddingVertical: 18,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  ctaButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
  },
  ctaNote: {
    fontSize: 13,
    color: Colors.textTertiary,
  },
});
