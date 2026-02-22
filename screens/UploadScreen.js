// screens/UploadScreen.js
import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, Image,
  StyleSheet, ScrollView, ActivityIndicator, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import Toast from "react-native-toast-message";

const CATEGORIES = ["Phone", "Desktop", "Laptop", "4K", "Abstract", "Nature", "Dark", "Minimal"];

export default function UploadScreen() {
  const [image, setImage] = useState(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Desktop");
  const [tags, setTags] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) setImage(result.assets[0]);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") return Alert.alert("Camera permission needed");
    const result = await ImagePicker.launchCameraAsync({ quality: 1 });
    if (!result.canceled) setImage(result.assets[0]);
  };

  const uploadWallpaper = async () => {
    if (!image) return Alert.alert("Please select an image first!");
    if (!title.trim()) return Alert.alert("Please enter a title!");

    try {
      setUploading(true);
      setProgress(10); // Start progress

      // Cloudinary Details
      const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/divsj84s4/image/upload";
      const UPLOAD_PRESET = "wallpaper_upload"; // Make sure this is "Unsigned" in Cloudinary settings

      // Prepare form data
      const formData = new FormData();
      formData.append("file", {
        uri: image.uri,
        type: "image/jpeg",
        name: `${Date.now()}.jpg`,
      });
      formData.append("upload_preset", UPLOAD_PRESET);
      formData.append("cloud_name", "divsj84s4");

      // 1. Upload to Cloudinary
      const response = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: formData,
        headers: {
          "Accept": "application/json",
          "Content-Type": "multipart/form-data",
        },
      });

      const fileData = await response.json();

      if (!fileData.secure_url) {
        throw new Error(fileData.error?.message || "Cloudinary Upload Failed");
      }

      setProgress(90); // Near completion

      // 2. Save metadata to Firestore (same as before)
      await addDoc(collection(db, "wallpapers"), {
        title: title.trim(),
        category,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        imageUrl: fileData.secure_url, // Using the Cloudinary URL
        downloads: 0,
        createdAt: serverTimestamp(),
      });

      Toast.show({ type: "success", text1: "🎉 Wallpaper Uploaded!", text2: `"${title}" is now live via Cloudinary` });

      // Reset form
      setImage(null);
      setTitle("");
      setTags("");
      setProgress(0);
      setUploading(false);
    } catch (err) {
      console.error("Upload Error:", err);
      Toast.show({ type: "error", text1: "Upload Failed", text2: err.message });
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Upload Wallpaper</Text>
        <Text style={styles.subheading}>Share your artwork with the world 🎨</Text>

        {/* Image Picker */}
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image.uri }} style={styles.previewImage} resizeMode="cover" />
          ) : (
            <View style={styles.placeholderContent}>
              <Ionicons name="image-outline" size={48} color="#444" />
              <Text style={styles.placeholderText}>Tap to choose image</Text>
              <Text style={styles.placeholderSub}>PNG, JPG — High resolution recommended</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Camera option */}
        <TouchableOpacity style={styles.cameraBtn} onPress={takePhoto}>
          <Ionicons name="camera-outline" size={18} color="#6C63FF" />
          <Text style={styles.cameraBtnText}>Take a Photo Instead</Text>
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Purple Abstract Galaxy"
          placeholderTextColor="#444"
          value={title}
          onChangeText={setTitle}
        />

        {/* Category */}
        <Text style={styles.label}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.catChip, category === cat && styles.catChipActive]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.catChipText, category === cat && styles.catChipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Tags */}
        <Text style={styles.label}>Tags (comma-separated)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. dark, space, purple, cool"
          placeholderTextColor="#444"
          value={tags}
          onChangeText={setTags}
        />

        {/* Upload progress */}
        {uploading && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
            <Text style={styles.progressText}>{progress}% uploading...</Text>
          </View>
        )}

        {/* Upload Button */}
        <TouchableOpacity
          style={[styles.uploadBtn, uploading && styles.uploadBtnDisabled]}
          onPress={uploadWallpaper}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={20} color="#FFF" />
              <Text style={styles.uploadBtnText}>Upload Wallpaper</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  scroll: { padding: 20, paddingBottom: 40 },
  heading: { color: "#FFF", fontSize: 26, fontWeight: "800", marginBottom: 4 },
  subheading: { color: "#666", fontSize: 14, marginBottom: 24 },
  imagePicker: {
    height: 220, borderRadius: 20, backgroundColor: "#141414",
    borderWidth: 2, borderColor: "#2A2A2A", borderStyle: "dashed",
    overflow: "hidden", justifyContent: "center", alignItems: "center",
  },
  previewImage: { width: "100%", height: "100%" },
  placeholderContent: { alignItems: "center", gap: 8 },
  placeholderText: { color: "#888", fontSize: 16, fontWeight: "600" },
  placeholderSub: { color: "#444", fontSize: 12 },
  cameraBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingVertical: 12, justifyContent: "center",
  },
  cameraBtnText: { color: "#6C63FF", fontSize: 14, fontWeight: "600" },
  label: { color: "#CCC", fontSize: 14, fontWeight: "600", marginBottom: 8, marginTop: 20 },
  input: {
    backgroundColor: "#141414", borderRadius: 14, padding: 16,
    color: "#FFF", fontSize: 15, borderWidth: 1, borderColor: "#2A2A2A",
  },
  catScroll: { marginBottom: 8 },
  catChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: "#1A1A1A", marginRight: 8, borderWidth: 1, borderColor: "#2A2A2A",
  },
  catChipActive: { backgroundColor: "#6C63FF", borderColor: "#6C63FF" },
  catChipText: { color: "#888", fontSize: 13, fontWeight: "600" },
  catChipTextActive: { color: "#FFF" },
  progressContainer: {
    marginTop: 16, backgroundColor: "#1A1A1A", borderRadius: 10,
    height: 8, overflow: "hidden",
  },
  progressBar: { height: "100%", backgroundColor: "#6C63FF", borderRadius: 10 },
  progressText: { color: "#888", fontSize: 12, marginTop: 6, textAlign: "center" },
  uploadBtn: {
    marginTop: 24, backgroundColor: "#6C63FF", borderRadius: 16,
    padding: 18, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10,
  },
  uploadBtnDisabled: { opacity: 0.6 },
  uploadBtnText: { color: "#FFF", fontSize: 16, fontWeight: "800" },
});
