import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { differenceInYears } from 'date-fns';
import {
  ChevronLeft,
  Ellipsis,
  Syringe,
  Pill,
  Stethoscope,
  Weight,
  CircleCheckBig,
} from 'lucide-react-native';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { usePets } from '@/hooks/usePets';
import { useRecords } from '@/hooks/useRecords';
import { useState } from 'react';
import type { RecordType, HealthRecord } from '@/types';

const RECORD_CONFIG: Record<
  RecordType,
  { label: string; icon: typeof Syringe; color: string; bg: string }
> = {
  vaccine: { label: 'Vaccines', icon: Syringe, color: Colors.plum, bg: Colors.plumLight },
  medication: { label: 'Medications', icon: Pill, color: Colors.amber, bg: Colors.amberLight },
  vet_visit: { label: 'Visits', icon: Stethoscope, color: Colors.sage, bg: Colors.sageLight },
  weight: { label: 'Weight', icon: Weight, color: Colors.terracotta, bg: Colors.terracottaLight },
  symptom: { label: 'Symptoms', icon: CircleCheckBig, color: Colors.coral, bg: Colors.coralLight },
};

type FilterType = 'all' | RecordType;

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'vaccine', label: 'Vaccines' },
  { key: 'medication', label: 'Meds' },
  { key: 'vet_visit', label: 'Visits' },
  { key: 'weight', label: 'Weight' },
];

function computeAge(birthDate: string | null): string {
  if (!birthDate) return '--';
  const years = differenceInYears(new Date(), new Date(birthDate));
  if (years < 1) return '<1 yr';
  return `${years} yr${years !== 1 ? 's' : ''}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function PetProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { pets, loading: petsLoading } = usePets();
  const [filter, setFilter] = useState<FilterType>('all');

  const pet = pets.find((p) => p.id === id);

  const { records, loading: recordsLoading } = useRecords({
    petId: id ?? '',
    type: filter === 'all' ? undefined : filter,
  });

  if (petsLoading || !pet) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color={Colors.terracotta} />
      </View>
    );
  }

  const age = computeAge(pet.birth_date);
  const weightDisplay = pet.weight_lb ? `${pet.weight_lb} lb` : '--';

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ScrollView bounces={false}>
        {/* Hero */}
        <View style={[styles.hero, { paddingTop: insets.top + Spacing.sm }]}>
          {/* Nav row */}
          <View style={styles.heroNav}>
            <Pressable onPress={() => router.back()} style={styles.heroBtn}>
              <ChevronLeft size={20} color={Colors.white} />
            </Pressable>
            <Pressable
              onPress={() => router.push(`/pet/add?editId=${pet.id}`)}
              style={styles.heroBtn}
            >
              <Ellipsis size={20} color={Colors.white} />
            </Pressable>
          </View>

          {/* Pet info */}
          <View style={styles.heroCenter}>
            <View style={styles.photoContainer}>
              {pet.photo_url ? (
                <Image source={{ uri: pet.photo_url }} style={styles.photo} contentFit="cover" />
              ) : (
                <View style={[styles.photo, styles.photoPlaceholder]}>
                  <Text style={styles.photoInitial}>{pet.name.charAt(0)}</Text>
                </View>
              )}
            </View>
            <Text style={styles.petName}>{pet.name}</Text>
            {pet.breed ? <Text style={styles.petBreed}>{pet.breed}</Text> : null}
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{age}</Text>
              <Text style={styles.statLabel}>Age</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{weightDisplay}</Text>
              <Text style={styles.statLabel}>Weight</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{records.length}</Text>
              <Text style={styles.statLabel}>Records</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={[styles.statusBadge, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                <CircleCheckBig size={12} color={Colors.white} />
                <Text style={styles.statusText}>Healthy</Text>
              </View>
              <Text style={styles.statLabel}>Status</Text>
            </View>
          </View>
        </View>

        {/* Filter pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <Pressable
                key={f.key}
                style={[styles.filterPill, active && styles.filterPillActive]}
                onPress={() => setFilter(f.key)}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Timeline */}
        <View style={styles.timelineSection}>
          <Text style={styles.timelineTitle}>Health Timeline</Text>

          {recordsLoading ? (
            <ActivityIndicator
              size="small"
              color={Colors.terracotta}
              style={{ marginTop: Spacing.lg }}
            />
          ) : records.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No records yet</Text>
              <Text style={styles.emptySubtext}>
                Add health records to track {pet.name}'s wellbeing
              </Text>
            </View>
          ) : (
            records.map((record, index) => (
              <TimelineItem
                key={record.id}
                record={record}
                isLast={index === records.length - 1}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function TimelineItem({ record, isLast }: { record: HealthRecord; isLast: boolean }) {
  const config = RECORD_CONFIG[record.type];
  const Icon = config.icon;

  return (
    <View style={styles.timelineRow}>
      {/* Left rail */}
      <View style={styles.timelineRail}>
        <View style={[styles.timelineDot, { backgroundColor: config.color }]}>
          <Icon size={12} color={Colors.white} />
        </View>
        {!isLast && <View style={styles.timelineLine} />}
      </View>

      {/* Content card */}
      <View style={styles.timelineCard}>
        <View style={styles.timelineCardHeader}>
          <View style={[styles.timelineTypeBadge, { backgroundColor: config.bg }]}>
            <Text style={[styles.timelineTypeText, { color: config.color }]}>{config.label}</Text>
          </View>
          <Text style={styles.timelineDate}>{formatDate(record.date)}</Text>
        </View>
        <Text style={styles.timelineRecordTitle}>{record.title}</Text>
        {record.description ? (
          <Text style={styles.timelineDescription}>{record.description}</Text>
        ) : null}
        {record.vet_name ? (
          <Text style={styles.timelineVet}>
            {record.vet_name}
            {record.vet_clinic ? ` — ${record.vet_clinic}` : ''}
          </Text>
        ) : null}
        {record.next_due_date ? (
          <View style={styles.timelineNextDue}>
            <Text style={styles.timelineNextDueText}>
              Next due: {formatDate(record.next_due_date)}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.sand },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.sand,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Hero
  hero: {
    backgroundColor: Colors.terracotta,
    paddingBottom: Spacing.lg,
    borderBottomLeftRadius: Radius.lg,
    borderBottomRightRadius: Radius.lg,
  },
  heroNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  heroBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCenter: { alignItems: 'center', marginBottom: Spacing.lg },
  photoContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  photo: { width: '100%', height: '100%' },
  photoPlaceholder: {
    backgroundColor: Colors.terracottaDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoInitial: { fontSize: 36, fontWeight: '800', color: 'rgba(255,255,255,0.7)' },
  petName: { fontSize: 26, fontWeight: '800', color: Colors.white },
  petBreed: { fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.75)', marginTop: 2 },

  // Stats
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.12)',
    borderRadius: Radius.md,
  },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 18, fontWeight: '800', color: Colors.white },
  statLabel: { fontSize: 11, fontWeight: '500', color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  statDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.2)' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  statusText: { fontSize: 12, fontWeight: '700', color: Colors.white },

  // Filters
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.warmWhite,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  filterPillActive: {
    backgroundColor: Colors.terracottaLight,
    borderColor: Colors.terracotta,
  },
  filterText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  filterTextActive: { color: Colors.terracotta },

  // Timeline
  timelineSection: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  timelineTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xl },
  emptyText: { fontSize: 16, fontWeight: '600', color: Colors.textSecondary },
  emptySubtext: { fontSize: 13, color: Colors.textTertiary, marginTop: 4, textAlign: 'center' },

  // Timeline row
  timelineRow: { flexDirection: 'row', marginBottom: Spacing.md },
  timelineRail: { width: 32, alignItems: 'center' },
  timelineDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.border,
    marginTop: 4,
  },
  timelineCard: {
    flex: 1,
    marginLeft: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.warmWhite,
    borderRadius: Radius.md,
  },
  timelineCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  timelineTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  timelineTypeText: { fontSize: 11, fontWeight: '700' },
  timelineDate: { fontSize: 11, fontWeight: '500', color: Colors.textTertiary },
  timelineRecordTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  timelineDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  timelineVet: { fontSize: 12, color: Colors.textTertiary, marginTop: 4 },
  timelineNextDue: {
    marginTop: Spacing.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Colors.amberLight,
    borderRadius: Radius.sm,
    alignSelf: 'flex-start',
  },
  timelineNextDueText: { fontSize: 11, fontWeight: '600', color: Colors.amber },
});
