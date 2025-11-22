// components/EventosModal.tsx
import { listarEventosPorAnimal, type AnimalEvent } from "@/services/eventoService";
import { Link } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const windowWidth = Dimensions.get("window").width;
const isDesktop = windowWidth > 768;

type Props = {
  animalId: string;
  visible: boolean;
  onClose: () => void;
};

export default function EventosModal({ animalId, visible, onClose }: Props) {
  const [carregando, setCarregando] = useState(true);
  const [eventos, setEventos] = useState<AnimalEvent[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  async function carregar() {
    try {
      setErro(null);
      setCarregando(true);
      const dados = await listarEventosPorAnimal(String(animalId));
      setEventos(dados);
    } catch (e: any) {
      setErro(e?.message ?? "Falha ao carregar eventos");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    if (visible) carregar();
  }, [visible, animalId]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      transparent
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Cabeçalho do modal */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Eventos do animal</Text>
              <Text style={styles.subtitle}>
                Consulte o histórico de pesagens, vacinas, inseminações e outros
                registros importantes.
              </Text>
            </View>

            <Pressable onPress={onClose} style={styles.xButton}>
              <Text style={styles.xButtonText}>×</Text>
            </Pressable>
          </View>

          {/* Corpo */}
          <View style={styles.body}>
            {carregando ? (
              <View style={styles.center}>
                <ActivityIndicator color="#00780a" />
                <Text style={styles.bodyText}>Carregando eventos...</Text>
              </View>
            ) : erro ? (
              <View style={styles.center}>
                <Text style={styles.errorText}>{erro}</Text>
                <Pressable style={styles.retryButton} onPress={carregar}>
                  <Text style={styles.retryButtonText}>Tentar novamente</Text>
                </Pressable>
              </View>
            ) : (
              <FlatList
                data={eventos}
                keyExtractor={(i) => String(i.id)}
                contentContainerStyle={
                  eventos.length === 0 ? styles.emptyList : styles.eventsList
                }
                renderItem={({ item }) => {
                  const descricao =
                    (item as any).descricao ??
                    (item as any).observacoes ??
                    (item as any).descricao_evento ??
                    "";

                  return (
                    <View style={styles.eventCard}>
                      <View style={styles.eventHeaderRow}>
                        <Text style={styles.eventType}>{item.tipo}</Text>
                        <Text style={styles.eventDate}>{item.data_do_evento}</Text>
                      </View>

                      {descricao ? (
                        <Text style={styles.eventDescription}>{descricao}</Text>
                      ) : (
                        <Text style={styles.eventDescriptionMuted}>
                          Sem descrição adicional.
                        </Text>
                      )}
                    </View>
                  );
                }}
                ListEmptyComponent={
                  <Text style={styles.bodyText}>
                    Nenhum evento cadastrado ainda.
                  </Text>
                }
              />
            )}
          </View>

          {/* Área de ações */}
          <View style={styles.actions}>
            <Link
              href={{ pathname: "../pages/eventos", params: { animalId } }}
              asChild
            >
              <Pressable onPress={onClose} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Detalhar eventos</Text>
              </Pressable>
            </Link>

            <Link
              href={{ pathname: "/forms/formularioAnimal", params: { id: animalId } }}
              asChild
            >
              <Pressable onPress={onClose} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Editar animal</Text>
              </Pressable>
            </Link>

          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: isDesktop ? 700 : "92%",
    maxHeight: "85%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
  },

  /* HEADER */
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 10,
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
  xButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F1F1",
  },
  xButtonText: {
    fontSize: 20,
    lineHeight: 20,
    color: "#444",
  },

  /* BODY */
  body: {
    flexGrow: 1,
    minHeight: 80,
    marginTop: 4,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 8,
  },
  bodyText: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
  },
  errorText: {
    fontSize: 13,
    color: "#D32F2F",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 8,
    backgroundColor: "#00780a",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },

  eventsList: {
    paddingVertical: 4,
    gap: 10,
  },
  emptyList: {
    paddingVertical: 12,
  },

  /* CARD DE EVENTO */
  eventCard: {
    backgroundColor: "#F6F7F5",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  eventHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 4,
  },
  eventType: {
    fontSize: 14,
    fontWeight: "700",
    color: "#006400",
  },
  eventDate: {
    fontSize: 12,
    color: "#555",
  },
  eventDescription: {
    fontSize: 13,
    color: "#444",
    marginTop: 2,
  },
  eventDescriptionMuted: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
    fontStyle: "italic",
  },

  /* AÇÕES */
  actions: {
    marginTop: 14,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: "#00780a",
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  secondaryButton: {
    borderColor: "#00780a",
    borderWidth: 1.5,
    paddingVertical: 11,
    borderRadius: 999,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#00780a",
    fontWeight: "600",
    fontSize: 14,
  },
  ghostButton: {
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
  },
  ghostButtonText: {
    color: "#666",
    fontWeight: "500",
    fontSize: 14,
  },
});