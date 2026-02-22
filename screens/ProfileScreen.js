// screens/ProfileScreen.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import Toast from "react-native-toast-message";

export default function ProfileScreen({ navigation }) {
    const user = auth.currentUser;
    const isAdmin = user?.email === "mfl9815268699@gmail.com";

    const handleLogout = async () => {
        try {
            await signOut(auth);
            Toast.show({ type: "info", text1: "Signed out" });
            navigation.replace("Main"); // Refresh state
        } catch (err) {
            Toast.show({ type: "error", text1: "Error", text2: err.message });
        }
    };

    if (!user) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.center}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="person-outline" size={60} color="#6C63FF" />
                    </View>
                    <Text style={styles.title}>Join the Club</Text>
                    <Text style={styles.subtitle}>Log in to save favorites and manage your profile.</Text>
                    <TouchableOpacity
                        style={styles.loginBtn}
                        onPress={() => navigation.navigate("Login")}
                    >
                        <Text style={styles.loginBtnText}>Log In / Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Account</Text>
            </View>

            <View style={styles.profileSection}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{user.email[0].toUpperCase()}</Text>
                </View>
                <Text style={styles.userEmail}>{user.email}</Text>
                {isAdmin && (
                    <View style={styles.adminBadge}>
                        <Ionicons name="shield-checkmark" size={14} color="#FFF" />
                        <Text style={styles.adminBadgeText}>ADMIN</Text>
                    </View>
                )}
            </View>

            <View style={styles.menu}>
                <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Favorites")}>
                    <Ionicons name="heart-outline" size={24} color="#666" />
                    <Text style={styles.menuText}>My Favorites</Text>
                    <Ionicons name="chevron-forward" size={20} color="#333" />
                </TouchableOpacity>

                {isAdmin && (
                    <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Upload")}>
                        <Ionicons name="cloud-upload-outline" size={24} color="#6C63FF" />
                        <Text style={[styles.menuText, { color: "#6C63FF" }]}>Admin Dashboard</Text>
                        <Ionicons name="chevron-forward" size={20} color="#333" />
                    </TouchableOpacity>
                )}

                <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={24} color="#FF4757" />
                    <Text style={[styles.menuText, { color: "#FF4757" }]}>Logout</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0A0A0A" },
    center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 30 },
    iconCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: "#141414", justifyContent: "center", alignItems: "center", marginBottom: 20 },
    title: { color: "#FFF", fontSize: 28, fontWeight: "800", marginBottom: 10 },
    subtitle: { color: "#666", fontSize: 16, textAlign: "center", marginBottom: 30 },
    loginBtn: { backgroundColor: "#6C63FF", width: "100%", padding: 18, borderRadius: 16, alignItems: "center" },
    loginBtnText: { color: "#FFF", fontSize: 16, fontWeight: "800" },

    header: { padding: 20 },
    headerTitle: { color: "#FFF", fontSize: 32, fontWeight: "800" },
    profileSection: { alignItems: "center", marginBottom: 30, marginTop: 10 },
    avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: "#6C63FF", justifyContent: "center", alignItems: "center", marginBottom: 15 },
    avatarText: { color: "#FFF", fontSize: 40, fontWeight: "800" },
    userEmail: { color: "#FFF", fontSize: 18, fontWeight: "600" },
    adminBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "#6C63FF", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginTop: 8, gap: 4 },
    adminBadgeText: { color: "#FFF", fontSize: 10, fontWeight: "900" },

    menu: { paddingHorizontal: 20 },
    menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: "#1A1A1A" },
    menuText: { flex: 1, color: "#DDD", fontSize: 16, fontWeight: "600", marginLeft: 15 },
});
