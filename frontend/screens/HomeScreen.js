// screens/HomeScreen.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { theme } from "../theme";

export default function HomeScreen() {
  const navigation = useNavigation();

  const handleLogout = async () => {
    await AsyncStorage.removeItem("user");
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  const menuItems = [
    {
      icon: "➕",
      title: "New Diagnosis",
      subtitle: "Start a new allergy assessment",
      color: theme.colors.primary,
      onPress: () => navigation.navigate("NewDiagnosis"),
    },
    {
      icon: "📋",
      title: "View Reports",
      subtitle: "Access your diagnosis history",
      color: theme.colors.secondary,
      onPress: () => navigation.navigate("ReportsList"),
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello! 👋</Text>
          <Text style={styles.headerTitle}>Allergy Diagnosis System</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutIcon}>🚪</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeIconContainer}>
            <Text style={styles.welcomeIcon}>🩺</Text>
          </View>
          <Text style={styles.welcomeTitle}>Welcome to Your Health Dashboard</Text>
          <Text style={styles.welcomeText}>
            Manage your allergy assessments and track your health journey
          </Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuCard, { borderLeftColor: item.color }]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: item.color + '20' }]}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Text style={styles.menuArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Quick Tips</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipIcon}>💡</Text>
            <Text style={styles.tipText}>
              Complete assessments regularly to track changes in your allergies over time
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing['3xl'],
    paddingBottom: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.sm,
  },
  greeting: {
    fontSize: theme.fonts.base,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  headerTitle: {
    fontSize: theme.fonts.xl,
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  logoutButton: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.error + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutIcon: {
    fontSize: 24,
  },

  // Content
  content: {
    padding: theme.spacing.xl,
  },
  
  // Welcome Card
  welcomeCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    ...theme.shadows.lg,
  },
  welcomeIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.surface + '30',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  welcomeIcon: {
    fontSize: 32,
  },
  welcomeTitle: {
    fontSize: theme.fonts.xl,
    fontWeight: theme.fonts.bold,
    color: theme.colors.surface,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  welcomeText: {
    fontSize: theme.fonts.base,
    color: theme.colors.surface + 'DD',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Menu
  menuContainer: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  menuCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    ...theme.shadows.md,
  },
  menuIconContainer: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  menuIcon: {
    fontSize: 28,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: theme.fonts.lg,
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  menuSubtitle: {
    fontSize: theme.fonts.sm,
    color: theme.colors.textSecondary,
  },
  menuArrow: {
    fontSize: theme.fonts.xl,
    color: theme.colors.textLight,
  },

  // Info Section
  infoSection: {
    marginBottom: theme.spacing.xl,
  },
  infoTitle: {
    fontSize: theme.fonts.lg,
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  tipCard: {
    backgroundColor: theme.colors.info + '15',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.info + '30',
  },
  tipIcon: {
    fontSize: 24,
    marginRight: theme.spacing.md,
  },
  tipText: {
    flex: 1,
    fontSize: theme.fonts.sm,
    color: theme.colors.text,
    lineHeight: 20,
  },
});