import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import Toast from "react-native-toast-message";
import { theme } from "../theme";
import { useNavigation } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import { NODE_BASE_URL } from "../config/api";

export default function RegisterScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const prefillEmail = route.params?.email || "";
  const prefillPassword = route.params?.password || "";

  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState(prefillPassword);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await fetch(`${NODE_BASE_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        Toast.show({
          type: "error",
          text1: "Registration Failed",
          text2: data.message || "Something went wrong.",
        });

        if (
          data.message.includes("User already exists") || 
          data.message.includes("Email already registered")
        ) {
          setEmail("");
        }

        return;
      }

      Toast.show({
        type: "success",
        text1: "Success!",
        text2: data.message,
      });

      setTimeout(() => navigation.navigate("Login"), 100);

    } catch (error) {
      console.error("Error during registration:", error);
      Toast.show({
        type: "error",
        text1: "Network Error",
        text2: "Please check your connection.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={registerStyles.container}
    >
      <ScrollView contentContainerStyle={registerStyles.scrollContent}>
        {/* Header */}
        <View style={registerStyles.header}>
          <View style={registerStyles.logoContainer}>
            <Text style={registerStyles.logo}>🩺</Text>
          </View>
          <Text style={registerStyles.title}>Create Account</Text>
          <Text style={registerStyles.subtitle}>Join us to start your health journey</Text>
        </View>

        {/* Form */}
        <View style={registerStyles.form}>
          <View style={registerStyles.row}>
            <View style={[registerStyles.inputContainer, { flex: 1, marginRight: theme.spacing.sm }]}>
              <Text style={registerStyles.label}>First Name</Text>
              <TextInput
                style={registerStyles.input}
                placeholder="John"
                placeholderTextColor={theme.colors.textLight}
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>

            <View style={[registerStyles.inputContainer, { flex: 1, marginLeft: theme.spacing.sm }]}>
              <Text style={registerStyles.label}>Last Name</Text>
              <TextInput
                style={registerStyles.input}
                placeholder="Doe"
                placeholderTextColor={theme.colors.textLight}
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
          </View>

          <View style={registerStyles.inputContainer}>
            <Text style={registerStyles.label}>Email Address</Text>
            <TextInput
              style={registerStyles.input}
              placeholder="john.doe@example.com"
              placeholderTextColor={theme.colors.textLight}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={registerStyles.inputContainer}>
            <Text style={registerStyles.label}>Password</Text>
            <TextInput
              style={registerStyles.input}
              placeholder="Create a strong password"
              placeholderTextColor={theme.colors.textLight}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Register Button */}
          <TouchableOpacity 
            style={[registerStyles.registerButton, loading && registerStyles.buttonDisabled]} 
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.surface} />
            ) : (
              <Text style={registerStyles.registerButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={registerStyles.loginContainer}>
            <Text style={registerStyles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={registerStyles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const registerStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xl,
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
    backgroundColor: theme.colors.secondary + '20',
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
  row: {
    flexDirection: 'row',
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

  // Buttons
  registerButton: {
    backgroundColor: theme.colors.secondary,
    padding: theme.spacing.base,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    marginTop: theme.spacing.md,
    ...theme.shadows.md,
  },
  registerButtonText: {
    color: theme.colors.surface,
    fontSize: theme.fonts.lg,
    fontWeight: theme.fonts.semibold,
  },
  buttonDisabled: {
    opacity: 0.6,
  },

  // Login Link
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  loginText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fonts.base,
  },
  loginLink: {
    color: theme.colors.secondary,
    fontSize: theme.fonts.base,
    fontWeight: theme.fonts.semibold,
  },
});