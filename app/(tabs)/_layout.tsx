import { supabase } from "@/config/supabase_config";
import { Ionicons } from "@expo/vector-icons";
import { router, Tabs } from "expo-router";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: "#00780aff",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#00780a41",
          elevation: 1,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          header: () => <CustomHeader />,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          header: () => <CustomHeader />,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}

/**
 * Exportado para poder reutilizar em outras telas
 * (ex.: eventos do animal).
 */
export function CustomHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      setMenuOpen(false);
      await supabase.auth.signOut();
      router.replace("/pages/login");
    } catch (error) {
      console.log("Erro ao sair:", error);
    }
  };

  const handleHome = () => {
    setMenuOpen(false);
    router.push("/(tabs)");
  };

  const handleConvidar = () => {
    setMenuOpen(false);
    router.push("/pages/veterinarios");
  };

  return (
    <View style={styles.headerContainer}>
      {/* === LOGO + TEXTO QUE LEVAM PARA HOME === */}
      <Pressable onPress={handleHome} style={styles.logoArea}>
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.appName}>Flo Bovino</Text>
      </Pressable>

      {/* === BOTÃO DO MENU === */}
      <Pressable
        onPress={() => setMenuOpen(!menuOpen)}
        style={styles.menuButton}
      >
        <Ionicons name="menu" size={24} color="#00780aff" />
      </Pressable>

      {/* === DROPDOWN === */}
      {menuOpen && (
        <View style={styles.dropdown}>
          <Pressable onPress={handleConvidar} style={styles.dropdownItem}>
            <Text style={styles.dropdownText}>Convidar Veterinário</Text>
          </Pressable>

          <Pressable onPress={handleLogout} style={styles.dropdownItem}>
            <Text style={styles.dropdownText}>Sair</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    height: 56,
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#00780a20",
  },

  logoArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  logo: {
    width: 28,
    height: 28,
  },

  appName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0a7d16",
  },

  menuButton: {
    padding: 8,
  },

  dropdown: {
    position: "absolute",
    top: 56,
    right: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },

  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },

  dropdownText: {
    color: "#00780aff",
    fontWeight: "600",
  },
});