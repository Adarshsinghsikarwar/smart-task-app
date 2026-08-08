import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import api from "../lib/api";

const PRESET_CATEGORIES = ["Work", "Personal", "Finance", "Health", "Shopping"];

export default function TaskModalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const mode = params.mode || "create"; // "create" or "edit"
  const taskId = params.taskId;

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [aiSuggestLoading, setAiSuggestLoading] = useState(false);

  // Form Fields State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium");
  const [category, setCategory] = useState("Personal");
  const [reminder, setReminder] = useState("");

  // Helper to format Date objects as "YYYY-MM-DD HH:MM"
  const formatDateTimeString = (d: Date) => {
    const pad = (num: number) => String(num).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  // Initialize dates
  useEffect(() => {
    if (mode === "create") {
      const now = new Date();
      // Due tomorrow at same time
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      tomorrow.setMinutes(0);
      setDueDate(formatDateTimeString(tomorrow));

      // Reminder tomorrow 1 hour earlier
      const reminderTime = new Date(tomorrow);
      reminderTime.setHours(tomorrow.getHours() - 1);
      setReminder(formatDateTimeString(reminderTime));
    }
  }, [mode]);

  // Load task details for Edit Mode
  useEffect(() => {
    if (mode === "edit" && taskId) {
      const fetchTaskDetails = async () => {
        setFetchLoading(true);
        try {
          const { data } = await api.get(`/tasks/${taskId}`);
          setTitle(data.title);
          setDescription(data.description || "");
          setPriority(data.priority);
          setCategory(data.category);
          
          if (data.dueDate) {
            setDueDate(formatDateTimeString(new Date(data.dueDate)));
          }
          if (data.reminder) {
            setReminder(formatDateTimeString(new Date(data.reminder)));
          }
        } catch (err: any) {
          Alert.alert("Error", "Failed to fetch task details.");
          router.back();
        } finally {
          setFetchLoading(false);
        }
      };

      fetchTaskDetails();
    }
  }, [mode, taskId]);

  // AI Suggestion Handler
  const handleAISuggest = async () => {
    if (!title.trim()) {
      Alert.alert("Required", "Please enter a task title first to get AI suggestions.");
      return;
    }

    setAiSuggestLoading(true);
    try {
      const { data } = await api.post("/ai/suggest", {
        title: title.trim(),
        description: description.trim(),
      });
      
      if (data.priority) setPriority(data.priority);
      if (data.category) setCategory(data.category);
      Alert.alert("AI Applied", `Category set to "${data.category}" and Priority to "${data.priority}"`);
    } catch (err: any) {
      Alert.alert("AI Error", "Failed to get suggestions. Please set them manually.");
    } finally {
      setAiSuggestLoading(false);
    }
  };

  // Submit Handler
  const handleSubmit = async () => {
    if (!title.trim() || !dueDate.trim()) {
      Alert.alert("Required", "Title and Due Date are required.");
      return;
    }

    // Basic date parsing validation check
    const parsedDue = new Date(dueDate.replace(" ", "T"));
    if (isNaN(parsedDue.getTime())) {
      Alert.alert("Invalid Date", "Due Date format must be YYYY-MM-DD HH:MM");
      return;
    }

    let parsedReminder = undefined;
    if (reminder.trim()) {
      parsedReminder = new Date(reminder.replace(" ", "T"));
      if (isNaN(parsedReminder.getTime())) {
        Alert.alert("Invalid Date", "Reminder Date format must be YYYY-MM-DD HH:MM");
        return;
      }
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      dueDate: parsedDue.toISOString(),
      priority,
      category: category.trim(),
      reminder: parsedReminder ? parsedReminder.toISOString() : undefined,
    };

    setLoading(true);
    try {
      if (mode === "edit" && taskId) {
        await api.put(`/tasks/${taskId}`, payload);
      } else {
        await api.post("/tasks", payload);
      }
      router.back();
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Failed to save task.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3D5A80" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.modalTitle}>{mode === "edit" ? "Edit Task" : "Create Task"}</Text>

      {/* Form Fields */}
      <View style={styles.form}>
        
        {/* Title & AI Button */}
        <View style={styles.inputGroup}>
          <View style={styles.titleHeader}>
            <Text style={styles.label}>Task Title</Text>
            <TouchableOpacity 
              style={styles.aiSuggestBtn} 
              onPress={handleAISuggest}
              disabled={aiSuggestLoading}
            >
              {aiSuggestLoading ? (
                <ActivityIndicator size="small" color="#3D5A80" />
              ) : (
                <>
                  <Ionicons name="sparkles" size={12} color="#3D5A80" />
                  <Text style={styles.aiSuggestText}>AI Suggest</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Schedule meeting with designer"
            placeholderTextColor="#A0A0A0"
          />
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Provide details about the task..."
            placeholderTextColor="#A0A0A0"
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Priority Segmented Button */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Priority</Text>
          <View style={styles.segmentedRow}>
            {(["Low", "Medium", "High"] as const).map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.segmentBtn,
                  priority === p && styles.segmentBtnActive,
                  priority === p && p === "High" && styles.segmentBtnActiveHigh,
                ]}
                onPress={() => setPriority(p)}
              >
                <Text
                  style={[
                    styles.segmentText,
                    priority === p && styles.segmentTextActive,
                  ]}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Category Inputs */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.input}
            value={category}
            onChangeText={setCategory}
            placeholder="Category (e.g. Personal)"
            placeholderTextColor="#A0A0A0"
          />
          {/* Preset Buttons */}
          <View style={styles.presetRow}>
            {PRESET_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.presetTag, category === cat && styles.presetTagActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.presetTagText, category === cat && styles.presetTagTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Due Date String Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Due Date (YYYY-MM-DD HH:MM)</Text>
          <TextInput
            style={styles.input}
            value={dueDate}
            onChangeText={setDueDate}
            placeholder="e.g. 2026-08-07 17:00"
            placeholderTextColor="#A0A0A0"
          />
        </View>

        {/* Reminder Date String Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Reminder Time (YYYY-MM-DD HH:MM)</Text>
          <TextInput
            style={styles.input}
            value={reminder}
            onChangeText={setReminder}
            placeholder="e.g. 2026-08-07 16:00"
            placeholderTextColor="#A0A0A0"
          />
        </View>

        {/* Buttons Row */}
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[styles.btn, styles.cancelBtn]}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.saveBtn]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveBtnText}>{mode === "edit" ? "Save Changes" : "Create Task"}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#F7F6F3",
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    padding: 24,
    backgroundColor: "#F7F6F3",
    flexGrow: 1,
  },
  modalTitle: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 22,
    fontWeight: "bold",
    color: "#12181B",
    marginBottom: 20,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  titleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: "#12181B",
  },
  aiSuggestBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "rgba(61, 90, 128, 0.3)",
    backgroundColor: "rgba(61, 90, 128, 0.05)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  aiSuggestText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#3D5A80",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1DED6",
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#12181B",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  segmentedRow: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#E1DED6",
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  segmentBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRightWidth: 1,
    borderRightColor: "#E1DED6",
  },
  segmentBtnActive: {
    backgroundColor: "#3D5A80",
    borderColor: "#3D5A80",
  },
  segmentBtnActiveHigh: {
    backgroundColor: "#B65C3F",
    borderColor: "#B65C3F",
  },
  segmentText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666666",
  },
  segmentTextActive: {
    color: "#FFFFFF",
  },
  presetRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 2,
  },
  presetTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1DED6",
  },
  presetTagActive: {
    backgroundColor: "rgba(61, 90, 128, 0.1)",
    borderColor: "#3D5A80",
  },
  presetTagText: {
    fontSize: 11,
    color: "#666666",
    fontWeight: "500",
  },
  presetTagTextActive: {
    color: "#3D5A80",
    fontWeight: "600",
  },
  btnRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  btn: {
    flex: 1,
    borderRadius: 4,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: "#E1DED6",
    backgroundColor: "#FFFFFF",
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666666",
  },
  saveBtn: {
    backgroundColor: "#3D5A80",
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
