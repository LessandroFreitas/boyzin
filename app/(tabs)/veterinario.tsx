import { useRouter } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

export default function Veterinario() {
  const router = useRouter();
    return (    
<View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
  <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 20, color: "#00780a" }}>
    Bem-vindo, Veterinário! 
    </Text>
<Pressable
  onPress={() => router.push("/veterinario/animais")}
  style={{
    backgroundColor: "#00780a",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  }}
>
  <Text style={{ color: "#fff", fontSize: 18, textAlign: "center" }}>
    Ver Animais
  </Text>
</Pressable>
</View>
    );
}
