// screens/DetailScreen.js - Premium Download Section
import React, { useState } from "react";
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
  Dimensions, ScrollView, Alert, ActivityIndicator, Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { doc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import Toast from "react-native-toast-message";

const { width, height } = Dimensions.get("window");
const ADMIN_EMAIL = "mfl9815268699@gmail.com";

const DOWNLOAD_OPTIONS = [
  {
    id: "phone",
    icon: "phone-portrait-outline",
    label: "Phone",
    subtitle: "1080 × 1920",
    desc: "Perfect for mobile",
    color: "#6C63FF",
  },
  {
    id: "laptop",
    icon: "laptop-outline",
    label: "Laptop",
    subtitle: "1920 × 1080",
    desc: "Full HD display",
    color: "#2ED573",
  },
  {
    id: "4k",
    icon: "desktop-outline",
    label: "Desktop 4K",
    subtitle: "3840 × 2160",
    desc: "Ultra HD quality",
    color: "#FFA502",
  },
  {
    id: "original",
    icon: "sparkles-outline",
    label: "Original",
    subtitle: "Max resolution",
    desc: "Best quality",
    color: "#FF4757",
  },
];

export default function DetailScreen({ route, navigation }) {
  const { wallpaper } = route.params;
  const [downloadingId, setDownloadingId] = useState(null);
  const [isFav, setIsFav] = useState(false);
  const isAdmin = auth.currentUser?.email === ADMIN_EMAIL;

  const downloadWallpaper = async (option) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Please allow access to save wallpapers.");
        return;
      }
      setDownloadingId(option.id);
      Toast.show({ type: "info", text1: `⬇️ Downloading ${option.label}...` });

      const fileUri = FileSystem.cacheDirectory + `wallpaper_${wallpaper.id}_${option.id}.jpg`;
      const { uri } = await FileSystem.downloadAsync(wallpaper.imageUrl, fileUri);
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync("WallApp", asset, false);

      Toast.show({ type: "success", text1: "✅ Saved to Gallery!", text2: `${option.label} wallpaper downloaded` });
    } catch (err) {
      Toast.show({ type: "error", text1: "Download failed", text2: err.message });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Wallpaper", `Delete "${wallpaper.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "wallpapers", wallpaper.id));
            Toast.show({ type: "success", text1: "Wallpaper deleted" });
            navigation.goBack();
          } catch (err) {
            Toast.show({ type: "error", text1: "Delete failed" });
          }
        },
      },
    ]);
  };

  const shareWallpaper = async () => {
    await Share.share({ message: `🎨 Check out this wallpaper on WallApp!\n${wallpaper.imageUrl}` });
  };

  return (
    <View style={styles.container}>
      {/* Blurred background */}
      <Image source={{ uri: wallpaper.imageUrl }} style={styles.bgImage} blurRadius={6} />
      <View style={styles.overlay} />

      <SafeAreaView style={styles.safeArea}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.topActions}>
            <TouchableOpacity style={styles.iconBtn} onPress={shareWallpaper}>
              <Ionicons name="share-outline" size={22} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconBtn, isFav && styles.favActive]}
              onPress={() => setIsFav(!isFav)}
            >
              <Ionicons name={isFav ? "heart" : "heart-outline"} size={22} color={isFav ? "#FF4757" : "#FFF"} />
            </TouchableOpacity>
            {isAdmin && (
              <TouchableOpacity style={[styles.iconBtn, styles.deleteBtn]} onPress={handleDelete}>
                <Ionicons name="trash-outline" size={22} color="#FF4757" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Wallpaper Preview */}
        <View style={styles.previewContainer}>
          <Image
            source={{ uri: wallpaper.imageUrl }}
            style={styles.previewImage}
            resizeMode="contain"
          />
        </View>

        {/* Bottom Sheet */}
        <View style={styles.bottomSheet}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Title & Tags */}
            <Text style={styles.wallpaperTitle}>{wallpaper.title || "Wallpaper"}</Text>
            <View style={styles.tags}>
              <View style={styles.tag}>
                <Ionicons name="pricetag-outline" size={11} color="#6C63FF" />
                <Text style={styles.tagText}>{wallpaper.category}</Text>
              </View>
              {wallpaper.tags?.map((t) => (
                <View key={t} style={styles.tag}>
                  <Text style={styles.tagText}>{t}</Text>
                </View>
              ))}
            </View>

            {/* ✅ NEW DOWNLOAD SECTION */}
            <Text style={styles.downloadHeading}>⬇️  Download For</Text>

            {/* Top row: Phone + Laptop */}
            <View style={styles.downloadRow}>
              {DOWNLOAD_OPTIONS.slice(0, 2).map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={styles.downloadCard}
                  onPress={() => downloadWallpaper(opt)}
                  disabled={!!downloadingId}
                  activeOpacity={0.8}
                >
                  {downloadingId === opt.id ? (
                    <ActivityIndicator size="small" color={opt.color} />
                  ) : (
                    <>
                      <View style={[styles.downloadIconCircle, { backgroundColor: opt.color + "22" }]}>
                        <Ionicons name={opt.icon} size={26} color={opt.color} />
                      </View>
                      <Text style={styles.downloadCardLabel}>{opt.label}</Text>
                      <Text style={styles.downloadCardRes}>{opt.subtitle}</Text>
                      <Text style={styles.downloadCardDesc}>{opt.desc}</Text>
                      <View style={[styles.downloadBadge, { backgroundColor: opt.color }]}>
                        <Ionicons name="arrow-down" size={12} color="#FFF" />
                        <Text style={styles.downloadBadgeText}>Save</Text>
                      </View>
                    </>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Bottom row: 4K + Original */}
            <View style={styles.downloadRow}>
              {DOWNLOAD_OPTIONS.slice(2, 4).map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={styles.downloadCard}
                  onPress={() => downloadWallpaper(opt)}
                  disabled={!!downloadingId}
                  activeOpacity={0.8}
                >
                  {downloadingId === opt.id ? (
                    <ActivityIndicator size="small" color={opt.color} />
                  ) : (
                    <>
                      <View style={[styles.downloadIconCircle, { backgroundColor: opt.color + "22" }]}>
                        <Ionicons name={opt.icon} size={26} color={opt.color} />
                      </View>
                      <Text style={styles.downloadCardLabel}>{opt.label}</Text>
                      <Text style={styles.downloadCardRes}>{opt.subtitle}</Text>
                      <Text style={styles.downloadCardDesc}>{opt.desc}</Text>
                      <View style={[styles.downloadBadge, { backgroundColor: opt.color }]}>
                        <Ionicons name="arrow-down" size={12} color="#FFF" />
                        <Text style={styles.downloadBadgeText}>Save</Text>
                      </View>
                    </>
                  )}
                </TouchableOpacity>
              ))}
            </View>

          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}

const CARD_W = (width - 52) / 2;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  bgImage: { ...StyleSheet.absoluteFillObject },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.58)" },
  safeArea: { flex: 1 },

  // Top bar
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 8 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.15)", justifyContent: "center", alignItems: "center" },
  favActive: { backgroundColor: "rgba(255,71,87,0.35)" },
  deleteBtn: { backgroundColor: "rgba(255,71,87,0.2)" },
  topActions: { flexDirection: "row", gap: 10 },

  // Preview
  previewContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 16 },
  previewImage: { width: width - 32, height: height * 0.38, borderRadius: 20 },

  // Bottom sheet
  bottomSheet: {
    backgroundColor: "#0D0D0D",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 12,
    maxHeight: height * 0.5,
  },

  wallpaperTitle: { color: "#FFF", fontSize: 20, fontWeight: "800", marginBottom: 10 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 18 },
  tag: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#1A1A1A", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: "#2A2A2A" },
  tagText: { color: "#888", fontSize: 12 },

  // ✅ New download section
  downloadHeading: { color: "#FFF", fontSize: 16, fontWeight: "800", marginBottom: 14 },
  downloadRow: { flexDirection: "row", gap: 12, marginBottom: 12 },

  downloadCard: {
    flex: 1,
    width: CARD_W,
    backgroundColor: "#141414",
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2A2A2A",
    gap: 6,
    minHeight: 150,
    justifyContent: "center",
  },
  downloadIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  downloadCardLabel: { color: "#FFF", fontSize: 15, fontWeight: "800" },
  downloadCardRes: { color: "#666", fontSize: 12, fontWeight: "600" },
  downloadCardDesc: { color: "#444", fontSize: 11 },
  downloadBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 4,
  },
  downloadBadgeText: { color: "#FFF", fontSize: 12, fontWeight: "700" },
});
