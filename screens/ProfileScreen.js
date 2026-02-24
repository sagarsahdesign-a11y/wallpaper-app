// screens/ProfileScreen.js - Full market-ready profile + auth
import React, { useState } from "react";
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ScrollView, Alert, KeyboardAvoidingView, Platform, Modal, Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
} from "firebase/auth";
import { auth } from "../firebase";
import Toast from "react-native-toast-message";

const PRIVACY_POLICY = `Privacy Policy for WallApp

Last updated: February 2026

1. INFORMATION WE COLLECT
We collect your email address when you create an account. We do not collect any other personal information.

2. HOW WE USE YOUR INFORMATION
Your email is used only for account authentication. We never sell or share your data with third parties.

3. WALLPAPER DOWNLOADS
Downloaded wallpapers are saved to your device's gallery. We do not track what you download.

4. FIREBASE & CLOUDINARY
We use Firebase for authentication and database, and Cloudinary for image storage. Both are secure, industry-standard services.

5. ACCOUNT DELETION
You can delete your account at any time by contacting us. All your data will be permanently removed.

6. CHILDREN'S PRIVACY
WallApp is not intended for children under 13 years of age.

7. CHANGES TO THIS POLICY
We may update this policy. We will notify you of any changes by posting the new policy in the app.

8. CONTACT US
For questions about this privacy policy, contact us at: support@wallapp.com`;

export default function ProfileScreen() {
    const [mode, setMode] = useState("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [privacyVisible, setPrivacyVisible] = useState(false);
    const currentUser = auth.currentUser;

    const handleLogin = async () => {
        if (!email.trim() || !password) return Toast.show({ type: "error", text1: "Fill in all fields" });
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email.trim(), password);
            Toast.show({ type: "success", text1: "Welcome back! 👋" });
            setEmail(""); setPassword("");
        } catch {
            Toast.show({ type: "error", text1: "Login failed", text2: "Wrong email or password" });
        }
        setLoading(false);
    };

    const handleSignup = async () => {
        if (!email.trim() || !password || !confirmPassword)
            return Toast.show({ type: "error", text1: "Fill in all fields" });
        if (password !== confirmPassword)
            return Toast.show({ type: "error", text1: "Passwords don't match" });
        if (password.length < 6)
            return Toast.show({ type: "error", text1: "Password must be 6+ characters" });
        setLoading(true);
        try {
            await createUserWithEmailAndPassword(auth, email.trim(), password);
            Toast.show({ type: "success", text1: "Account created! 🎉", text2: "Welcome to WallApp!" });
            setEmail(""); setPassword(""); setConfirmPassword("");
        } catch (err) {
            const msg = err.code === "auth/email-already-in-use" ? "Email already in use" : "Signup failed";
            Toast.show({ type: "error", text1: msg });
        }
        setLoading(false);
    };

    const handleLogout = () => {
        Alert.alert("Sign Out", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            { text: "Sign Out", style: "destructive", onPress: async () => { await signOut(auth); } },
        ]);
    };

    // ── PRIVACY POLICY MODAL ──
    const PrivacyModal = () => (
        <Modal visible={privacyVisible} animationType="slide" presentationStyle="pageSheet">
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Privacy Policy</Text>
                    <TouchableOpacity onPress={() => setPrivacyVisible(false)} style={styles.modalClose}>
                        <Ionicons name="close" size={22} color="#FFF" />
                    </TouchableOpacity>
                </View>
                <ScrollView contentContainerStyle={styles.modalContent}>
                    <Text style={styles.privacyText}>{PRIVACY_POLICY}</Text>
                </ScrollView>
            </View>
        </Modal>
    );

    // ── LOGGED IN STATE ──
    if (currentUser) {
        return (
            <SafeAreaView style={styles.container}>
                <PrivacyModal />
                <ScrollView contentContainerStyle={styles.scroll}>
                    {/* Avatar */}
                    <View style={styles.avatarSection}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarLetter}>{currentUser.email.charAt(0).toUpperCase()}</Text>
                        </View>
                        <Text style={styles.userName}>{currentUser.email.split("@")[0]}</Text>
                        <Text style={styles.userEmail}>{currentUser.email}</Text>
                    </View>

                    {/* Stats */}
                    <View style={styles.statsRow}>
                        {[
                            { icon: "heart", color: "#FF4757", num: "0", label: "Favorites" },
                            { icon: "cloud-download", color: "#6C63FF", num: "0", label: "Downloads" },
                            { icon: "star", color: "#FFD700", num: "Free", label: "Plan" },
                        ].map((s) => (
                            <View key={s.label} style={styles.statCard}>
                                <Ionicons name={s.icon} size={20} color={s.color} />
                                <Text style={styles.statNum}>{s.num}</Text>
                                <Text style={styles.statLabel}>{s.label}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Menu */}
                    <View style={styles.menuCard}>
                        {[
                            { icon: "heart-outline", label: "My Favorites", color: "#FF4757" },
                            { icon: "download-outline", label: "Download History", color: "#6C63FF" },
                            { icon: "notifications-outline", label: "Notifications", color: "#FFA502" },
                            {
                                icon: "share-social-outline", label: "Share WallApp", color: "#2ED573",
                                onPress: () => Alert.alert("Share", "Tell your friends about WallApp! 🎨")
                            },
                            {
                                icon: "shield-checkmark-outline", label: "Privacy Policy", color: "#2ED573",
                                onPress: () => setPrivacyVisible(true)
                            },
                            {
                                icon: "mail-outline", label: "Contact Support", color: "#1E90FF",
                                onPress: () => Linking.openURL("mailto:support@wallapp.com")
                            },
                            { icon: "information-circle-outline", label: "About WallApp v1.0", color: "#888" },
                        ].map((item) => (
                            <TouchableOpacity
                                key={item.label}
                                style={styles.menuItem}
                                onPress={item.onPress || undefined}
                            >
                                <View style={[styles.menuIcon, { backgroundColor: item.color + "22" }]}>
                                    <Ionicons name={item.icon} size={18} color={item.color} />
                                </View>
                                <Text style={styles.menuLabel}>{item.label}</Text>
                                <Ionicons name="chevron-forward" size={14} color="#333" />
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Sign Out */}
                    <TouchableOpacity style={styles.signOutBtn} onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={18} color="#FF4757" />
                        <Text style={styles.signOutText}>Sign Out</Text>
                    </TouchableOpacity>

                    <Text style={styles.version}>WallApp v1.0.0 · Made with ❤️</Text>
                </ScrollView>
            </SafeAreaView>
        );
    }

    // ── NOT LOGGED IN STATE ──
    return (
        <SafeAreaView style={styles.container}>
            <PrivacyModal />
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.authScroll} keyboardShouldPersistTaps="handled">

                    {/* Hero */}
                    <View style={styles.hero}>
                        <View style={styles.heroIcon}>
                            <Ionicons name="images" size={44} color="#6C63FF" />
                        </View>
                        <Text style={styles.heroTitle}>WallApp 🎨</Text>
                        <Text style={styles.heroSub}>Beautiful wallpapers for every screen</Text>
                    </View>

                    {/* Toggle tabs */}
                    <View style={styles.toggle}>
                        <TouchableOpacity
                            style={[styles.toggleTab, mode === "login" && styles.toggleTabActive]}
                            onPress={() => { setMode("login"); setEmail(""); setPassword(""); setConfirmPassword(""); }}
                        >
                            <Text style={[styles.toggleTabText, mode === "login" && styles.toggleTabTextActive]}>Login</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.toggleTab, mode === "signup" && styles.toggleTabActive]}
                            onPress={() => { setMode("signup"); setEmail(""); setPassword(""); setConfirmPassword(""); }}
                        >
                            <Text style={[styles.toggleTabText, mode === "signup" && styles.toggleTabTextActive]}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        {mode === "signup" && (
                            <Text style={styles.formTitle}>Create your free account</Text>
                        )}

                        <View style={styles.inputWrapper}>
                            <Ionicons name="mail-outline" size={18} color="#555" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Email address"
                                placeholderTextColor="#555"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputWrapper}>
                            <Ionicons name="lock-closed-outline" size={18} color="#555" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor="#555"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPass}
                            />
                            <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                                <Ionicons name={showPass ? "eye-off" : "eye"} size={18} color="#555" />
                            </TouchableOpacity>
                        </View>

                        {mode === "signup" && (
                            <View style={styles.inputWrapper}>
                                <Ionicons name="lock-closed-outline" size={18} color="#555" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Confirm password"
                                    placeholderTextColor="#555"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showPass}
                                />
                            </View>
                        )}

                        <TouchableOpacity
                            style={[styles.submitBtn, loading && { opacity: 0.7 }]}
                            onPress={mode === "login" ? handleLogin : handleSignup}
                            disabled={loading}
                        >
                            <Text style={styles.submitBtnText}>
                                {loading ? "Please wait..." : mode === "login" ? "Login" : "Create Account"}
                            </Text>
                        </TouchableOpacity>

                        <Text style={styles.switchText}>
                            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                            <Text
                                style={styles.switchLink}
                                onPress={() => { setMode(mode === "login" ? "signup" : "login"); setEmail(""); setPassword(""); setConfirmPassword(""); }}
                            >
                                {mode === "login" ? "Sign Up Free" : "Login"}
                            </Text>
                        </Text>
                    </View>

                    {/* Benefits */}
                    <View style={styles.benefits}>
                        {["❤️  Save your favorite wallpapers", "⬇️  Download in HD, 4K & more", "🔔  Get notified of new uploads", "🆓  Always free to use"].map((b) => (
                            <View key={b} style={styles.benefitRow}>
                                <Text style={styles.benefitText}>{b}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Privacy note */}
                    <Text style={styles.privacyNote}>
                        By continuing, you agree to our{" "}
                        <Text style={styles.privacyLink} onPress={() => setPrivacyVisible(true)}>
                            Privacy Policy
                        </Text>
                    </Text>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0A0A0A" },

    // Logged in
    scroll: { padding: 20, paddingBottom: 40 },
    avatarSection: { alignItems: "center", paddingVertical: 24 },
    avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#6C63FF", justifyContent: "center", alignItems: "center", marginBottom: 12 },
    avatarLetter: { color: "#FFF", fontSize: 30, fontWeight: "800" },
    userName: { color: "#FFF", fontSize: 20, fontWeight: "800", marginBottom: 4 },
    userEmail: { color: "#555", fontSize: 13 },
    statsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
    statCard: { flex: 1, backgroundColor: "#141414", borderRadius: 14, padding: 14, alignItems: "center", gap: 4, borderWidth: 1, borderColor: "#2A2A2A" },
    statNum: { color: "#FFF", fontSize: 16, fontWeight: "800" },
    statLabel: { color: "#555", fontSize: 11 },
    menuCard: { backgroundColor: "#141414", borderRadius: 18, overflow: "hidden", borderWidth: 1, borderColor: "#1E1E1E", marginBottom: 16 },
    menuItem: { flexDirection: "row", alignItems: "center", padding: 14, borderBottomWidth: 1, borderBottomColor: "#1A1A1A", gap: 12 },
    menuIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: "center", alignItems: "center" },
    menuLabel: { flex: 1, color: "#DDD", fontSize: 14, fontWeight: "500" },
    signOutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#1A0808", borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "#FF475722", marginBottom: 12 },
    signOutText: { color: "#FF4757", fontSize: 15, fontWeight: "700" },
    version: { color: "#333", fontSize: 12, textAlign: "center", marginTop: 8 },

    // Auth
    authScroll: { padding: 24, paddingBottom: 40 },
    hero: { alignItems: "center", paddingVertical: 20 },
    heroIcon: { width: 80, height: 80, borderRadius: 24, backgroundColor: "#141420", justifyContent: "center", alignItems: "center", marginBottom: 14, borderWidth: 1, borderColor: "#6C63FF33" },
    heroTitle: { color: "#FFF", fontSize: 28, fontWeight: "800", marginBottom: 6 },
    heroSub: { color: "#555", fontSize: 14, textAlign: "center" },
    toggle: { flexDirection: "row", backgroundColor: "#141414", borderRadius: 14, padding: 4, marginBottom: 24, borderWidth: 1, borderColor: "#1E1E1E" },
    toggleTab: { flex: 1, paddingVertical: 11, borderRadius: 10, alignItems: "center" },
    toggleTabActive: { backgroundColor: "#6C63FF" },
    toggleTabText: { color: "#555", fontWeight: "700", fontSize: 15 },
    toggleTabTextActive: { color: "#FFF" },
    form: { gap: 12, marginBottom: 24 },
    formTitle: { color: "#AAA", fontSize: 14, textAlign: "center", marginBottom: 4 },
    inputWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: "#141414", borderRadius: 14, borderWidth: 1, borderColor: "#2A2A2A" },
    inputIcon: { paddingLeft: 14 },
    input: { flex: 1, padding: 15, color: "#FFF", fontSize: 15 },
    eyeBtn: { padding: 14 },
    submitBtn: { backgroundColor: "#6C63FF", borderRadius: 14, padding: 17, alignItems: "center", marginTop: 4, shadowColor: "#6C63FF", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 6 },
    submitBtnText: { color: "#FFF", fontSize: 16, fontWeight: "800" },
    switchText: { color: "#555", textAlign: "center", fontSize: 13 },
    switchLink: { color: "#6C63FF", fontWeight: "700" },
    benefits: { backgroundColor: "#0F0F0F", borderRadius: 16, padding: 16, gap: 10, borderWidth: 1, borderColor: "#1E1E1E", marginBottom: 16 },
    benefitRow: { flexDirection: "row", alignItems: "center" },
    benefitText: { color: "#666", fontSize: 13 },
    privacyNote: { color: "#444", fontSize: 12, textAlign: "center" },
    privacyLink: { color: "#6C63FF", fontWeight: "600" },

    // Modal
    modalContainer: { flex: 1, backgroundColor: "#0A0A0A" },
    modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottomWidth: 1, borderBottomColor: "#1A1A1A" },
    modalTitle: { color: "#FFF", fontSize: 18, fontWeight: "800" },
    modalClose: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#1A1A1A", justifyContent: "center", alignItems: "center" },
    modalContent: { padding: 20 },
    privacyText: { color: "#AAA", fontSize: 14, lineHeight: 24 },
});
