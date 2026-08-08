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
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Check your details.");
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
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Log in to see what's on your plate.</Text>

          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Form */}
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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#A0A0A0"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#666666"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              onPress={() => router.push("/forgot-password")}
              style={styles.forgotContainer}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Log in</Text>
              )}
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/signup")}>
                <Text style={styles.linkText}>Sign up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F6F3", // warm paper color
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
    color: "#B65C3F", // warn color
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
    borderColor: "#E1DED6", // line color
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#12181B",
  },
  passwordWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeButton: {
    position: "absolute",
    right: 0,
    height: "100%",
    paddingHorizontal: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  forgotContainer: {
    alignSelf: "flex-end",
    marginTop: -4,
    marginBottom: 8,
  },
  forgotText: {
    color: "#3D5A80", // accent color
    fontSize: 13,
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#3D5A80", // accent color
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
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  footerText: {
    color: "#666666",
    fontSize: 13,
  },
  linkText: {
    color: "#3D5A80", // accent color
    fontSize: 13,
    fontWeight: "600",
  },
});
