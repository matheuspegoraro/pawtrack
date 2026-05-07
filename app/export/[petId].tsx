import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Download,
  Share2,
  FileText,
  Syringe,
  Pill,
  Stethoscope,
} from 'lucide-react-native';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { generatePetReport } from '@/lib/pdf';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import type { Pet, HealthRecord } from '@/types';
import { format } from 'date-fns';

export default function ExportScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { petId } = useLocalSearchParams<{ petId: string }>();

  const [pet, setPet] = useState<Pet | null>(null);
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (petId) fetchData();
  }, [petId]);

  async function fetchData() {
    try {
      setLoading(true);
      const [petRes, recordsRes] = await Promise.all([
        supabase.from('pets').select('*').eq('id', petId).single(),
        supabase
          .from('health_records')
          .select('*')
          .eq('pet_id', petId)
          .order('date', { ascending: false }),
      ]);

      if (petRes.error) throw petRes.error;
      if (recordsRes.error) throw recordsRes.error;

      setPet(petRes.data as Pet);
      setRecords((recordsRes.data as HealthRecord[]) || []);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load pet data');
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadPdf() {
    if (!pet) return;
    try {
      setExporting(true);
      const html = generatePetReport(pet, records);
      const { uri } = await Print.printToFileAsync({ html });
      if (Platform.OS === 'ios') {
        await Sharing.shareAsync(uri, {
          UTI: 'com.adobe.pdf',
          mimeType: 'application/pdf',
        });
      } else {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
        });
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to generate PDF');
    } finally {
      setExporting(false);
    }
  }

  async function handleShareWithVet() {
    if (!pet) return;
    try {
      setExporting(true);
      const html = generatePetReport(pet, records);
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: `${pet.name}'s Health Report`,
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to share report');
    } finally {
      setExporting(false);
    }
  }

  const vaccines = records.filter((r) => r.type === 'vaccine');
  const medications = records.filter((r) => r.type === 'medication');
  const vetVisits = records.filter((r) => r.type === 'vet_visit');

  if (loading) {
    return (
      <View style={[styles.root, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.terracotta} />
        <StatusBar style="dark" />
      </View>
    );
  }

  if (!pet) {
    return (
      <View style={[styles.root, styles.centered]}>
        <Text style={styles.errorText}>Pet not found</Text>
        <StatusBar style="dark" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
          <ArrowLeft size={22} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Export Health Report</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: Spacing.lg, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Preview Card */}
        <View style={styles.previewCard}>
          {/* Card header */}
          <View style={styles.previewHeader}>
            <View style={styles.pdfIcon}>
              <FileText size={24} color={Colors.white} />
            </View>
            <View style={styles.previewHeaderText}>
              <Text style={styles.previewTitle}>{pet.name}'s Health Report</Text>
              <Text style={styles.previewDate}>
                Generated {format(new Date(), 'MMM d, yyyy')}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Pet info summary */}
          <View style={styles.petInfoRow}>
            <View style={styles.petInfoItem}>
              <Text style={styles.petInfoLabel}>Species</Text>
              <Text style={styles.petInfoValue}>
                {pet.species.charAt(0).toUpperCase() + pet.species.slice(1)}
              </Text>
            </View>
            <View style={styles.petInfoItem}>
              <Text style={styles.petInfoLabel}>Breed</Text>
              <Text style={styles.petInfoValue}>{pet.breed || 'N/A'}</Text>
            </View>
            <View style={styles.petInfoItem}>
              <Text style={styles.petInfoLabel}>Weight</Text>
              <Text style={styles.petInfoValue}>
                {pet.weight_lb ? `${pet.weight_lb} lb` : 'N/A'}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Record counts */}
          <View style={styles.recordCountsSection}>
            <Text style={styles.sectionLabel}>Report Contents</Text>

            <View style={styles.recordCountRow}>
              <View style={[styles.countIcon, { backgroundColor: Colors.sageLight }]}>
                <Syringe size={14} color={Colors.sage} />
              </View>
              <Text style={styles.countLabel}>Vaccination History</Text>
              <Text style={styles.countValue}>
                {vaccines.length} record{vaccines.length !== 1 ? 's' : ''}
              </Text>
            </View>

            <View style={styles.recordCountRow}>
              <View style={[styles.countIcon, { backgroundColor: Colors.amberLight }]}>
                <Pill size={14} color={Colors.amber} />
              </View>
              <Text style={styles.countLabel}>Medications</Text>
              <Text style={styles.countValue}>
                {medications.length} record{medications.length !== 1 ? 's' : ''}
              </Text>
            </View>

            <View style={styles.recordCountRow}>
              <View style={[styles.countIcon, { backgroundColor: Colors.plumLight }]}>
                <Stethoscope size={14} color={Colors.plum} />
              </View>
              <Text style={styles.countLabel}>Vet Visits</Text>
              <Text style={styles.countValue}>
                {vetVisits.length} record{vetVisits.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <Pressable
          style={[styles.primaryButton, exporting && styles.buttonDisabled]}
          onPress={handleDownloadPdf}
          disabled={exporting}
        >
          {exporting ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Download size={20} color={Colors.white} />
          )}
          <Text style={styles.primaryButtonText}>Download PDF</Text>
        </Pressable>

        <Pressable
          style={[styles.outlineButton, exporting && styles.buttonDisabled]}
          onPress={handleShareWithVet}
          disabled={exporting}
        >
          <Share2 size={20} color={Colors.terracotta} />
          <Text style={styles.outlineButtonText}>Share with Vet</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.sand,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  header: {
    backgroundColor: Colors.warmWhite,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  previewCard: {
    backgroundColor: Colors.warmWhite,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  pdfIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.sm,
    backgroundColor: Colors.terracotta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewHeaderText: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  previewDate: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  petInfoRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  petInfoItem: {
    flex: 1,
    backgroundColor: Colors.sand,
    padding: 12,
    borderRadius: Radius.sm,
  },
  petInfoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  petInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  recordCountsSection: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  recordCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  countIcon: {
    width: 30,
    height: 30,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  countValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.terracotta,
    paddingVertical: 16,
    borderRadius: Radius.md,
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  outlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.warmWhite,
    paddingVertical: 16,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Colors.terracotta,
  },
  outlineButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.terracotta,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
