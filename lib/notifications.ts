import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { supabase } from '@/lib/supabase';

// Configure how notifications appear when the app is in the foreground
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch {
  // Silently fail in Expo Go
}

/**
 * Request permissions, get Expo push token, save to Supabase.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  try {
    if (!Device.isDevice) return null;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'PawTrack',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#B5633B',
      });
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenData.data;

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('push_tokens').upsert(
        { user_id: user.id, token, platform: Platform.OS },
        { onConflict: 'user_id,token' }
      );
    }

    return token;
  } catch {
    // Fails gracefully in Expo Go or simulator
    return null;
  }
}

/**
 * Remove push token from Supabase (opt-out of notifications).
 */
export async function unregisterPushNotifications(): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('push_tokens').delete().eq('user_id', user.id);
    }
  } catch {
    // Best-effort
  }
}

/**
 * Schedule a local notification at a specific date/time.
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  date: Date
): Promise<string> {
  const trigger = date.getTime() - Date.now();

  if (trigger <= 0) {
    return await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: null,
    });
  }

  return await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(1, Math.floor(trigger / 1000)),
    },
  });
}

/**
 * Cancel all scheduled notifications.
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Listen for notification tap responses (deep linking).
 */
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}
