// screens/NewDiagnosisScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  LayoutAnimation,
  Platform,
  UIManager,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "../theme";
import { INTERNAL_SHARED_KEY } from "@env";
import { FLASK_BASE_URL } from "../config/api";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function NewDiagnosisScreen() {
  const navigation = useNavigation();
  const [expandedSection, setExpandedSection] = useState("demographics");
  const [loading, setLoading] = useState(false);

  const toggleSection = (section) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSection(expandedSection === section ? null : section);
  };

  const [ageGroup, setAgeGroup] = useState("G1");
  const [sex, setSex] = useState("M");
  const [familyHistory, setFamilyHistory] = useState("N");

  const [symptoms, setSymptoms] = useState({
    runningnose: false,
    sneeze: false,
    cough: false,
    wheezeBlocks: false,
    headache: false,
    itching: false,
    swelling: false,
    redrashes: false,
  });

  const defaultInputs = {
    housedust: "NA", cottondust: "NA", aspergilus: "NA", pollen: "NA",
    parthenium: "NA", cockroach: "NA", catdander: "NA", dosfur: "NA",
    roaddust: "NA", oldpdust: "NA", PSdust: "NA", MilkP: "NA",
    MilkC: "NA", curd: "NA", coffee: "NA", tea: "NA", beef: "NA",
    chicken: "NA", mutton: "NA", egg: "NA", fishA: "NA", fishB: "NA",
    crab: "NA", prawns: "NA", shark: "NA", banana: "NA", beans: "NA",
    brinjal: "NA", cabbage: "NA", capsicum: "NA", carrot: "NA",
    cauliflower: "NA", corn: "NA", drumstick: "NA", greens: "NA",
    mango: "NA", mushroom: "NA", onion: "NA", peas: "NA", potato: "NA",
    tomato: "NA", wheat: "NA", rice: "NA", maida: "NA", ragi: "NA",
    oats: "NA", spices: "NA", nuts: "NA", coconut: "NA", oil: "NA",
    garlic: "NA", ginger: "NA", pepper: "NA", tamarind: "NA",
    aginomoto: "NA", coco: "NA", horlicks: "NA", boost: "NA",
  };

  const [inputs, setInputs] = useState(defaultInputs);

  const handleToggle = (key, value) => {
    setSymptoms((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!ageGroup || !sex) {
      Toast.show({ type: "error", text1: "Please fill Age and Sex" });
      return;
    }

    setLoading(true);

    const defaults = {
      Age: "G1", Sex: "M", Fhistory: "N",
      ...Object.fromEntries(Object.keys(symptoms).map((k) => [k, "N"])),
      ...defaultInputs,
    };

    const current = {
      Age: ageGroup, Sex: sex, Fhistory: familyHistory,
      ...Object.fromEntries(Object.entries(symptoms).map(([k, v]) => [k, v ? "Y" : "N"])),
      ...inputs,
    };

    const diffPayload = Object.fromEntries(
      Object.entries(current).filter(([key, val]) => val !== defaults[key])
    );

    try {
      const response = await fetch(`${FLASK_BASE_URL}/api/diagnose`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-key": INTERNAL_SHARED_KEY,
        },
        body: JSON.stringify(diffPayload),
      });

      const data = await response.json();

      if (response.ok) {
        const userStr = await AsyncStorage.getItem("user");
        const user = userStr ? JSON.parse(userStr) : null;

        navigation.navigate("DiagnosisResult", {
          inputs: current,
          results: data.result,
          userEmail: user?.email,
          userName: user?.firstName || "User",
        });

        Toast.show({
          type: "success",
          text1: "Diagnosis Complete",
          text2: "View your results below",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Server Error",
          text2: data.error || "Could not complete diagnosis",
        });
      }
    } catch (err) {
      console.error("Error during diagnosis:", err);
      Toast.show({
        type: "error",
        text1: "Network Error",
        text2: "Unable to connect to diagnosis service",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderDropdown = (item) => (
    <View key={item} style={styles.dropdownContainer}>
      <Text style={styles.dropdownLabel}>
        {item.charAt(0).toUpperCase() + item.slice(1)}
      </Text>
      <View style={styles.pickerWrap}>
        <Picker
          selectedValue={inputs[item]}
          onValueChange={(val) => setInputs({ ...inputs, [item]: val })}
          style={styles.picker}
        >
          <Picker.Item label="Not Applicable" value="NA" />
          <Picker.Item label="No Reaction" value="NR" />
          <Picker.Item label="Low Reaction" value="LR" />
          <Picker.Item label="Medium Reaction" value="MR" />
          <Picker.Item label="High Reaction" value="HR" />
        </Picker>
      </View>
    </View>
  );

  const sections = [
    {
      id: "demographics",
      icon: "👤",
      title: "Demographics",
      color: theme.colors.primary,
    },
    {
      id: "symptoms",
      icon: "🩺",
      title: "Symptoms",
      color: theme.colors.secondary,
    },
    {
      id: "dust",
      icon: "🌫️",
      title: "Dust & Environmental",
      color: theme.colors.warning,
    },
    {
      id: "food",
      icon: "🍽️",
      title: "Food Allergens",
      color: theme.colors.success,
    },
    {
      id: "misc",
      icon: "🧂",
      title: "Spices & Additives",
      color: theme.colors.info,
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIconContainer}>
          <Text style={styles.headerIcon}>🩺</Text>
        </View>
        <Text style={styles.heading}>New Allergy Diagnosis</Text>
        <Text style={styles.subheading}>Complete the assessment below</Text>
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Completed: {Object.keys(symptoms).filter(k => symptoms[k]).length} symptoms selected
        </Text>
      </View>

      {/* Sections */}
      {sections.map((section) => (
        <View key={section.id} style={styles.sectionWrapper}>
          <TouchableOpacity
            onPress={() => toggleSection(section.id)}
            style={[styles.sectionHeader, { borderLeftColor: section.color }]}
            activeOpacity={0.7}
          >
            <View style={[styles.sectionIconContainer, { backgroundColor: section.color + '20' }]}>
              <Text style={styles.sectionIcon}>{section.icon}</Text>
            </View>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionArrow}>
              {expandedSection === section.id ? '▼' : '▶'}
            </Text>
          </TouchableOpacity>

          {expandedSection === section.id && (
            <View style={styles.sectionContent}>
              {section.id === "demographics" && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Age Group *</Text>
                    <View style={styles.pickerWrap}>
                      <Picker selectedValue={ageGroup} onValueChange={setAgeGroup} style={styles.picker}>
                        <Picker.Item label="G1 (0-10 years)" value="G1" />
                        <Picker.Item label="G2 (11-20 years)" value="G2" />
                        <Picker.Item label="G3 (21-40 years)" value="G3" />
                        <Picker.Item label="G4 (41-60 years)" value="G4" />
                        <Picker.Item label="G5 (60+ years)" value="G5" />
                      </Picker>
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Sex *</Text>
                    <View style={styles.pickerWrap}>
                      <Picker selectedValue={sex} onValueChange={setSex} style={styles.picker}>
                        <Picker.Item label="Male" value="M" />
                        <Picker.Item label="Female" value="F" />
                      </Picker>
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Family History of Allergies</Text>
                    <View style={styles.pickerWrap}>
                      <Picker selectedValue={familyHistory} onValueChange={setFamilyHistory} style={styles.picker}>
                        <Picker.Item label="No" value="N" />
                        <Picker.Item label="Yes" value="Y" />
                      </Picker>
                    </View>
                  </View>
                </>
              )}

              {section.id === "symptoms" && (
                <View style={styles.switchList}>
                  {Object.keys(symptoms).map((key) => (
                    <View key={key} style={styles.switchRow}>
                      <Text style={styles.switchLabel}>
                        {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                      </Text>
                      <Switch
                        value={symptoms[key]}
                        onValueChange={(val) => handleToggle(key, val)}
                        trackColor={{ false: theme.colors.border, true: theme.colors.primary + '80' }}
                        thumbColor={symptoms[key] ? theme.colors.primary : theme.colors.surface}
                      />
                    </View>
                  ))}
                </View>
              )}

              {section.id === "dust" && (
                <View style={styles.dropdownList}>
                  {["housedust", "cottondust", "aspergilus", "pollen", "parthenium",
                    "cockroach", "catdander", "dosfur", "roaddust", "oldpdust", "PSdust"]
                    .map(renderDropdown)}
                </View>
              )}

              {section.id === "food" && (
                <View style={styles.dropdownList}>
                  {["MilkP", "MilkC", "curd", "coffee", "tea", "beef", "chicken", "mutton",
                    "egg", "fishA", "fishB", "crab", "prawns", "shark", "banana", "beans",
                    "brinjal", "cabbage", "capsicum", "carrot", "cauliflower", "corn",
                    "drumstick", "greens", "mango", "mushroom", "onion", "peas", "potato",
                    "tomato", "wheat", "rice", "maida", "ragi", "oats", "spices", "nuts"]
                    .map(renderDropdown)}
                </View>
              )}

              {section.id === "misc" && (
                <View style={styles.dropdownList}>
                  {["coconut", "oil", "garlic", "ginger", "pepper", "tamarind",
                    "aginomoto", "coco", "horlicks", "boost"]
                    .map(renderDropdown)}
                </View>
              )}
            </View>
          )}
        </View>
      ))}

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={theme.colors.surface} />
        ) : (
          <>
            <Text style={styles.submitIcon}>✓</Text>
            <Text style={styles.submitText}>Complete Diagnosis</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background,
    flexGrow: 1,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  headerIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  headerIcon: {
    fontSize: 40,
  },
  heading: {
    fontSize: theme.fonts['3xl'],
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subheading: {
    fontSize: theme.fonts.base,
    color: theme.colors.textSecondary,
  },

  // Progress
  progressContainer: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.sm,
  },
  progressText: {
    fontSize: theme.fonts.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },

  // Sections
  sectionWrapper: {
    marginBottom: theme.spacing.md,
  },
  sectionHeader: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    ...theme.shadows.sm,
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  sectionIcon: {
    fontSize: 20,
  },
  sectionTitle: {
    flex: 1,
    fontSize: theme.fonts.lg,
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  sectionArrow: {
    fontSize: theme.fonts.base,
    color: theme.colors.textLight,
  },
  sectionContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.base,
    marginTop: theme.spacing.sm,
    ...theme.shadows.sm,
  },

  // Input Groups
  inputGroup: {
    marginBottom: theme.spacing.base,
  },
  inputLabel: {
    fontSize: theme.fonts.sm,
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  pickerWrap: {
    backgroundColor: theme.colors.inputBackground,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },

  // Switches
  switchList: {
    gap: theme.spacing.xs,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.inputBackground,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xs,
  },
  switchLabel: {
    fontSize: theme.fonts.base,
    color: theme.colors.text,
    flex: 1,
  },

  // Dropdowns
  dropdownList: {
    gap: theme.spacing.sm,
  },
  dropdownContainer: {
    marginBottom: theme.spacing.sm,
  },
  dropdownLabel: {
    fontSize: theme.fonts.sm,
    fontWeight: theme.fonts.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },

  // Submit Button
  submitButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.xl,
    ...theme.shadows.lg,
  },
  submitIcon: {
    fontSize: 24,
    marginRight: theme.spacing.sm,
  },
  submitText: {
    color: theme.colors.surface,
    fontSize: theme.fonts.lg,
    fontWeight: theme.fonts.bold,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});