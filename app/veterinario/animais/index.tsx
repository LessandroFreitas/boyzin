// app/veterinario/animais/index.tsx
import { listarAnimais } from "@/services/animalService";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";

export default function ListaAnimaisVet() {
  const router = useRouter();
  const [animais, setAnimais] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const lista = await listarAnimais();
        setAnimais(lista);
      } catch (err) {
        console.log("Erro ao listar animais:", err);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  if (carregando) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#00780a" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 26, fontWeight: "bold", marginBottom: 20, color: "#00780a" }}>
        Animais Cadastrados
      </Text>

      <FlatList
        data={animais}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/veterinario/animais/${item.id}` as unknown as any)}
            style={{
              backgroundColor: "#f0f0f0",
              padding: 15,
              borderRadius: 8,
              marginBottom: 10,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>{item.nome}</Text>
            <Text style={{ fontSize: 15 }}>Raça: {item.raca}</Text>
            <Text style={{ fontSize: 15 }}>Sexo: {item.sexo}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}
