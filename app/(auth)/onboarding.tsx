import { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { PawPrint, Syringe, Bell, FileText } from 'lucide-react-native';
import { Colors, Spacing, Radius } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingStep {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent: string;
  accentBg: string;
}

const steps: OnboardingStep[] = [
  {
    icon: <Syringe size={44} color={Colors.terracotta} strokeWidth={1.8} />,
    title: "Your pet's health,\nalways with you",
    description:
      'Track vaccines, medications, vet visits, and more — all in one place. Keep a complete health timeline for every furry friend.',
    accent: Colors.terracotta,
    accentBg: Colors.terracottaLight,
  },
  {
    icon: <Bell size={44} color={Colors.amber} strokeWidth={1.8} />,
    title: 'Never miss\na date',
    description:
      'Get smart reminders for upcoming vaccines, medication schedules, and vet appointments so nothing slips through the cracks.',
    accent: Colors.amber,
    accentBg: Colors.amberLight,
  },
  {
    icon: <FileText size={44} color={Colors.sage} strokeWidth={1.8} />,
    title: 'Share with\nyour vet',
    description:
      'Export beautiful PDF reports of your pet\'s health history. Share them instantly with any veterinarian.',
    accent: Colors.sage,
    accentBg: Colors.sageLight,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  const goToNext = () => {
    if (activeIndex < steps.length - 1) {
      scrollRef.current?.scrollTo({
        x: SCREEN_WIDTH * (activeIndex + 1),
        animated: true,
      });
    } else {
      router.replace('/(auth)/login');
    }
  };

  const skipToLogin = () => {
    router.replace('/(auth)/login');
  };

  const isLast = activeIndex === steps.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        {!isLast ? (
          <TouchableOpacity onPress={skipToLogin} hitSlop={12}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        ) : (
          <View />
        )}
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
      >
        {steps.map((step, index) => (
          <View key={index} style={styles.page}>
            <View style={styles.illustrationArea}>
              <View style={[styles.iconCircleLarge, { backgroundColor: step.accentBg }]}>
                {step.icon}
              </View>
              <View style={styles.pawDecorTopRight}>
                <PawPrint size={24} color={Colors.border} strokeWidth={1.5} />
              </View>
              <View style={styles.pawDecorBottomLeft}>
                <PawPrint size={18} color={Colors.border} strokeWidth={1.5} />
              </View>
            </View>

            <View style={styles.textArea}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDescription}>{step.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.bottomArea}>
        <View style={styles.dots}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === activeIndex
                  ? [styles.dotActive, { backgroundColor: steps[activeIndex].accent }]
                  : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={goToNext}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {isLast ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.warmWhite,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textTertiary,
  },
  page: {
    width: SCREEN_WIDTH,
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
  },
  illustrationArea: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
    position: 'relative',
  },
  iconCircleLarge: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pawDecorTopRight: {
    position: 'absolute',
    top: 0,
    right: SCREEN_WIDTH * 0.15,
    opacity: 0.5,
    transform: [{ rotate: '25deg' }],
  },
  pawDecorBottomLeft: {
    position: 'absolute',
    bottom: 10,
    left: SCREEN_WIDTH * 0.12,
    opacity: 0.4,
    transform: [{ rotate: '-15deg' }],
  },
  textArea: {
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.md,
    lineHeight: 38,
  },
  stepDescription: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Spacing.md,
  },
  bottomArea: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.lg,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
  },
  dotInactive: {
    width: 8,
    backgroundColor: Colors.border,
  },
  button: {
    backgroundColor: Colors.terracotta,
    borderRadius: Radius.md,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '600',
  },
});
