import { useEffect, useRef } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/stores/auth';
import { usePremiumStore } from '@/stores/premium';
import { registerForPushNotifications, addNotificationResponseListener } from '@/lib/notifications';
import 'react-native-reanimated';

export default function RootLayout() {
  const { initialize, session } = useAuthStore();
  const router = useRouter();
  const listenerRef = useRef<ReturnType<typeof addNotificationResponseListener> | null>(null);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Initialize RevenueCat + push when session is available
  const initPremium = usePremiumStore((s) => s.initialize);
  useEffect(() => {
    if (session) {
      initPremium(session.user.id).catch(() => {});
      registerForPushNotifications().catch(() => {});
    }
  }, [session, initPremium]);

  // Deep link: tap notification → open Alerts
  useEffect(() => {
    listenerRef.current = addNotificationResponseListener(() => {
      router.push('/(tabs)/alerts');
    });
    return () => {
      listenerRef.current?.remove();
    };
  }, [router]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="pet/[id]" />
        <Stack.Screen name="pet/add" options={{ presentation: 'modal' }} />
        <Stack.Screen name="premium" options={{ presentation: 'modal' }} />
        <Stack.Screen name="export/[petId]" />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}
