// App.js - Auth-First Flow (like Facebook/Instagram)
import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import Toast from "react-native-toast-message";

import HomeScreen from "./screens/HomeScreen";
import FavoritesScreen from "./screens/FavoritesScreen";
import DetailScreen from "./screens/DetailScreen";
import UploadScreen from "./screens/UploadScreen";
import SearchScreen from "./screens/SearchScreen";
import ProfileScreen from "./screens/ProfileScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const ADMIN_EMAIL = "mfl9815268699@gmail.com";

// ── Bottom Tabs (only shown when logged in) ──
function MainTabs({ isAdmin }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0D0D0D",
          borderTopColor: "#1A1A1A",
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 6,
          height: 62,
        },
        tabBarActiveTintColor: "#6C63FF",
        tabBarInactiveTintColor: "#444",
        tabBarLabelStyle: { fontSize: 10, fontWeight: "700", marginTop: -2 },
        tabBarIcon: ({ focused, color }) => {
          const icons = {
            Home: focused ? "home" : "home-outline",
            Search: focused ? "search" : "search-outline",
            Favorites: focused ? "heart" : "heart-outline",
            Admin: focused ? "cloud-upload" : "cloud-upload-outline",
            Profile: focused ? "person" : "person-outline",
          };
          return <Ionicons name={icons[route.name]} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      {isAdmin && (
        <Tab.Screen
          name="Admin"
          component={UploadScreen}
          options={{ tabBarBadge: "🔒", tabBarBadgeStyle: { fontSize: 8, minWidth: 16, height: 16 } }}
        />
      )}
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  // Loading splash
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <Ionicons name="images" size={56} color="#6C63FF" />
        <ActivityIndicator size="large" color="#6C63FF" style={{ marginTop: 20 }} />
      </View>
    );
  }

  // ✅ NOT LOGGED IN → Show Login/Signup first (like Facebook)
  if (!user) {
    return (
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Auth" component={ProfileScreen} />
        </Stack.Navigator>
        <Toast />
      </NavigationContainer>
    );
  }

  // ✅ LOGGED IN → Show main app with tabs
  const isAdmin = user.email === ADMIN_EMAIL;

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main">
          {() => <MainTabs isAdmin={isAdmin} />}
        </Stack.Screen>
        <Stack.Screen name="Detail" component={DetailScreen} options={{ presentation: "modal" }} />
      </Stack.Navigator>
      <Toast />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    justifyContent: "center",
    alignItems: "center",
  },
});
