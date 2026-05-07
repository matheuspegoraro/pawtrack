import { View, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Ellipse } from 'react-native-svg';
import { Home, Calendar, Bell, Settings } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const TAB_ICONS = {
  index: Home,
  calendar: Calendar,
  alerts: Bell,
  settings: Settings,
} as const;

const TAB_LABELS: Record<string, string> = {
  index: 'Home',
  calendar: 'Calendar',
  alerts: 'Alerts',
  settings: 'Settings',
};

function PawButton({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.85, { damping: 15 }, () => {
      scale.value = withSpring(1, { damping: 12 });
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Pressable onPress={handlePress} style={styles.pawWrapper}>
      <Animated.View style={[styles.pawButton, animatedStyle]}>
        <Svg width={28} height={28} viewBox="0 0 100 100">
          <Ellipse cx="35" cy="22" rx="13" ry="15" fill="white" rotation={-12} origin="35,22" />
          <Ellipse cx="65" cy="22" rx="13" ry="15" fill="white" rotation={12} origin="65,22" />
          <Ellipse cx="20" cy="50" rx="11" ry="13" fill="white" rotation={-25} origin="20,50" />
          <Ellipse cx="80" cy="50" rx="11" ry="13" fill="white" rotation={25} origin="80,50" />
          <Ellipse cx="50" cy="68" rx="24" ry="21" fill="white" />
        </Svg>
      </Animated.View>
    </Pressable>
  );
}

export function PawTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const tabs = state.routes.filter((r) => r.name !== 'add-record');

  const midIndex = Math.floor(tabs.length / 2);

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {tabs.map((route, index) => {
        const isFocused = state.index === state.routes.indexOf(route);
        const Icon = TAB_ICONS[route.name as keyof typeof TAB_ICONS];
        const label = TAB_LABELS[route.name] ?? route.name;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const items = [];

        // Insert paw button in the middle
        if (index === midIndex) {
          items.push(
            <PawButton
              key="paw"
              onPress={() => navigation.navigate('add-record')}
            />
          );
        }

        items.push(
          <Pressable key={route.key} onPress={onPress} style={styles.tab}>
            {Icon && (
              <Icon
                size={22}
                color={isFocused ? Colors.terracotta : Colors.textTertiary}
                strokeWidth={isFocused ? 2.2 : 1.8}
              />
            )}
            <Animated.Text
              style={[
                styles.label,
                { color: isFocused ? Colors.terracotta : Colors.textTertiary },
              ]}
            >
              {label}
            </Animated.Text>
          </Pressable>
        );

        return items;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    backgroundColor: Colors.warmWhite,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  pawWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 54,
  },
  pawButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.terracotta,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28,
    shadowColor: Colors.terracotta,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
});
