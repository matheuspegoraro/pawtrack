import { View, Text, ScrollView, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  Bell,
  BellOff,
  Pill,
  Syringe,
  Stethoscope,
  HeartPulse,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react-native';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { useReminders, ReminderWithPet } from '@/hooks/useReminders';
import {
  differenceInDays,
  differenceInHours,
  isToday,
  isBefore,
  format,
  parseISO,
} from 'date-fns';
import { useState, useCallback } from 'react';
import * as Haptics from 'expo-haptics';

function getBadge(remindAt: string): {
  text: string;
  bg: string;
  color: string;
} {
  const now = new Date();
  const target = parseISO(remindAt);

  if (isToday(target)) {
    return { text: 'Today', bg: Colors.amberLight, color: Colors.amber };
  }
  if (isBefore(target, now)) {
    const daysAgo = differenceInDays(now, target);
    return {
      text: daysAgo === 0 ? 'Overdue' : `${daysAgo}d overdue`,
      bg: Colors.coralLight,
      color: Colors.coral,
    };
  }

  const daysUntil = differenceInDays(target, now);
  if (daysUntil === 0) {
    const hoursUntil = differenceInHours(target, now);
    return {
      text: `In ${hoursUntil}h`,
      bg: Colors.amberLight,
      color: Colors.amber,
    };
  }
  if (daysUntil <= 7) {
    return {
      text: `In ${daysUntil}d`,
      bg: Colors.amberLight,
      color: Colors.amber,
    };
  }
  return {
    text: `In ${daysUntil}d`,
    bg: Colors.sageLight,
    color: Colors.sage,
  };
}

function getIconForTitle(title: string): {
  icon: typeof Pill;
  bg: string;
  color: string;
} {
  const lower = title.toLowerCase();
  if (lower.includes('vaccine') || lower.includes('rabies') || lower.includes('dhpp')) {
    return { icon: Syringe, bg: Colors.plumLight, color: Colors.plum };
  }
  if (lower.includes('pill') || lower.includes('med') || lower.includes('flea') || lower.includes('heartworm')) {
    return { icon: Pill, bg: Colors.amberLight, color: Colors.amber };
  }
  if (lower.includes('visit') || lower.includes('checkup') || lower.includes('check-up')) {
    return { icon: Stethoscope, bg: Colors.sageLight, color: Colors.sage };
  }
  return { icon: HeartPulse, bg: Colors.sageLight, color: Colors.sage };
}

export default function AlertsScreen() {
  const insets = useSafeAreaInsets();
  const { reminders, loading, toggleReminder, deleteReminder, refresh } = useReminders();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleToggle = useCallback(async (r: ReminderWithPet) => {
    setActionLoading(r.id);
    try {
      await toggleReminder(r.id, !r.is_active);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      Alert.alert('Error', 'Failed to update reminder.');
    } finally {
      setActionLoading(null);
    }
  }, [toggleReminder]);

  const handleDelete = useCallback((r: ReminderWithPet) => {
    Alert.alert(
      'Delete Reminder',
      `Remove "${r.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(r.id);
            try {
              await deleteReminder(r.id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch {
              Alert.alert('Error', 'Failed to delete reminder.');
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  }, [deleteReminder]);

  const activeReminders = reminders.filter((r) => r.is_active);
  const inactiveReminders = reminders.filter((r) => !r.is_active);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
          <Text style={styles.title}>Reminders</Text>
          {reminders.length > 0 && (
            <Text style={styles.subtitle}>
              {activeReminders.length} active
            </Text>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.terracotta} />
          </View>
        ) : reminders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Bell size={48} color={Colors.terracottaLight} strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>No reminders yet</Text>
            <Text style={styles.emptyText}>
              Reminders are created automatically when you add health records with a next due date.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {/* Active reminders */}
            {activeReminders.map((r) => {
              const badge = getBadge(r.remind_at);
              const iconConfig = getIconForTitle(r.title);
              const Icon = iconConfig.icon;
              const isLoading = actionLoading === r.id;

              return (
                <Pressable
                  key={r.id}
                  style={styles.row}
                  onLongPress={() => handleDelete(r)}
                  delayLongPress={500}
                >
                  <View style={[styles.rowIcon, { backgroundColor: iconConfig.bg }]}>
                    <Icon size={18} color={iconConfig.color} />
                  </View>
                  <View style={styles.rowBody}>
                    <Text style={styles.rowTitle}>{r.title}</Text>
                    <Text style={styles.rowSub}>
                      {format(parseISO(r.remind_at), 'MMM d, yyyy')}
                      {r.repeat_interval ? ` \u00B7 Repeating` : ''}
                    </Text>
                  </View>
                  <View style={styles.rowActions}>
                    <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.badgeText, { color: badge.color }]}>
                        {badge.text}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => handleToggle(r)}
                      hitSlop={8}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <ActivityIndicator size="small" color={Colors.terracotta} />
                      ) : (
                        <ToggleRight size={22} color={Colors.sage} />
                      )}
                    </Pressable>
                  </View>
                </Pressable>
              );
            })}

            {/* Inactive reminders */}
            {inactiveReminders.length > 0 && (
              <>
                <View style={styles.sectionDivider}>
                  <Text style={styles.sectionLabel}>Paused</Text>
                </View>
                {inactiveReminders.map((r) => {
                  const iconConfig = getIconForTitle(r.title);
                  const Icon = iconConfig.icon;
                  const isLoading = actionLoading === r.id;

                  return (
                    <Pressable
                      key={r.id}
                      style={[styles.row, styles.rowInactive]}
                      onLongPress={() => handleDelete(r)}
                      delayLongPress={500}
                    >
                      <View
                        style={[
                          styles.rowIcon,
                          { backgroundColor: Colors.sand },
                        ]}
                      >
                        <Icon size={18} color={Colors.textTertiary} />
                      </View>
                      <View style={styles.rowBody}>
                        <Text style={[styles.rowTitle, { color: Colors.textTertiary }]}>
                          {r.title}
                        </Text>
                        <Text style={styles.rowSub}>
                          {format(parseISO(r.remind_at), 'MMM d, yyyy')}
                        </Text>
                      </View>
                      <View style={styles.rowActions}>
                        <Pressable
                          onPress={() => handleToggle(r)}
                          hitSlop={8}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <ActivityIndicator size="small" color={Colors.textTertiary} />
                          ) : (
                            <ToggleLeft size={22} color={Colors.textTertiary} />
                          )}
                        </Pressable>
                        <Pressable onPress={() => handleDelete(r)} hitSlop={8}>
                          <Trash2 size={16} color={Colors.textTertiary} />
                        </Pressable>
                      </View>
                    </Pressable>
                  );
                })}
              </>
            )}

            <Text style={styles.hint}>Long press to delete a reminder</Text>
          </View>
        )}
      </ScrollView>
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
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textTertiary,
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    paddingTop: 80,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: Spacing.xl,
    paddingTop: 80,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  list: { padding: Spacing.lg, gap: Spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: Colors.warmWhite,
    borderRadius: Radius.md,
  },
  rowInactive: { opacity: 0.65 },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  rowSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  rowActions: {
    alignItems: 'flex-end',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },
  sectionDivider: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  hint: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});
