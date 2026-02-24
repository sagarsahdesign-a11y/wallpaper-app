// screens/HomeScreen.js - Fixed category pills
import React, { useState, useEffect } from "react";
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, Dimensions, ScrollView, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;
const CATEGORIES = ["All", "Phone", "Desktop", "Laptop", "4K", "Abstract", "Nature", "Dark", "Minimal"];

export default function HomeScreen({ navigation }) {
  const [wallpapers, setWallpapers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "wallpapers"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setWallpapers(data);
      setFiltered(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const filterByCategory = (cat) => {
    setActiveCategory(cat);
    setFiltered(cat === "All" ? wallpapers : wallpapers.filter((w) => w.category === cat));
  };

  const renderWallpaper = ({ item, index }) => (
    <TouchableOpacity
      style={[styles.card, index % 2 === 0 ? styles.cardLeft : styles.cardRight]}
      onPress={() => navigation.navigate("Detail", { wallpaper: item })}
      activeOpacity={0.85}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.cardImage} resizeMode="cover" />
      <View style={styles.cardOverlay}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{item.category}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Wallpapers 🎨</Text>
          <Text style={styles.headerSub}>{filtered.length} wallpapers available</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("Profile")} style={styles.avatarBtn}>
          <Ionicons name="person-circle-outline" size={34} color="#6C63FF" />
        </TouchableOpacity>
      </View>

      {/* ✅ FIXED: Category pills — horizontal scroll, compact height */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catContainer}
        style={styles.catScroll}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.catPill, activeCategory === cat && styles.catPillActive]}
            onPress={() => filterByCategory(cat)}
          >
            <Text style={[styles.catText, activeCategory === cat && styles.catTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Wallpaper Grid */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={styles.loadingText}>Loading wallpapers...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="images-outline" size={64} color="#222" />
          <Text style={styles.emptyTitle}>No wallpapers yet</Text>
          <Text style={styles.emptySub}>Upload some from the Admin tab!</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderWallpaper}
          keyExtractor={(item) => item.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.grid}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  headerTitle: { color: "#FFF", fontSize: 24, fontWeight: "800" },
  headerSub: { color: "#666", fontSize: 13, marginTop: 2 },
  avatarBtn: { padding: 4 },

  // ✅ Fixed category pills — small and compact
  catScroll: { maxHeight: 44, marginBottom: 12 },
  catContainer: { paddingHorizontal: 16, gap: 8, alignItems: "center" },
  catPill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#2A2A2A",
    height: 34,
    justifyContent: "center",
  },
  catPillActive: { backgroundColor: "#6C63FF", borderColor: "#6C63FF" },
  catText: { color: "#888", fontSize: 13, fontWeight: "600" },
  catTextActive: { color: "#FFF" },

  grid: { paddingHorizontal: 12, paddingBottom: 20 },
  card: { width: CARD_WIDTH, borderRadius: 16, overflow: "hidden", marginBottom: 12, backgroundColor: "#1A1A1A" },
  cardLeft: { marginLeft: 4, marginRight: 8 },
  cardRight: { marginLeft: 8, marginRight: 4 },
  cardImage: { width: "100%", height: CARD_WIDTH * 1.6 },
  cardOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 10 },
  categoryBadge: { alignSelf: "flex-start", backgroundColor: "rgba(108,99,255,0.9)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  categoryBadgeText: { color: "#FFF", fontSize: 11, fontWeight: "700" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 10 },
  loadingText: { color: "#555", fontSize: 14 },
  emptyTitle: { color: "#FFF", fontSize: 20, fontWeight: "700", marginTop: 8 },
  emptySub: { color: "#555", fontSize: 14 },
});
