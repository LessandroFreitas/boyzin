// Home (aba principal após login)

import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
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

const windowWidth = Dimensions.get("window").width;
const isDesktop = windowWidth > 768;

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
  const [nomeUsuario, setNomeUsuario] = useState<string | null>(null);

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
          setNomeUsuario(perfilData.nome);

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
        <Pressable style={styles.card} onPress={() => abrirModal(animal)}>
          <View style={styles.cardLeft}>
            <Image
              source={{
                uri: "https://upload.wikimedia.org/wikipedia/commons/0/0c/Cow_female_black_white.jpg",
              }}
              style={styles.image}
              contentFit="cover"
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{animal.nome}</Text>
              <Text style={styles.cardSubtitle}>
                {animal.raca} • {animal.sexo === "M" ? "Macho" : "Fêmea"}
              </Text>
              <Text style={styles.cardHint}>Toque para ver os eventos do animal</Text>
            </View>
          </View>
        </Pressable>
      );
    } else if (tipoUsuario === "veterinario") {
      const cliente = item as Cliente;
      return (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{cliente.usuarios.nome}</Text>
          <Text style={styles.cardSubtitle}>{cliente.usuarios.email}</Text>
          <Text style={styles.cardHint}>{cliente.cidade}</Text>
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

  const labelQuantidade =
    tipoUsuario === "fazendeiro" ? "Animais cadastrados" : "Clientes vinculados";

  return (
    <View style={styles.container}>
      {/* HEADER MODERNO */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerGreeting}>
            Olá, {nomeUsuario ? nomeUsuario.split(" ")[0] : "produtor(a)"}
          </Text>
          <Text style={styles.headerTitle}>
            {tipoUsuario === "fazendeiro"
              ? "Seu rebanho sob controle"
              : "Sua agenda no campo"}
          </Text>
          <Text style={styles.headerSubtitle}>
            Acompanhe eventos, inseminações, vacinas e histórico reprodutivo.
          </Text>
        </View>

        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeNumber}>{dados.length}</Text>
          <Text style={styles.headerBadgeLabel}>{labelQuantidade}</Text>
        </View>
      </View>

      {/* LISTA */}
      <FlatList
        data={dados}
        keyExtractor={(item) => (item as any).id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          isDesktop && { width: 700, alignSelf: "center" },
        ]}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Nenhum registro encontrado ainda. Comece cadastrando um animal.
          </Text>
        }
      />

      {/* MODAL DE EVENTOS */}
      {animalSelecionado && (
        <EventosModal
          visible={mostrarModal}
          animalId={animalSelecionado.id}
          onClose={() => setMostrarModal(false)}
        />
      )}

      {/* BOTÃO FIXO NO RODAPÉ */}
      <View style={styles.footer}>
        {tipoUsuario === "fazendeiro" && (
          <Link href="../forms/formularioAnimal" asChild>
            <Pressable style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Cadastrar novo animal</Text>
            </Pressable>
          </Link>
        )}

        {tipoUsuario === "veterinario" && (
          <Link href="../pages/veterinarios" asChild>
            <Pressable style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Selecionar fazendeiro</Text>
            </Pressable>
          </Link>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  /* CONTAINER GERAL */
  container: {
    flex: 1,
    backgroundColor: "#F5F7F5",
  },

  /* HEADER */
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerGreeting: {
    fontSize: 14,
    color: "#555",
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#006400",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#777",
  },
  headerBadge: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    minWidth: 90,
  },
  headerBadgeNumber: {
    fontSize: 18,
    fontWeight: "800",
    color: "#00780a",
  },
  headerBadgeLabel: {
    fontSize: 10,
    textAlign: "center",
    color: "#2E7D32",
  },

  /* LISTA */
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 120,
    gap: 8,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 30,
    color: "#777",
    fontSize: 14,
  },

  /* CARD */
  card: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#222",
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#555",
    marginTop: 2,
  },
  cardHint: {
    fontSize: 11,
    color: "#888",
    marginTop: 4,
  },

  /* FOOTER */
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingBottom: 16,
    paddingTop: 8,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  primaryButton: {
    backgroundColor: "#00780a",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },

  /* LOADING */
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
});