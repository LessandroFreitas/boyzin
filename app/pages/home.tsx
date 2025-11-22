// app/home.tsx
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import { Link, Stack } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import EventosModal from "@/components/eventosModal";

import { supabase } from "@/config/supabase_config";
import { listarAnimaisDoUsuario } from "@/services/animalService";
import { listarClientesDoVeterinario } from "@/services/veterinarioService";

type Usuario = {
  id: string;
  nome: string;
  email: string;
  tipo: "fazendeiro" | "veterinario";
};

type Animal = {
  id: string;
  nome: string;
  raca: string;
  sexo: "M" | "F";
  data_nascimento: string;
  vacinas?: { tipo: string; data_aplicacao: string }[];
};

export type UsuarioDados = {
  nome: string;
  email: string;
};

type Cliente = {
  id: string;
  cidade: string;
  usuarios: UsuarioDados;
};

type TipoDado = Animal | Cliente;

export default function HomeScreen() {
  const [dados, setDados] = useState<TipoDado[]>([]);
  const [loading, setLoading] = useState(true);
  const [tipoUsuario, setTipoUsuario] = useState<Usuario["tipo"] | null>(null);

  const [animalSelecionado, setAnimalSelecionado] = useState<Animal | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  function abrirModal(animal: Animal) {
    setAnimalSelecionado(animal);
    setMostrarModal(true);
  }


  useFocusEffect(
    useCallback(() => {
      async function carregarDados() {
        try {
          setLoading(true);

          const { data: userRes, error: userError } = await supabase.auth.getUser();
          if (userError) throw userError;
          if (!userRes.user) return;

          const { data: perfilData, error: perfilError } = await supabase
            .from("usuarios")
            .select("id, nome, email, tipo")
            .eq("id", userRes.user.id)
            .single();

          if (perfilError) throw perfilError;
          setTipoUsuario(perfilData.tipo);

          if (perfilData.tipo === "fazendeiro") {
            const animais = await listarAnimaisDoUsuario();
            setDados(animais || []);
          } else if (perfilData.tipo === "veterinario") {
            const clientes = await listarClientesDoVeterinario(perfilData.id);
            setDados(clientes || []);
          }
        } catch (err) {
          console.error("Erro ao carregar dados:", err);
        } finally {
          setLoading(false);
        }
      }

      carregarDados();
    }, [])
  );

  const renderItem = ({ item }: { item: TipoDado }) => {
    if (tipoUsuario === "fazendeiro") {
      const animal = item as Animal;

      return (
        <View style={styles.item}>
          {/* Card do animal -> leva para eventos */}

          <Pressable style={styles.itemLeft} onPress={() => abrirModal(animal)}>
            <Image
              source={{
                uri: "https://upload.wikimedia.org/wikipedia/commons/0/0c/Cow_female_black_white.jpg",
              }}
              style={styles.image}
              contentFit="cover"
            />
            <View>
              <Text style={styles.name}>{animal.nome}</Text>
              <Text style={styles.age}>
                {animal.raca} - {animal.sexo === "M" ? "Macho" : "Fêmea"}
              </Text>
            </View>
          </Pressable>
        </View>
      );
    } else if (tipoUsuario === "veterinario") {
      const cliente = item as Cliente;
      return (
        <View style={styles.item}>
          <View>
            <Text style={styles.name}>{cliente.usuarios.nome}</Text>
            <Text style={styles.age}>{cliente.usuarios.email}</Text>
            <Text style={styles.age}>{cliente.cidade}</Text>
          </View>
        </View>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00780a" />
        <Text style={{ marginTop: 10 }}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Stack.Screen options={{ headerShown: false }} />

      <FlatList
        data={dados}
        keyExtractor={(item) => (item as any).id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 8, gap: 8, paddingBottom: 100 }}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20, color: "#555" }}>
            Nenhum dado cadastrado ainda.
          </Text>
        }
      />

      {animalSelecionado && (
        <EventosModal
          visible={mostrarModal}
          animalId={animalSelecionado.id}
          onClose={() => setMostrarModal(false)}
        />
      )}


      <View style={styles.footer}>
        {tipoUsuario === "fazendeiro" && (
          <Link href="/forms/formularioAnimal" asChild>
            <Pressable style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Abrir formulário animal</Text>
            </Pressable>
          </Link>
        )}

        {tipoUsuario === "veterinario" && (
          <Link href="/pages/veterinarios" asChild style={{ marginTop: 10 }}>
            <Pressable style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Selecionar veterinário</Text>
            </Pressable>
          </Link>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 2,
    borderColor: "#606060ff",
    marginHorizontal: 4,
    borderRadius: 8,
    justifyContent: "space-between",
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  image: { width: 50, height: 50, borderRadius: 5 },
  name: { color: "#000", fontWeight: "600" },
  age: { color: "#000" },
  actions: { flexDirection: "row", gap: 8, marginLeft: 8 },
  actionBtn: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8 },
  actionText: { color: "#fff", fontWeight: "700" },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingBottom: 12,
    backgroundColor: "#fff",
  },
  primaryButton: {
    backgroundColor: "#00780a",
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});