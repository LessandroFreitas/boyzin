// app/veterinario/animais/[id].tsx
import { obterAnimal } from "@/services/animalService";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

export default function DetalhesAnimalVet() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [animal, setAnimal] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const dados = await obterAnimal(String(id));
        setAnimal(dados);
      } catch (err) {
        console.error("Erro ao obter animal:", err);
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, [id]);

  if (loading || !animal) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#00780a" />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Pressable
        onPress={() => router.back()}
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}
      >
        <Ionicons name="chevron-back" size={22} color="#00780a" />
        <Text style={{ fontSize: 16, color: "#00780a" }}>Voltar</Text>
      </Pressable>

      <Text style={{ fontSize: 26, fontWeight: "bold", marginBottom: 20, color: "#00780a" }}>
        {animal.nome}
      </Text>

      <View style={{ backgroundColor: "#f9f9f9", padding: 15, borderRadius: 10 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>Informações gerais</Text>

        <Text style={{ fontSize: 16 }}>Raça: {animal.raca}</Text>
        <Text style={{ fontSize: 16 }}>Sexo: {animal.sexo}</Text>
        <Text style={{ fontSize: 16 }}>Nascimento: {animal.data_nascimento}</Text>

        <Text style={{ fontSize: 18, marginTop: 20, fontWeight: "bold" }}>Pai</Text>
        <Text>Nome: {animal.pai_nome || "-"}</Text>
        <Text>Registro: {animal.pai_registro || "-"}</Text>
        <Text>Raça: {animal.pai_raca || "-"}</Text>

        <Text style={{ fontSize: 18, marginTop: 20, fontWeight: "bold" }}>Mãe</Text>
        <Text>Nome: {animal.mae_nome || "-"}</Text>
        <Text>Registro: {animal.mae_registro || "-"}</Text>
        <Text>Raça: {animal.mae_raca || "-"}</Text>

        <Text style={{ fontSize: 18, marginTop: 20, fontWeight: "bold" }}>
          ID do Fazendeiro
        </Text>
        <Text>{animal.fazendeiro_id}</Text>
      </View>
    </ScrollView>
  );
}
