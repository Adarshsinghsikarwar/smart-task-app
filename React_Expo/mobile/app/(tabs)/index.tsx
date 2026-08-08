import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";

interface Task {
  _id: string;
  title: string;
  reminder: string;
  dueDate: string;
}

interface Stats {
  pending: number;
  completed: number;
  upcomingReminders: Task[];
}

export default function DashboardScreen() {
  const { user, loading, logout } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    try {
      setError("");
      const { data } = await api.get("/tasks/stats/dashboard");
      setStats(data);
    } catch (err: any) {
      console.error("Error fetching stats:", err);
      setError("Failed to load dashboard data.");
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchStats();
      }
    }, [user])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  }, []);

  const handleLogout = () => {
    logout();
  };

  if (loading || !user) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F7F6F3" }}>
        <ActivityIndicator size="large" color="#3D5A80" />
      </View>
    );
  }

  const formatReminderTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "";
      return date.toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>
            Flucy<Text style={styles.dot}>.</Text>
          </Text>
          <Text style={styles.greeting}>Hi, {user?.name || "User"}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#B65C3F" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3D5A80" />
        }
      >
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.iconWrapper, { backgroundColor: "rgba(61, 90, 128, 0.1)" }]}>
              <Ionicons name="hourglass-outline" size={20} color="#3D5A80" />
            </View>
            <Text style={styles.statLabel}>Pending</Text>
            <Text style={styles.statValue}>{stats ? stats.pending : "–"}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.iconWrapper, { backgroundColor: "rgba(76, 175, 80, 0.1)" }]}>
              <Ionicons name="checkmark-done-outline" size={20} color="#4CAF50" />
            </View>
            <Text style={styles.statLabel}>Completed</Text>
            <Text style={styles.statValue}>{stats ? stats.completed : "–"}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.iconWrapper, { backgroundColor: "rgba(182, 92, 63, 0.1)" }]}>
              <Ionicons name="notifications-outline" size={20} color="#B65C3F" />
            </View>
            <Text style={styles.statLabel}>Reminders</Text>
            <Text style={styles.statValue}>
              {stats ? stats.upcomingReminders.length : "–"}
            </Text>
          </View>
        </View>

        {/* Upcoming Reminders Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Reminders</Text>

          {stats?.upcomingReminders && stats.upcomingReminders.length > 0 ? (
            <View style={styles.remindersList}>
              {stats.upcomingReminders.map((task) => (
                <View key={task._id} style={styles.reminderItem}>
                  <View style={styles.reminderLeft}>
                    <Ionicons name="alarm-outline" size={16} color="#B65C3F" style={styles.alarmIcon} />
                    <Text style={styles.reminderTitle} numberOfLines={1}>
                      {task.title}
                    </Text>
                  </View>
                  <Text style={styles.reminderTime}>
                    {formatReminderTime(task.reminder)}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={32} color="#A0A0A0" style={styles.emptyIcon} />
              <Text style={styles.emptyText}>Nothing scheduled.</Text>
              <Text style={styles.emptySubtext}>Add a task with a reminder to see it here.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F6F3",
    paddingTop: Platform.OS === "android" ? 40 : 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E1DED6",
    backgroundColor: "#F7F6F3",
  },
  logo: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 22,
    fontWeight: "bold",
    color: "#12181B",
  },
  dot: {
    color: "#3D5A80",
  },
  greeting: {
    fontSize: 12,
    color: "#666666",
    marginTop: 2,
    fontWeight: "500",
  },
  logoutButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#E1DED6",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContainer: {
    padding: 24,
    gap: 24,
  },
  errorText: {
    color: "#B65C3F",
    fontSize: 13,
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1DED6",
    borderRadius: 6,
    padding: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: "#666666",
    marginBottom: 2,
  },
  statValue: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 20,
    fontWeight: "bold",
    color: "#12181B",
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 18,
    fontWeight: "600",
    color: "#12181B",
  },
  remindersList: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1DED6",
    borderRadius: 6,
    overflow: "hidden",
  },
  reminderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F7F6F3",
  },
  reminderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  alarmIcon: {
    marginRight: 8,
  },
  reminderTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#12181B",
    flex: 1,
  },
  reminderTime: {
    fontSize: 12,
    color: "#B65C3F",
    fontWeight: "600",
  },
  emptyContainer: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#E1DED6",
    borderRadius: 6,
    paddingVertical: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  emptyIcon: {
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#12181B",
    marginBottom: 2,
  },
  emptySubtext: {
    fontSize: 12,
    color: "#666666",
  },
});
