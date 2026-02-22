// screens/FavoritesScreen.js
import React, { useState } from "react";
import {
  View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

export default function FavoritesScreen({ navigation }) {
  // In a real app, favorites would be saved to AsyncStorage or Firebase
  // For now this is a placeholder — you can extend it!
  const [favorites] = useState([]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Favorites ❤️</Text>

      {favorites.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={72} color="#1E1E1E" />
          <Text style={styles.emptyTitle}>No favorites yet</Text>
          <Text style={styles.emptySub}>Tap the heart icon on any wallpaper to save it here</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[styles.card, index % 2 === 0 ? { marginRight: 8 } : { marginLeft: 8 }]}
              onPress={() => navigation.navigate("Detail", { wallpaper: item })}
            >
              <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.grid}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  heading: { color: "#FFF", fontSize: 26, fontWeight: "800", padding: 16 },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 40, gap: 12 },
  emptyTitle: { color: "#FFF", fontSize: 20, fontWeight: "700" },
  emptySub: { color: "#555", fontSize: 14, textAlign: "center", lineHeight: 20 },
  grid: { paddingHorizontal: 12 },
  card: { width: CARD_WIDTH, marginBottom: 12, borderRadius: 14, overflow: "hidden" },
  cardImage: { width: "100%", height: CARD_WIDTH * 1.5 },
});
