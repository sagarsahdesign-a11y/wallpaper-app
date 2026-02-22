// screens/DetailScreen.js
import React, { useState } from "react";
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
  Dimensions, ScrollView, Alert, ActivityIndicator, Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { db } from "../firebase";
import { doc, deleteDoc } from "firebase/firestore";
import { auth } from "../firebase";
import Toast from "react-native-toast-message";

const { width, height } = Dimensions.get("window");

// Download size presets
const DOWNLOAD_OPTIONS = [
  { label: "📱 Phone", subtitle: "1080 × 1920", id: "phone" },
  { label: "💻 Laptop", subtitle: "1920 × 1080", id: "laptop" },
  { label: "🖥️ Desktop 4K", subtitle: "3840 × 2160", id: "4k" },
  { label: "📐 Original", subtitle: "Best quality", id: "original" },
];

export default function DetailScreen({ route, navigation }) {
  const { wallpaper } = route.params;
  const [downloading, setDownloading] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const isAdmin = auth.currentUser?.email === "mfl9815268699@gmail.com";

  const deleteWallpaper = async () => {
    Alert.alert(
      "Delete Wallpaper",
      "Are you sure you want to delete this wallpaper forever?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "wallpapers", wallpaper.id));
              Toast.show({ type: "success", text1: "Deleted", text2: "Wallpaper removed successfully" });
              navigation.goBack();
            } catch (err) {
              Toast.show({ type: "error", text1: "Error", text2: err.message });
            }
          }
        }
      ]
    );
  };

  const downloadWallpaper = async (option) => {
    try {
      // Request permission
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Please allow access to save wallpapers.");
        return;
      }

      setDownloading(true);
      Toast.show({ type: "info", text1: "Downloading...", text2: `Saving ${option.label} version` });

      // Download the image
      const fileUri = FileSystem.cacheDirectory + `wallpaper_${wallpaper.id}_${option.id}.jpg`;
      const { uri } = await FileSystem.downloadAsync(wallpaper.imageUrl, fileUri);

      // Save to media library
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync("Wallpapers", asset, false);

      Toast.show({
        type: "success",
        text1: "✅ Saved to Gallery!",
        text2: `${option.label} wallpaper downloaded`,
      });
    } catch (err) {
      Toast.show({ type: "error", text1: "Download failed", text2: err.message });
    } finally {
      setDownloading(false);
    }
  };

  const shareWallpaper = async () => {
    await Share.share({ message: `Check out this wallpaper! ${wallpaper.imageUrl}` });
  };

  return (
    <View style={styles.container}>
      {/* Full screen preview */}
      <Image source={{ uri: wallpaper.imageUrl }} style={styles.bgImage} blurRadius={3} />
      <View style={styles.overlay} />

      <SafeAreaView style={styles.safeArea}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.topActions}>
            <TouchableOpacity style={styles.actionBtn} onPress={shareWallpaper}>
              <Ionicons name="share-outline" size={22} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, isFav && styles.favActive]}
              onPress={() => setIsFav(!isFav)}
            >
              <Ionicons name={isFav ? "heart" : "heart-outline"} size={22} color={isFav ? "#FF4757" : "#FFF"} />
            </TouchableOpacity>
            {isAdmin && (
              <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={deleteWallpaper}>
                <Ionicons name="trash-outline" size={22} color="#FF4757" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Main preview */}
        <View style={styles.previewContainer}>
          <Image source={{ uri: wallpaper.imageUrl }} style={styles.previewImage} resizeMode="contain" />
        </View>

        {/* Bottom sheet */}
        <View style={styles.bottomSheet}>
          <Text style={styles.wallpaperTitle}>{wallpaper.title || "Wallpaper"}</Text>
          <View style={styles.tags}>
            <View style={styles.tag}>
              <Ionicons name="pricetag-outline" size={12} color="#6C63FF" />
              <Text style={styles.tagText}>{wallpaper.category}</Text>
            </View>
            {wallpaper.tags?.map((t) => (
              <View key={t} style={styles.tag}>
                <Text style={styles.tagText}>{t}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.downloadTitle}>⬇️ Download For</Text>

          <View style={styles.downloadGrid}>
            {DOWNLOAD_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                style={styles.downloadBtn}
                onPress={() => downloadWallpaper(opt)}
                disabled={downloading}
              >
                {downloading ? (
                  <ActivityIndicator size="small" color="#6C63FF" />
                ) : (
                  <>
                    <Text style={styles.downloadBtnLabel}>{opt.label}</Text>
                    <Text style={styles.downloadBtnSub}>{opt.subtitle}</Text>
                  </>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  bgImage: { ...StyleSheet.absoluteFillObject },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.6)" },
  safeArea: { flex: 1 },
  topBar: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingHorizontal: 16, paddingTop: 8,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)", justifyContent: "center", alignItems: "center",
  },
  topActions: { flexDirection: "row", gap: 10 },
  actionBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)", justifyContent: "center", alignItems: "center",
  },
  favActive: { backgroundColor: "rgba(255,71,87,0.3)" },
  deleteBtn: { backgroundColor: "rgba(255,71,87,0.15)" },
  previewContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 },
  previewImage: { width: width - 40, height: height * 0.45, borderRadius: 16 },
  bottomSheet: {
    backgroundColor: "#0F0F0F", borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 8,
  },
  wallpaperTitle: { color: "#FFF", fontSize: 20, fontWeight: "800", marginBottom: 10 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  tag: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#1A1A1A", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12,
  },
  tagText: { color: "#888", fontSize: 12 },
  downloadTitle: { color: "#FFF", fontSize: 16, fontWeight: "700", marginBottom: 12 },
  downloadGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  downloadBtn: {
    flex: 1, minWidth: "45%", backgroundColor: "#1A1A1A",
    borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#2A2A2A",
    alignItems: "center", justifyContent: "center", minHeight: 64,
  },
  downloadBtnLabel: { color: "#FFF", fontSize: 14, fontWeight: "700" },
  downloadBtnSub: { color: "#666", fontSize: 11, marginTop: 3 },
});
