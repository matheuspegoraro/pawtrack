import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeft, ChevronRight, Syringe, Pill, Stethoscope, HeartPulse, Bell, Calendar } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from 'date-fns';
import { supabase } from '@/lib/supabase';
import type { HealthRecord } from '@/types';
import type { ReminderWithPet } from '@/hooks/useReminders';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'record' | 'reminder';
  recordType?: HealthRecord['type'];
  petName?: string;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const TYPE_COLORS: Record<string, { dot: string; bg: string; icon: typeof Pill }> = {
  vaccine: { dot: Colors.plum, bg: Colors.plumLight, icon: Syringe },
  medication: { dot: Colors.amber, bg: Colors.amberLight, icon: Pill },
  vet_visit: { dot: Colors.sage, bg: Colors.sageLight, icon: Stethoscope },
  symptom: { dot: Colors.coral, bg: Colors.coralLight, icon: HeartPulse },
  weight: { dot: Colors.terracotta, bg: Colors.terracottaLight, icon: HeartPulse },
  reminder: { dot: Colors.amber, bg: Colors.amberLight, icon: Bell },
};

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const isCurrentMonth = useMemo(
    () => isSameMonth(currentMonth, new Date()),
    [currentMonth]
  );

  // Fetch health records and reminders for the visible month range
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const rangeStart = format(startOfWeek(monthStart), 'yyyy-MM-dd');
    const rangeEnd = format(endOfWeek(monthEnd), 'yyyy-MM-dd');

    try {
      const [recordsRes, remindersRes] = await Promise.all([
        supabase
          .from('health_records')
          .select('*, pets(name)')
          .gte('date', rangeStart)
          .lte('date', rangeEnd)
          .order('date'),
        supabase
          .from('reminders')
          .select('*, pets(name)')
          .gte('remind_at', `${rangeStart}T00:00:00`)
          .lte('remind_at', `${rangeEnd}T23:59:59`)
          .eq('is_active', true)
          .order('remind_at'),
      ]);

      const mapped: CalendarEvent[] = [];

      (recordsRes.data ?? []).forEach((r: any) => {
        mapped.push({
          id: r.id,
          title: r.title,
          date: parseISO(r.date),
          type: 'record',
          recordType: r.type,
          petName: r.pets?.name,
        });
      });

      (remindersRes.data ?? []).forEach((r: any) => {
        mapped.push({
          id: r.id,
          title: r.title,
          date: parseISO(r.remind_at),
          type: 'reminder',
          petName: r.pets?.name,
        });
      });

      setEvents(mapped);
    } catch (err) {
      console.error('Failed to fetch calendar events:', err);
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);

    const days: Date[] = [];
    let day = calStart;
    while (day <= calEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth]);

  // Events map by date key
  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach((e) => {
      const key = format(e.date, 'yyyy-MM-dd');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    });
    return map;
  }, [events]);

  // Events for selected date
  const selectedEvents = useMemo(() => {
    const key = format(selectedDate, 'yyyy-MM-dd');
    return eventsByDay.get(key) ?? [];
  }, [selectedDate, eventsByDay]);

  // Unique dot colors for a given day
  const getDotsForDay = useCallback(
    (day: Date) => {
      const key = format(day, 'yyyy-MM-dd');
      const dayEvents = eventsByDay.get(key);
      if (!dayEvents) return [];
      const colors = new Set<string>();
      dayEvents.forEach((e) => {
        const typeKey = e.type === 'reminder' ? 'reminder' : (e.recordType ?? 'reminder');
        colors.add(TYPE_COLORS[typeKey]?.dot ?? Colors.textTertiary);
      });
      return Array.from(colors).slice(0, 3);
    },
    [eventsByDay]
  );

  const handleGoToToday = useCallback(() => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header with month nav inside, rounded bottom */}
        <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
          <Text style={styles.title}>Calendar</Text>

          {/* Month navigation inside header */}
          <View style={styles.monthNav}>
            <Pressable
              onPress={() => setCurrentMonth(subMonths(currentMonth, 1))}
              style={styles.navBtn}
            >
              <ChevronLeft size={20} color={Colors.textPrimary} />
            </Pressable>
            <Text style={styles.monthLabel}>
              {format(currentMonth, 'MMMM yyyy')}
            </Text>
            <View style={styles.monthNavRight}>
              {!isCurrentMonth && (
                <Pressable onPress={handleGoToToday} style={styles.todayPill}>
                  <Text style={styles.todayPillText}>Today</Text>
                </Pressable>
              )}
              <Pressable
                onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}
                style={styles.navBtn}
              >
                <ChevronRight size={20} color={Colors.textPrimary} />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Calendar card with weekday headers + grid */}
        <View style={styles.calendarCard}>
          {/* Weekday headers */}
          <View style={styles.weekdayRow}>
            {WEEKDAYS.map((d) => (
              <View key={d} style={styles.weekdayCell}>
                <Text style={styles.weekdayText}>{d}</Text>
              </View>
            ))}
          </View>

          {/* Calendar grid */}
          <View style={styles.calendarGrid}>
            {calendarDays.map((day, i) => {
              const inMonth = isSameMonth(day, currentMonth);
              const selected = isSameDay(day, selectedDate);
              const today = isToday(day);
              const dots = getDotsForDay(day);

              return (
                <Pressable
                  key={i}
                  style={[
                    styles.dayCell,
                    selected && styles.dayCellSelected,
                  ]}
                  onPress={() => setSelectedDate(day)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      !inMonth && styles.dayTextMuted,
                      today && !selected && styles.dayTextToday,
                      selected && styles.dayTextSelected,
                    ]}
                  >
                    {format(day, 'd')}
                  </Text>
                  <View style={styles.dotsRow}>
                    {dots.map((color, di) => (
                      <View
                        key={di}
                        style={[
                          styles.dot,
                          { backgroundColor: selected ? Colors.warmWhite : color },
                        ]}
                      />
                    ))}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Selected day events */}
        <View style={styles.eventsSection}>
          <Text style={styles.eventsTitle}>
            {isToday(selectedDate)
              ? 'Today'
              : format(selectedDate, 'EEEE, MMM d')}
          </Text>

          {loading ? (
            <ActivityIndicator
              size="small"
              color={Colors.terracotta}
              style={{ marginTop: Spacing.lg }}
            />
          ) : selectedEvents.length === 0 ? (
            /* Rich empty state */
            <Animated.View
              entering={FadeInDown.duration(400).delay(100)}
              style={styles.emptyCard}
            >
              <View style={styles.emptyIconCircle}>
                <Calendar size={28} color={Colors.terracotta} strokeWidth={1.5} />
              </View>
              <Text style={styles.emptyTitle}>No events</Text>
              <Text style={styles.emptyText}>
                Nothing scheduled for this day. Health records and reminders will appear here.
              </Text>
            </Animated.View>
          ) : (
            selectedEvents.map((event, index) => {
              const typeKey =
                event.type === 'reminder'
                  ? 'reminder'
                  : (event.recordType ?? 'reminder');
              const config = TYPE_COLORS[typeKey] ?? TYPE_COLORS.reminder;
              const Icon = config.icon;

              return (
                <Animated.View
                  key={event.id}
                  entering={FadeInDown.duration(400).delay(index * 60)}
                >
                  <View style={styles.eventRow}>
                    <View style={[styles.eventIcon, { backgroundColor: config.bg }]}>
                      <Icon size={16} color={config.dot} />
                    </View>
                    <View style={styles.eventBody}>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      <Text style={styles.eventSub}>
                        {event.petName
                          ? `${event.petName} \u00B7 `
                          : ''}
                        {event.type === 'reminder' ? 'Reminder' : (event.recordType ?? '').replace('_', ' ')}
                        {' \u00B7 '}
                        {format(event.date, 'h:mm a')}
                      </Text>
                    </View>
                  </View>
                </Animated.View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.sand },

  /* Header with rounded bottom corners, shadow, overlap */
  header: {
    backgroundColor: Colors.warmWhite,
    paddingHorizontal: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: -8,
    zIndex: 10,
  },
  title: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },

  /* Month nav inside header */
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  monthNavRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.sand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  todayPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.terracottaLight,
  },
  todayPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.terracotta,
  },

  /* Calendar card */
  calendarCard: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md + 8,
    backgroundColor: Colors.warmWhite,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },

  weekdayRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
  },

  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.xs,
  },
  dayCell: {
    width: '14.285%',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 3,
  },
  dayCellSelected: {
    backgroundColor: Colors.terracotta,
    borderRadius: Radius.sm,
  },
  dayText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  dayTextMuted: {
    color: Colors.textTertiary,
    opacity: 0.4,
  },
  dayTextToday: {
    color: Colors.terracotta,
    fontWeight: '800',
  },
  dayTextSelected: {
    color: Colors.warmWhite,
    fontWeight: '800',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 3,
    height: 5,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },

  eventsSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  eventsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },

  /* Rich empty state */
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 32,
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.warmWhite,
    borderRadius: Radius.lg,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.terracottaLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },

  /* Event rows with subtle shadow */
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: Colors.warmWhite,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  eventIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventBody: { flex: 1 },
  eventTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  eventSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    textTransform: 'capitalize',
  },
});
