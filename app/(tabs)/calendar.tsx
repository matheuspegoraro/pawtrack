import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeft, ChevronRight, Syringe, Pill, Stethoscope, HeartPulse, Bell } from 'lucide-react-native';
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

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
          <Text style={styles.title}>Calendar</Text>
        </View>

        {/* Month navigation */}
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
          <Pressable
            onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}
            style={styles.navBtn}
          >
            <ChevronRight size={20} color={Colors.textPrimary} />
          </Pressable>
        </View>

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
            <View style={styles.noEvents}>
              <Text style={styles.noEventsText}>No events this day</Text>
            </View>
          ) : (
            selectedEvents.map((event) => {
              const typeKey =
                event.type === 'reminder'
                  ? 'reminder'
                  : (event.recordType ?? 'reminder');
              const config = TYPE_COLORS[typeKey] ?? TYPE_COLORS.reminder;
              const Icon = config.icon;

              return (
                <View key={event.id} style={styles.eventRow}>
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
  header: {
    backgroundColor: Colors.warmWhite,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  title: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },

  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.warmWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },

  weekdayRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.sm,
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
    paddingHorizontal: Spacing.sm,
  },
  dayCell: {
    width: '14.285%',
    alignItems: 'center',
    paddingVertical: 8,
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
  noEvents: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  noEventsText: {
    fontSize: 14,
    color: Colors.textTertiary,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: Colors.warmWhite,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
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
