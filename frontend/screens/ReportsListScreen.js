// screens/ReportsListScreen.js
import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  RefreshControl 
} from "react-native";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "../theme";
import { NODE_BASE_URL } from "../config/api";

export default function ReportsListScreen() {
  const navigation = useNavigation();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const userStr = await AsyncStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;

      if (!user || !user.email) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "User not found. Please log in again.",
        });
        navigation.navigate("Login");
        return;
      }

      const response = await fetch(`${NODE_BASE_URL}/api/reports/${user.email}`);
      const data = await response.json();

      if (response.ok) {
        setReports(data.reports || []);
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: data.error || "Could not fetch reports",
        });
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      Toast.show({
        type: "error",
        text1: "Network Error",
        text2: "Could not connect to server",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
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

  const getResultColor = (key) => {
    const colors = {
      N: theme.colors.success,
      R: theme.colors.warning,
      O: theme.colors.secondary,
      U: theme.colors.textLight,
      UR: theme.colors.error,
      UO: theme.colors.error,
      RO: theme.colors.error,
    };
    return colors[key] || theme.colors.textLight;
  };

  const renderItem = ({ item }) => {
    const color = getResultColor(item.topResult);
    
    return (
      <TouchableOpacity 
        style={styles.reportCard} 
        onPress={() => navigation.navigate("ReportDetail", { diagnosis: item })}
        activeOpacity={0.7}
      >
        <View style={[styles.statusIndicator, { backgroundColor: color }]} />
        <View style={styles.reportContent}>
          <View style={styles.reportHeader}>
            <View style={styles.reportTitleContainer}>
              <Text style={styles.reportTitle}>{getResultLabel(item.topResult)}</Text>
              <View style={[styles.statusBadge, { backgroundColor: color + '20' }]}>
                <View style={[styles.statusDot, { backgroundColor: color }]} />
                <Text style={[styles.statusText, { color: color }]}>Completed</Text>
              </View>
            </View>
            <Text style={styles.reportArrow}>→</Text>
          </View>
          
          <View style={styles.reportMeta}>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>📅</Text>
              <Text style={styles.metaText}>
                {new Date(item.createdAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>⏰</Text>
              <Text style={styles.metaText}>
                {new Date(item.createdAt).toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading reports...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {reports.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
          </View>
          <Text style={styles.emptyTitle}>No Reports Yet</Text>
          <Text style={styles.emptyText}>
            Your diagnosis reports will appear here once you complete an assessment
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => navigation.navigate("NewDiagnosis")}
          >
            <Text style={styles.emptyButtonText}>Create Your First Diagnosis</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>My Reports</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{reports.length}</Text>
            </View>
          </View>
          <FlatList 
            data={reports} 
            keyExtractor={(item) => item._id} 
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[theme.colors.primary]}
                tintColor={theme.colors.primary}
              />
            }
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background 
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fonts.base,
    color: theme.colors.textSecondary,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: theme.fonts.xl,
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  countBadge: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    minWidth: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.sm,
  },
  countText: {
    color: theme.colors.surface,
    fontSize: theme.fonts.sm,
    fontWeight: theme.fonts.bold,
  },

  // List
  listContent: {
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  reportCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    flexDirection: 'row',
    ...theme.shadows.md,
  },
  statusIndicator: {
    width: 4,
  },
  reportContent: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  reportTitleContainer: {
    flex: 1,
  },
  reportTitle: {
    fontSize: theme.fonts.lg,
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: theme.spacing.xs,
  },
  statusText: {
    fontSize: theme.fonts.xs,
    fontWeight: theme.fonts.semibold,
    textTransform: 'uppercase',
  },
  reportArrow: {
    fontSize: theme.fonts['2xl'],
    color: theme.colors.textLight,
  },
  reportMeta: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    fontSize: 14,
    marginRight: theme.spacing.xs,
  },
  metaText: {
    fontSize: theme.fonts.sm,
    color: theme.colors.textSecondary,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing['3xl'],
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
  },
  emptyIcon: {
    fontSize: 60,
  },
  emptyTitle: {
    fontSize: theme.fonts['2xl'],
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: theme.fonts.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  emptyButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  emptyButtonText: {
    color: theme.colors.surface,
    fontSize: theme.fonts.base,
    fontWeight: theme.fonts.semibold,
  },
});