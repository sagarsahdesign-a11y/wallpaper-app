// screens/SearchScreen.js
import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, FlatList, Image,
  TouchableOpacity, StyleSheet, Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState("");
  const [allWallpapers, setAllWallpapers] = useState([]);
  const [results, setResults] = useState([]);

  useEffect(() => {
    // Fetch all wallpapers once for search
    getDocs(collection(db, "wallpapers")).then((snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setAllWallpapers(data);
    });
  }, []);

  const handleSearch = (text) => {
    setQuery(text);
    if (!text.trim()) {
      setResults([]);
      return;
    }
    const q = text.toLowerCase();
    const filtered = allWallpapers.filter(
      (w) =>
        w.title?.toLowerCase().includes(q) ||
        w.category?.toLowerCase().includes(q) ||
        w.tags?.some((t) => t.toLowerCase().includes(q))
    );
    setResults(filtered);
  };

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      style={[styles.card, index % 2 === 0 ? { marginRight: 8 } : { marginLeft: 8 }]}
      onPress={() => navigation.navigate("Detail", { wallpaper: item })}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.cardImage} resizeMode="cover" />
      <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Search</Text>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, category, tag..."
          placeholderTextColor="#555"
          value={query}
          onChangeText={handleSearch}
          autoFocus
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch("")}>
            <Ionicons name="close-circle" size={18} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {results.length > 0 ? (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
        />
      ) : query.length > 0 ? (
        <View style={styles.empty}>
          <Ionicons name="search-outline" size={48} color="#333" />
          <Text style={styles.emptyText}>No results for "{query}"</Text>
        </View>
      ) : (
        <View style={styles.empty}>
          <Ionicons name="sparkles-outline" size={48} color="#333" />
          <Text style={styles.emptyText}>Search by title, category or tags</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  heading: { color: "#FFF", fontSize: 26, fontWeight: "800", paddingHorizontal: 16, paddingTop: 8, marginBottom: 16 },
  searchBar: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#141414", borderRadius: 16, marginHorizontal: 16,
    paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: "#2A2A2A",
    marginBottom: 16,
  },
  searchInput: { flex: 1, color: "#FFF", fontSize: 15 },
  grid: { paddingHorizontal: 12 },
  card: { width: CARD_WIDTH, marginBottom: 12, borderRadius: 14, overflow: "hidden", backgroundColor: "#1A1A1A" },
  cardImage: { width: "100%", height: CARD_WIDTH * 1.5 },
  cardTitle: { color: "#CCC", fontSize: 12, padding: 8, fontWeight: "600" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", gap: 10 },
  emptyText: { color: "#555", fontSize: 15 },
});
