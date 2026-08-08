import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import api from "../lib/api";

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email: email.trim() });
      setMessage("If that email exists, a reset link has been sent.");
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-center w-full max-w-sm self-center">
          {/* Header */}
          <Text style={styles.logo}>
            Flucy<Text style={styles.dot}>.</Text>
          </Text>
          <Text style={styles.title}>Reset password</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you a link to reset your password.
          </Text>

          {/* Success Message */}
          {message ? (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>{message}</Text>
            </View>
          ) : null}

          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Form */}
          {!message ? (
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor="#A0A0A0"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <TouchableOpacity
                style={styles.button}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Send Reset Link</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Back to Login */}
          <TouchableOpacity
            onPress={() => router.replace("/login")}
            style={styles.backToLoginButton}
          >
            <Text style={styles.backToLoginText}>Back to Log in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F6F3",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  logo: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#12181B",
  },
  dot: {
    color: "#3D5A80",
  },
  title: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 24,
    fontWeight: "600",
    color: "#12181B",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 20,
  },
  successContainer: {
    backgroundColor: "rgba(61, 90, 128, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(61, 90, 128, 0.3)",
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
  },
  successText: {
    color: "#3D5A80",
    fontSize: 13,
    textAlign: "center",
    fontWeight: "500",
  },
  errorContainer: {
    backgroundColor: "rgba(182, 92, 63, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(182, 92, 63, 0.3)",
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
  },
  errorText: {
    color: "#B65C3F",
    fontSize: 13,
    textAlign: "center",
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: "#12181B",
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
  button: {
    backgroundColor: "#3D5A80",
    borderRadius: 4,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  backToLoginButton: {
    marginTop: 20,
    alignSelf: "center",
    padding: 8,
  },
  backToLoginText: {
    color: "#3D5A80",
    fontSize: 13,
    fontWeight: "600",
  },
});
