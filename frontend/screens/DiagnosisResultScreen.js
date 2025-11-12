// screens/DiagnosisResultScreen.js
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Animated } from "react-native";
import { theme } from "../theme";
import Toast from "react-native-toast-message";

export default function DiagnosisResultScreen({ route, navigation }) {
  const { inputs, results, userEmail, userName } = route.params;
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);

  const handleSave = async () => {
    if (!userEmail) {
      Toast.show({ 
        type: "error", 
        text1: "Cannot Save", 
        text2: "User email not found" 
      });
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("http://localhost:5000/api/saveDiagnosis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userEmail, 
          userName,
          inputs, 
          results 
        }),
      });

      const data = await res.json();

      if (res.ok) {
        Toast.show({ 
          type: "success", 
          text1: "Saved!", 
          text2: "Diagnosis saved successfully" 
        });
      } else {
        Toast.show({ 
          type: "error", 
          text1: "Error", 
          text2: data.error || "Save failed" 
        });
      }
    } catch (err) {
      console.error("Save error:", err);
      Toast.show({ 
        type: "error", 
        text1: "Network Error", 
        text2: "Could not save to backend" 
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePDF = async () => {
    setGenerating(true);

    try {
      const res = await fetch("http://localhost:5000/api/generatePDF", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs, results }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate PDF");
      }

      const htmlContent = await res.text();

      if (typeof window !== 'undefined' && window.open) {
        const newWindow = window.open();
        newWindow.document.write(htmlContent);
        newWindow.document.close();
      }

      Toast.show({ 
        type: "success", 
        text1: "PDF Generated", 
        text2: "Report opened in new window" 
      });
    } catch (err) {
      console.error("PDF error:", err);
      Toast.show({ 
        type: "error", 
        text1: "PDF Error", 
        text2: "Could not generate PDF" 
      });
    } finally {
      setGenerating(false);
    }
  };

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
    <ScrollView contentContainerStyle={styles.container}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.iconCircle}>
          <Text style={styles.heroIcon}>🩺</Text>
        </View>
        <Text style={styles.heroTitle}>Diagnosis Complete</Text>
        <Text style={styles.heroSubtitle}>Review your allergy assessment results</Text>
      </View>

      {/* Top Prediction Card */}
      <View style={[styles.card, styles.topPredictionCard]}>
        <Text style={styles.cardLabel}>Primary Diagnosis</Text>
        <Text style={styles.topPredictionValue}>
          {getResultLabel(topPrediction[0])}
        </Text>
        <View style={styles.confidenceBadge}>
          <Text style={styles.confidenceText}>
            {(parseFloat(topPrediction[1]) * 100).toFixed(1)}% Confidence
          </Text>
        </View>
      </View>

      {/* All Results Section */}
      <View style={styles.sectionContainer}>
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
      </View>

      {/* Input Summary Section */}
      <View style={styles.sectionContainer}>
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
              <Text style={styles.infoValue}>{inputs.Sex === 'M' ? 'Male' : 'Female'}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Family History</Text>
              <Text style={styles.infoValue}>{inputs.Fhistory === 'Y' ? 'Yes' : 'No'}</Text>
            </View>
          </View>
        </View>

        {/* Symptoms */}
        {Object.entries(inputs).some(([k, v]) => v === "Y" && k !== "Fhistory") && (
          <View style={[styles.card, { marginTop: theme.spacing.md }]}>
            <Text style={styles.cardSubtitle}>Reported Symptoms</Text>
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
        )}

        {/* Allergen Reactions */}
        {Object.entries(inputs).some(([k, v]) => 
          v !== "NA" && v !== "Y" && v !== "N" && !['Age', 'Sex', 'Fhistory'].includes(k)
        ) && (
          <View style={[styles.card, { marginTop: theme.spacing.md }]}>
            <Text style={styles.cardSubtitle}>Allergen Reactions</Text>
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
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.primaryButton, saving && styles.buttonDisabled]} 
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.buttonIcon}>💾</Text>
              <Text style={styles.primaryButtonText}>Save Diagnosis</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.secondaryButton, generating && styles.buttonDisabled]} 
          onPress={handlePDF}
          disabled={generating}
        >
          {generating ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : (
            <>
              <Text style={styles.buttonIcon}>📄</Text>
              <Text style={styles.secondaryButtonText}>Generate PDF</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.outlineButton} 
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.buttonIcon}>🏠</Text>
          <Text style={styles.outlineButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    padding: theme.spacing.lg, 
    backgroundColor: theme.colors.background,
    flexGrow: 1 
  },
  
  // Hero Section
  heroSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  heroIcon: {
    fontSize: 40,
  },
  heroTitle: {
    fontSize: theme.fonts['3xl'],
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  heroSubtitle: {
    fontSize: theme.fonts.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },

  // Cards
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.md,
  },
  topPredictionCard: {
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  cardLabel: {
    color: theme.colors.surface + 'CC',
    fontSize: theme.fonts.sm,
    fontWeight: theme.fonts.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
  },
  topPredictionValue: {
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
  sectionContainer: {
    marginBottom: theme.spacing.xl,
  },
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
  cardSubtitle: {
    fontSize: theme.fonts.base,
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },

  // Results
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

  // Action Buttons
  actionButtons: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.base,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.base,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  secondaryButton: {
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.base,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.base,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonIcon: {
    fontSize: 20,
    marginRight: theme.spacing.sm,
  },
  primaryButtonText: {
    color: theme.colors.surface,
    fontSize: theme.fonts.base,
    fontWeight: theme.fonts.semibold,
  },
  secondaryButtonText: {
    color: theme.colors.primary,
    fontSize: theme.fonts.base,
    fontWeight: theme.fonts.semibold,
  },
  outlineButtonText: {
    color: theme.colors.text,
    fontSize: theme.fonts.base,
    fontWeight: theme.fonts.medium,
  },
});