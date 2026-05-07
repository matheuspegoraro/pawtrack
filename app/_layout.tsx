import { useEffect, useRef } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/stores/auth';
import { registerForPushNotifications, addNotificationResponseListener } from '@/lib/notifications';
import 'react-native-reanimated';

export default function RootLayout() {
  const { initialize, session } = useAuthStore();
  const router = useRouter();
  const listenerRef = useRef<ReturnType<typeof addNotificationResponseListener> | null>(null);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Register push token when session is available
  useEffect(() => {
    if (session) {
      registerForPushNotifications().catch(() => {
        // Silently fail — push not available in Expo Go
      });
    }
  }, [session]);

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
