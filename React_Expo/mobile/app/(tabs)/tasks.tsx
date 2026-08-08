import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

interface Task {
  _id: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: "Low" | "Medium" | "High";
  category: string;
  completed: boolean;
  reminder?: string;
}

export default function TasksScreen() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Filters State
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("");
  const [completed, setCompleted] = useState("");
  const [sortBy, setSortBy] = useState("dueDate");
  const [order, setOrder] = useState("asc");

  // AI Quick Add State
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const fetchTasks = async () => {
    try {
      const params: any = { sortBy, order };
      if (search.trim()) params.search = search.trim();
      if (priority) params.priority = priority;
      if (completed) params.completed = completed;

      const { data } = await api.get("/tasks", { params });
      setTasks(data.tasks);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchTasks();
      }
    }, [user, search, priority, completed, sortBy, order])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  }, [search, priority, completed, sortBy, order]);

  if (authLoading || !user) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F7F6F3" }}>
        <ActivityIndicator size="large" color="#3D5A80" />
      </View>
    );
  }

  const handleToggleComplete = async (task: Task) => {
    try {
      await api.put(`/tasks/${task._id}`, { completed: !task.completed });
      fetchTasks();
    } catch (err) {
      console.error("Error toggling completion:", err);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/tasks/${id}`);
            fetchTasks();
          } catch (err) {
            console.error("Error deleting task:", err);
          }
        },
      },
    ]);
  };

  const handleAIQuickAdd = async () => {
    if (!aiText.trim()) return;
    setAiLoading(true);
    try {
      // 1. Parse with AI
      const { data: parsed } = await api.post("/ai/parse-task", { text: aiText });
      // 2. Create the task
      await api.post("/tasks", parsed);
      setAiText("");
      Alert.alert("Success", "Task created successfully!");
      fetchTasks();
    } catch (err: any) {
      Alert.alert(
        "AI Parse Failed",
        err.response?.data?.message || "Could not parse input. Try adding manually."
      );
    } finally {
      setAiLoading(false);
    }
  };

  const formatDueDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "";

      const timeString = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const dateString = date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });

      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);

      const isSameDay = (d1: Date, d2: Date) =>
        d1.getDate() === d2.getDate() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getFullYear() === d2.getFullYear();

      if (isSameDay(date, today)) {
        return `Today at ${timeString}`;
      } else if (isSameDay(date, tomorrow)) {
        return `Tomorrow at ${timeString}`;
      } else {
        return `${dateString} at ${timeString}`;
      }
    } catch (e) {
      return "";
    }
  };

  const priorityColors = {
    High: { bg: "rgba(182, 92, 63, 0.1)", text: "#B65C3F" },
    Medium: { bg: "rgba(61, 90, 128, 0.1)", text: "#3D5A80" },
    Low: { bg: "rgba(18, 24, 27, 0.05)", text: "#666666" },
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Navbar */}
      <View style={styles.header}>
        <Text style={styles.title}>Your Tasks</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push({ pathname: "/modal", params: { mode: "create" } })}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* AI Quick Add Bar */}
      <View style={styles.aiContainer}>
        <TextInput
          style={styles.aiInput}
          value={aiText}
          onChangeText={setAiText}
          placeholder='✨ AI Add: "Call mom tomorrow at 6pm"'
          placeholderTextColor="#A0A0A0"
        />
        <TouchableOpacity
          style={[styles.aiButton, !aiText.trim() && styles.aiButtonDisabled]}
          onPress={handleAIQuickAdd}
          disabled={aiLoading || !aiText.trim()}
        >
          {aiLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="sparkles" size={16} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>

      {/* Filters Overlay */}
      <View style={styles.filtersContainer}>
        <View style={styles.searchWrapper}>
          <Ionicons name="search-outline" size={16} color="#A0A0A0" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search tasks..."
            placeholderTextColor="#A0A0A0"
          />
        </View>

        {/* Filter Scroll */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {/* Completed Chips */}
          <TouchableOpacity
            style={[styles.chip, completed === "" && styles.chipActive]}
            onPress={() => setCompleted("")}
          >
            <Text style={[styles.chipText, completed === "" && styles.chipTextActive]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, completed === "false" && styles.chipActive]}
            onPress={() => setCompleted("false")}
          >
            <Text style={[styles.chipText, completed === "false" && styles.chipTextActive]}>Pending</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, completed === "true" && styles.chipActive]}
            onPress={() => setCompleted("true")}
          >
            <Text style={[styles.chipText, completed === "true" && styles.chipTextActive]}>Completed</Text>
          </TouchableOpacity>

          {/* Priority Divider */}
          <View style={styles.chipDivider} />

          {/* Priority Chips */}
          <TouchableOpacity
            style={[styles.chip, priority === "" && styles.chipActive]}
            onPress={() => setPriority("")}
          >
            <Text style={[styles.chipText, priority === "" && styles.chipTextActive]}>All Priorities</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, priority === "High" && styles.chipActive]}
            onPress={() => setPriority("High")}
          >
            <Text style={[styles.chipText, priority === "High" && styles.chipTextActive]}>High</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, priority === "Medium" && styles.chipActive]}
            onPress={() => setPriority("Medium")}
          >
            <Text style={[styles.chipText, priority === "Medium" && styles.chipTextActive]}>Medium</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, priority === "Low" && styles.chipActive]}
            onPress={() => setPriority("Low")}
          >
            <Text style={[styles.chipText, priority === "Low" && styles.chipTextActive]}>Low</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Tasks List */}
      <ScrollView
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3D5A80" />
        }
      >
        {tasks.length > 0 ? (
          tasks.map((task) => {
            const colors = priorityColors[task.priority] || priorityColors.Low;
            const due = new Date(task.dueDate);
            const isOverdue = !task.completed && due < new Date();

            return (
              <View key={task._id} style={styles.card}>
                <View style={styles.cardRow}>
                  {/* Checkbox */}
                  <TouchableOpacity
                    style={[styles.checkbox, task.completed && styles.checkboxChecked]}
                    onPress={() => handleToggleComplete(task)}
                  >
                    {task.completed && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                  </TouchableOpacity>

                  {/* Task details */}
                  <View style={styles.taskTextWrapper}>
                    <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>
                      {task.title}
                    </Text>
                    {task.description ? (
                      <Text style={styles.taskDesc} numberOfLines={2}>
                        {task.description}
                      </Text>
                    ) : null}
                  </View>

                  {/* Priority Badge */}
                  <View style={[styles.priorityBadge, { backgroundColor: colors.bg }]}>
                    <Text style={[styles.priorityText, { color: colors.text }]}>{task.priority}</Text>
                  </View>
                </View>

                {/* Footer details */}
                <View style={styles.cardFooter}>
                  <View style={styles.cardFooterLeft}>
                    <Text style={[styles.dueDate, isOverdue && styles.dueDateOverdue]}>
                      Due {formatDueDate(task.dueDate)}
                    </Text>
                    <Text style={styles.footerSeparator}>•</Text>
                    <Text style={styles.categoryTag}>{task.category}</Text>
                  </View>

                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      onPress={() =>
                        router.push({ pathname: "/modal", params: { mode: "edit", taskId: task._id } })
                      }
                      style={styles.actionBtn}
                    >
                      <Ionicons name="create-outline" size={16} color="#666666" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(task._id)} style={styles.actionBtn}>
                      <Ionicons name="trash-outline" size={16} color="#B65C3F" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="clipboard-outline" size={48} color="#A0A0A0" style={styles.emptyIcon} />
            <Text style={styles.emptyText}>No tasks found</Text>
            <Text style={styles.emptySubtext}>Add a task manually or let AI draft it for you.</Text>
          </View>
        )}
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
  },
  title: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 24,
    fontWeight: "bold",
    color: "#12181B",
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#3D5A80",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  aiContainer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 8,
  },
  aiInput: {
    flex: 1,
    backgroundColor: "rgba(61, 90, 128, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(61, 90, 128, 0.2)",
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: "#12181B",
  },
  aiButton: {
    backgroundColor: "#3D5A80",
    width: 38,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  aiButtonDisabled: {
    opacity: 0.6,
  },
  filtersContainer: {
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 12,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1DED6",
    borderRadius: 4,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 13,
    color: "#12181B",
  },
  filterScroll: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 4,
    gap: 6,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E1DED6",
    backgroundColor: "#FFFFFF",
  },
  chipActive: {
    backgroundColor: "#3D5A80",
    borderColor: "#3D5A80",
  },
  chipText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#666666",
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
  chipDivider: {
    width: 1,
    height: 16,
    backgroundColor: "#E1DED6",
    marginHorizontal: 4,
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1DED6",
    borderRadius: 6,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#3D5A80",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: "#3D5A80",
    borderColor: "#3D5A80",
  },
  taskTextWrapper: {
    flex: 1,
    gap: 2,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#12181B",
  },
  taskTitleCompleted: {
    textDecorationLine: "line-through",
    color: "#A0A0A0",
  },
  taskDesc: {
    fontSize: 12,
    color: "#666666",
    lineHeight: 16,
  },
  priorityBadge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F7F6F3",
    marginTop: 12,
    paddingTop: 10,
  },
  cardFooterLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  dueDate: {
    fontSize: 11,
    color: "#666666",
    fontWeight: "500",
  },
  dueDateOverdue: {
    color: "#B65C3F",
    fontWeight: "600",
  },
  footerSeparator: {
    color: "#A0A0A0",
    marginHorizontal: 8,
    fontSize: 10,
  },
  categoryTag: {
    fontSize: 11,
    fontWeight: "600",
    color: "#3D5A80",
    backgroundColor: "rgba(61, 90, 128, 0.05)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    padding: 4,
  },
  emptyContainer: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#E1DED6",
    borderRadius: 6,
    paddingVertical: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    marginTop: 12,
  },
  emptyIcon: {
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#12181B",
    marginBottom: 2,
  },
  emptySubtext: {
    fontSize: 12,
    color: "#666666",
    textAlign: "center",
    paddingHorizontal: 24,
  },
});
