import { Tabs } from 'expo-router';
import { PawTabBar } from '@/components/ui/PawTabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <PawTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="calendar" />
      <Tabs.Screen name="add-record" options={{ tabBarItemStyle: { display: 'none' } }} />
      <Tabs.Screen name="alerts" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
