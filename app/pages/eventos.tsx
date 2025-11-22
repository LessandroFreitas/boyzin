// app/pages/eventos.tsx
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Link, Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  listarEventosPorAnimal,
  type AnimalEvent,
} from "../../services/eventoService";

const windowWidth = Dimensions.get("window").width;
const isDesktop = windowWidth > 768;

export default function EventosPage() {
  const router = useRouter();
  const { animalId } = useLocalSearchParams<{ animalId?: string }>();

  const [carregando, setCarregando] = useState(true);
  const [eventos, setEventos] = useState<AnimalEvent[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  async function carregar() {
    try {
      setErro(null);
      setCarregando(true);

      if (!animalId) {
        throw new Error("animalId não informado na rota.");
      }

      const dados = await listarEventosPorAnimal(String(animalId));
      setEventos(dados);
    } catch (e: any) {
      console.error("Falha ao carregar eventos:", e);
      setErro(e?.message ?? "Falha ao carregar eventos");
    } finally {
      setCarregando(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [animalId])
  );

  const temEventos = eventos.length > 0;

  return (
    <View style={styles.container}>
      {/* remove header padrão */}
      <Stack.Screen options={{ headerShown: false }} />

      <View
        style={[
          styles.inner,
          isDesktop && { width: 700, alignSelf: "center" },
        ]}
      >
        {/* 🔙 HEADER INLINE COM BOTÃO DE VOLTAR */}
        <View style={styles.inlineHeader}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#00780a" />
          </Pressable>
          {/* <Text style={styles.headerTitle}>voltar</Text> */}
        </View>

        {/* HEADER DE TÍTULO */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Eventos do animal</Text>
            <Text style={styles.subtitle}>
              Visualize e edite o histórico de eventos reprodutivos, vacinas,
              pesagens e ocorrências.
            </Text>
          </View>

          {animalId ? (
            <Link
              href={{
                pathname: "/forms/formularioEvento",
                params: { animalId: String(animalId) },
              }}
              asChild
            >
              <Pressable style={styles.newButton}>
                <Text style={styles.newButtonText}>Novo evento</Text>
              </Pressable>
            </Link>
          ) : null}
        </View>

        {/* CONTADOR */}
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeNumber}>{eventos.length}</Text>
            <Text style={styles.badgeLabel}>
              {temEventos ? "eventos cadastrados" : "nenhum evento ainda"}
            </Text>
          </View>
        </View>

        {/* TEXTO DE DICA */}
        {temEventos && (
          <Text style={styles.hintText}>
            Toque em um evento para editar ou visualizar os detalhes.
          </Text>
        )}

        {/* LISTA / ESTADOS */}
        {carregando ? (
          <View style={styles.center}>
            <ActivityIndicator color="#00780a" />
            <Text style={styles.centerText}>Carregando eventos...</Text>
          </View>
        ) : erro ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{erro}</Text>
            <Pressable onPress={carregar} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={eventos}
            keyExtractor={(i) => String(i.id)}
            contentContainerStyle={
              temEventos ? styles.listContent : styles.emptyContent
            }
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            renderItem={({ item }) => (
              <Link
                href={{
                  pathname: "/forms/formularioEvento",
                  params: { animalId: String(animalId), id: String(item.id) },
                }}
                asChild
              >
                <Pressable style={styles.eventCard}>
                  <View style={styles.eventHeaderRow}>
                    <Text style={styles.eventType}>{item.tipo}</Text>

                    <View style={styles.eventRight}>
                      <Text style={styles.eventDate}>
                        {item.data_do_evento}
                      </Text>
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color="#777"
                        style={{ marginLeft: 4 }}
                      />
                    </View>
                  </View>

                  {item.descricao ? (
                    <Text style={styles.eventDescription}>
                      {item.descricao}
                    </Text>
                  ) : (
                    <Text style={styles.eventDescriptionMuted}>
                      Sem descrição adicional.
                    </Text>
                  )}
                </Pressable>
              </Link>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                Nenhum evento cadastrado ainda. Toque em{" "}
                <Text style={{ fontWeight: "700" }}>“Novo evento”</Text> para
                registrar o primeiro.
              </Text>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7F5",
  },
  inner: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },

  /* 🔙 HEADER INLINE */
  inlineHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  backButton: {
    paddingRight: 8,
    paddingVertical: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },

  /* HEADER */
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B1B1F",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#666",
  },
  newButton: {
    backgroundColor: "#16a34a",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  newButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },

  /* BADGE */
  badgeRow: {
    marginTop: 12,
    marginBottom: 4,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  badgeNumber: {
    fontSize: 16,
    fontWeight: "800",
    color: "#00780a",
  },
  badgeLabel: {
    fontSize: 11,
    color: "#2E7D32",
  },

  hintText: {
    marginTop: 4,
    marginBottom: 8,
    fontSize: 12,
    color: "#666",
  },

  /* CENTRALIZADO */
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  centerText: {
    marginTop: 8,
    fontSize: 13,
    color: "#666",
  },

  errorBox: {
    marginTop: 16,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#FFEBEE",
    borderWidth: 1,
    borderColor: "#FFCDD2",
    gap: 10,
  },
  errorText: {
    color: "#C62828",
    fontSize: 13,
  },
  retryButton: {
    alignSelf: "flex-start",
    backgroundColor: "#00780a",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },

  listContent: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  emptyContent: {
    paddingTop: 20,
    paddingBottom: 20,
  },

  /* CARDS */
  eventCard: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  eventHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  eventType: {
    fontSize: 14,
    fontWeight: "800",
    color: "#006400",
  },
  eventRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  eventDate: {
    fontSize: 12,
    color: "#555",
  },
  eventDescription: {
    marginTop: 2,
    fontSize: 13,
    color: "#444",
  },
  eventDescriptionMuted: {
    marginTop: 2,
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
  },

  emptyText: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
  },
});