// screens/LoginScreen.js
import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../firebase";
import Toast from "react-native-toast-message";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const currentUser = auth.currentUser;

  const handleLogin = async () => {
    if (!email || !password) return Toast.show({ type: "error", text1: "Fill in all fields" });
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Toast.show({ type: "success", text1: "Welcome back! 👋" });
      navigation.goBack();
    } catch (err) {
      Toast.show({ type: "error", text1: "Login failed", text2: "Wrong email or password" });
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    Toast.show({ type: "info", text1: "Logged out" });
    navigation.goBack();
  };

  if (currentUser) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.center}>
          <Ionicons name="person-circle" size={80} color="#6C63FF" />
          <Text style={styles.title}>Logged in as</Text>
          <Text style={styles.email}>{currentUser.email}</Text>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutBtnText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.kav}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.center}>
          <Ionicons name="lock-closed" size={48} color="#6C63FF" />
          <Text style={styles.title}>Admin Login</Text>
          <Text style={styles.subtitle}>Only the app owner can upload wallpapers</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#555"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={styles.passWrapper}>
            <TextInput
              style={styles.passInput}
              placeholder="Password"
              placeholderTextColor="#555"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)}>
              <Ionicons name={showPass ? "eye-off" : "eye"} size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginBtn, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginBtnText}>{loading ? "Logging in..." : "Login"}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  kav: { flex: 1 },
  backBtn: { margin: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: "#1A1A1A", justifyContent: "center", alignItems: "center" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32, gap: 12, marginTop: -60 },
  title: { color: "#FFF", fontSize: 26, fontWeight: "800" },
  subtitle: { color: "#666", fontSize: 14, textAlign: "center", marginBottom: 12 },
  email: { color: "#6C63FF", fontSize: 16, fontWeight: "600" },
  input: {
    width: "100%", backgroundColor: "#141414", borderRadius: 14, padding: 16,
    color: "#FFF", fontSize: 15, borderWidth: 1, borderColor: "#2A2A2A",
  },
  passWrapper: {
    width: "100%", flexDirection: "row", alignItems: "center",
    backgroundColor: "#141414", borderRadius: 14, paddingHorizontal: 16,
    borderWidth: 1, borderColor: "#2A2A2A",
  },
  passInput: { flex: 1, padding: 16, color: "#FFF", fontSize: 15 },
  loginBtn: {
    width: "100%", backgroundColor: "#6C63FF", borderRadius: 16,
    padding: 18, alignItems: "center", marginTop: 8,
  },
  loginBtnText: { color: "#FFF", fontSize: 16, fontWeight: "800" },
  logoutBtn: {
    marginTop: 20, borderWidth: 1, borderColor: "#FF4757", borderRadius: 16,
    paddingHorizontal: 32, paddingVertical: 14,
  },
  logoutBtnText: { color: "#FF4757", fontSize: 15, fontWeight: "700" },
});
