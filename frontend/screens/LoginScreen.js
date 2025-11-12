// screens/LoginScreen.js
import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import { theme } from "../theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NODE_BASE_URL } from "../config/api";

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);

  const handleLogin = async () => {
    if (loading) return;
    setLoading(true);
    setShowResend(false);

    try {
      const response = await fetch(`${NODE_BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        Toast.show({
          type: "error",
          text1: "Login Failed",
          text2: data.message || "Something went wrong.",
        });

        if (data.message && data.message.includes("User not found")) {
          setTimeout(() => {
            navigation.navigate("Register", { email, password });
          }, 1500);
          return;
        }

        if (data.message && data.message.includes("verify your email")) {
          setShowResend(true);
        }

        return;
      }

      Toast.show({
        type: "success",
        text1: "Welcome Back!",
        text2: data.message,
      });

      await AsyncStorage.setItem("user", JSON.stringify(data.user));

      setEmail("");
      setPassword("");

      setTimeout(() => navigation.navigate("Home"), 1000);
    } catch (error) {
      console.error("Error during login:", error);
      Toast.show({
        type: "error",
        text1: "Network Error",
        text2: "Please check your connection.",
      });
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    try {
      const res = await fetch(`${NODE_BASE_URL}/api/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      Toast.show({
        type: res.ok ? "success" : "error",
        text1: data.message,
      });
    } catch (err) {
      console.error(err);
      Toast.show({
        type: "error",
        text1: "Error sending email",
      });
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Toast.show({ type: "error", text1: "Enter your email first" });
      return;
    }
    try {
      const res = await fetch(`${NODE_BASE_URL}/api/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      Toast.show({
        type: res.ok ? "success" : "error",
        text1: data.message,
      });
    } catch (err) {
      console.error(err);
      Toast.show({ type: "error", text1: "Error sending reset email" });
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>🩺</Text>
          </View>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to access your allergy diagnosis</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor={theme.colors.textLight}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor={theme.colors.textLight}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.forgotLink}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity 
            style={[styles.loginButton, loading && styles.buttonDisabled]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.surface} />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Resend Verification */}
          {showResend && (
            <TouchableOpacity 
              style={styles.resendButton}
              onPress={resendVerification}
            >
              <Text style={styles.resendText}>📧 Resend Verification Email</Text>
            </TouchableOpacity>
          )}

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.registerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  
  // Header
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing['3xl'],
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  logo: {
    fontSize: 40,
  },
  title: {
    fontSize: theme.fonts['3xl'],
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fonts.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },

  // Form
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.fonts.sm,
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.base,
    fontSize: theme.fonts.base,
    color: theme.colors.text,
    ...theme.shadows.sm,
  },
  forgotLink: {
    color: theme.colors.primary,
    fontSize: theme.fonts.sm,
    fontWeight: theme.fonts.semibold,
    textAlign: 'right',
    marginBottom: theme.spacing.lg,
  },

  // Buttons
  loginButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.base,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  loginButtonText: {
    color: theme.colors.surface,
    fontSize: theme.fonts.lg,
    fontWeight: theme.fonts.semibold,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  resendButton: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.warning + '20',
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  resendText: {
    color: theme.colors.warning,
    fontSize: theme.fonts.sm,
    fontWeight: theme.fonts.semibold,
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    marginHorizontal: theme.spacing.base,
    color: theme.colors.textSecondary,
    fontSize: theme.fonts.sm,
  },

  // Register
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fonts.base,
  },
  registerLink: {
    color: theme.colors.primary,
    fontSize: theme.fonts.base,
    fontWeight: theme.fonts.semibold,
  },
});