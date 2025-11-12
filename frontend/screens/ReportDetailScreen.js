// screens/ReportDetailScreen.js
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { theme } from "../theme";

export default function ReportDetailScreen({ route, navigation }) {
  const { diagnosis } = route.params || {};
  const [selectedResult, setSelectedResult] = useState(null);

  if (!diagnosis) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>Report not found</Text>
        <TouchableOpacity 
          style={styles.errorButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { inputs, results, createdAt, userName } = diagnosis;

  const getResultLabel = (key) => {
    const labels = {
      U: "Unknown",
      R: "Rhinitis",
      O: "Other Allergies",
      UR: "Unknown + Rhinitis",
      UO: "Unknown + Other",
      RO: "Rhinitis + Other",
      N: "Normal/No Allergy"
    };
    return labels[key] || key;
  };

  const topPrediction = Object.entries(results).reduce((max, curr) => 
    parseFloat(curr[1]) > parseFloat(max[1]) ? curr : max
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Patient Header */}
      <View style={styles.patientCard}>
        <View style={styles.patientHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {(userName || "U").charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.patientInfo}>
            <Text style={styles.patientName}>{userName || "Patient"}</Text>
            <Text style={styles.patientDate}>
              {new Date(createdAt).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </Text>
          </View>
        </View>
      </View>

      {/* Primary Diagnosis */}
      <View style={[styles.card, styles.diagnosisCard]}>
        <Text style={styles.diagnosisLabel}>Primary Diagnosis</Text>
        <Text style={styles.diagnosisValue}>
          {getResultLabel(topPrediction[0])}
        </Text>
        <View style={styles.confidenceBadge}>
          <Text style={styles.confidenceText}>
            {(parseFloat(topPrediction[1]) * 100).toFixed(1)}% Confidence
          </Text>
        </View>
      </View>

      {/* Detailed Results */}
      <Text style={styles.sectionTitle}>Detailed Analysis</Text>
      <Text style={styles.sectionSubtitle}>Tap any result to view exact percentage</Text>
      
      <View style={styles.card}>
        {Object.entries(results)
          .sort((a, b) => parseFloat(b[1]) - parseFloat(a[1]))
          .map(([key, value]) => {
            const percentage = parseFloat(value) * 100;
            const isSelected = selectedResult === key;
            
            return (
              <TouchableOpacity 
                key={key} 
                style={styles.resultRow}
                onPress={() => setSelectedResult(isSelected ? null : key)}
                activeOpacity={0.7}
              >
                <View style={styles.resultHeader}>
                  <Text style={styles.resultKey}>{getResultLabel(key)}</Text>
                  {isSelected && (
                    <View style={styles.percentageBadge}>
                      <Text style={styles.percentageText}>
                        {percentage.toFixed(2)}%
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.resultBarContainer}>
                  <View 
                    style={[
                      styles.resultBar, 
                      { width: `${Math.min(percentage, 100)}%` },
                      isSelected && styles.resultBarSelected
                    ]} 
                  />
                </View>
              </TouchableOpacity>
            );
          })}
      </View>

      {/* Patient Information */}
      <Text style={styles.sectionTitle}>Patient Information</Text>
      
      <View style={styles.card}>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Age Group</Text>
            <Text style={styles.infoValue}>{inputs.Age}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Sex</Text>
            <Text style={styles.infoValue}>
              {inputs.Sex === 'M' ? 'Male' : 'Female'}
            </Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Family History</Text>
            <Text style={styles.infoValue}>
              {inputs.Fhistory === 'Y' ? 'Yes' : 'No'}
            </Text>
          </View>
        </View>
      </View>

      {/* Symptoms */}
      {Object.entries(inputs).some(([k, v]) => v === "Y" && k !== "Fhistory") && (
        <>
          <Text style={styles.sectionTitle}>Reported Symptoms</Text>
          <View style={styles.card}>
            <View style={styles.symptomGrid}>
              {Object.entries(inputs)
                .filter(([key, val]) => val === "Y" && key !== "Fhistory")
                .map(([key]) => (
                  <View key={key} style={styles.symptomChip}>
                    <Text style={styles.symptomText}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </Text>
                  </View>
                ))}
            </View>
          </View>
        </>
      )}

      {/* Allergen Reactions */}
      {Object.entries(inputs).some(([k, v]) => 
        v !== "NA" && v !== "Y" && v !== "N" && !['Age', 'Sex', 'Fhistory'].includes(k)
      ) && (
        <>
          <Text style={styles.sectionTitle}>Allergen Reactions</Text>
          <View style={styles.card}>
            <View style={styles.allergenList}>
              {Object.entries(inputs)
                .filter(([key, val]) => 
                  val !== "NA" && val !== "Y" && val !== "N" && 
                  !['Age', 'Sex', 'Fhistory'].includes(key)
                )
                .map(([key, val]) => (
                  <View key={key} style={styles.allergenRow}>
                    <Text style={styles.allergenName}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </Text>
                    <View style={[styles.allergenBadge, styles[`allergen${val}`]]}>
                      <Text style={styles.allergenValue}>{val}</Text>
                    </View>
                  </View>
                ))}
            </View>
          </View>
        </>
      )}

      {/* Action Button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>← Back to Reports</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background 
  },
  content: {
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing['3xl'],
  },

  // Error State
  errorContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing['3xl'],
  },
  errorIcon: {
    fontSize: 60,
    marginBottom: theme.spacing.lg,
  },
  errorText: {
    fontSize: theme.fonts.xl,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
  },
  errorButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  errorButtonText: {
    color: theme.colors.surface,
    fontSize: theme.fonts.base,
    fontWeight: theme.fonts.semibold,
  },

  // Patient Card
  patientCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.md,
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  avatarText: {
    fontSize: theme.fonts['2xl'],
    fontWeight: theme.fonts.bold,
    color: theme.colors.surface,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: theme.fonts.xl,
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  patientDate: {
    fontSize: theme.fonts.sm,
    color: theme.colors.textSecondary,
  },

  // Cards
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.md,
  },
  diagnosisCard: {
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
  },
  diagnosisLabel: {
    color: theme.colors.surface + 'CC',
    fontSize: theme.fonts.sm,
    fontWeight: theme.fonts.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
  },
  diagnosisValue: {
    color: theme.colors.surface,
    fontSize: theme.fonts['3xl'],
    fontWeight: theme.fonts.bold,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  confidenceBadge: {
    backgroundColor: theme.colors.surface + '30',
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  confidenceText: {
    color: theme.colors.surface,
    fontSize: theme.fonts.base,
    fontWeight: theme.fonts.semibold,
  },

  // Sections
  sectionTitle: {
    fontSize: theme.fonts.xl,
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  sectionSubtitle: {
    fontSize: theme.fonts.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.base,
  },

  // Results with Clickable Bars
  resultRow: {
    marginBottom: theme.spacing.base,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  resultKey: {
    fontSize: theme.fonts.base,
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
    flex: 1,
  },
  percentageBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  percentageText: {
    color: theme.colors.surface,
    fontSize: theme.fonts.sm,
    fontWeight: theme.fonts.bold,
  },
  resultBarContainer: {
    height: 8,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
  },
  resultBar: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    minWidth: 2,
  },
  resultBarSelected: {
    backgroundColor: theme.colors.secondary,
  },

  // Info Grid
  infoGrid: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  infoDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.border,
  },
  infoLabel: {
    fontSize: theme.fonts.xs,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: theme.fonts.lg,
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },

  // Symptoms
  symptomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  symptomChip: {
    backgroundColor: theme.colors.primaryLight + '20',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.primaryLight + '40',
  },
  symptomText: {
    color: theme.colors.primary,
    fontSize: theme.fonts.sm,
    fontWeight: theme.fonts.medium,
  },

  // Allergens
  allergenList: {
    gap: theme.spacing.sm,
  },
  allergenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  allergenName: {
    fontSize: theme.fonts.base,
    color: theme.colors.text,
    flex: 1,
  },
  allergenBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    minWidth: 45,
    alignItems: 'center',
  },
  allergenValue: {
    fontSize: theme.fonts.sm,
    fontWeight: theme.fonts.bold,
    color: theme.colors.surface,
  },
  allergenHR: {
    backgroundColor: theme.colors.error,
  },
  allergenMR: {
    backgroundColor: theme.colors.warning,
  },
  allergenLR: {
    backgroundColor: theme.colors.success,
  },
  allergenNR: {
    backgroundColor: theme.colors.textLight,
  },

  // Action Button
  backButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.base,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  backButtonText: {
    color: theme.colors.surface,
    fontSize: theme.fonts.base,
    fontWeight: theme.fonts.semibold,
  },
});