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
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

export default function SignupScreen() {
  const { signup } = useAuth();
  const router = useRouter();

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [step, setStep] = useState(1); // 1: details, 2: OTP verification
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  // Step 1: Send OTP
  const handleRequestOTP = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await api.post("/auth/send-otp", { email: email.trim() });
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send verification code.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and Register
  const handleVerifyAndSignup = async () => {
    if (!otp.trim()) {
      setError("Please enter the verification code.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await signup(name.trim(), email.trim(), password, otp.trim());
    } catch (err: any) {
      setError(err.response?.data?.message || "Verification failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setError("");
    setOtpLoading(true);
    try {
      await api.post("/auth/send-otp", { email: email.trim() });
      Alert.alert("Sent", "A new verification code has been sent to your email.");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to resend code.");
    } finally {
      setOtpLoading(false);
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
          <Text style={styles.title}>
            {step === 1 ? "Create account" : "Verify your email"}
          </Text>
          <Text style={styles.subtitle}>
            {step === 1
              ? "Start keeping a proper ledger of your tasks."
              : `Enter the code we sent to ${email}`}
          </Text>

          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {step === 1 ? (
            /* Step 1 Form: Details */
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="John Doe"
                  placeholderTextColor="#A0A0A0"
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>

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

              <TouchableOpacity
                style={styles.button}
                onPress={handleRequestOTP}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Get Verification Code</Text>
                )}
              </TouchableOpacity>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push("/login")}>
                  <Text style={styles.linkText}>Log in</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* Step 2 Form: OTP Verification */
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>6-Digit Code</Text>
                <TextInput
                  style={[styles.input, styles.otpInput]}
                  value={otp}
                  onChangeText={setOtp}
                  placeholder="123456"
                  placeholderTextColor="#A0A0A0"
                  keyboardType="number-pad"
                  maxLength={6}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <TouchableOpacity
                style={styles.button}
                onPress={handleVerifyAndSignup}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Verify & Sign Up</Text>
                )}
              </TouchableOpacity>

              <View style={styles.otpActions}>
                <TouchableOpacity
                  onPress={handleResendOTP}
                  disabled={otpLoading}
                  style={styles.otpLink}
                >
                  {otpLoading ? (
                    <ActivityIndicator size="small" color="#3D5A80" />
                  ) : (
                    <Text style={styles.otpLinkText}>Resend code</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setError("");
                    setStep(1);
                  }}
                  style={styles.otpLink}
                >
                  <Text style={styles.otpLinkTextBack}>Edit details</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
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
  otpInput: {
    textAlign: "center",
    fontSize: 22,
    letterSpacing: 8,
    fontWeight: "bold",
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
    color: "#3D5A80",
    fontSize: 13,
    fontWeight: "600",
  },
  otpActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 4,
  },
  otpLink: {
    paddingVertical: 6,
  },
  otpLinkText: {
    color: "#3D5A80",
    fontSize: 13,
    fontWeight: "600",
  },
  otpLinkTextBack: {
    color: "#666666",
    fontSize: 13,
    fontWeight: "500",
  },
});
