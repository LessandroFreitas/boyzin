// app/veterinarios.tsx
import {
    atribuirVeterinarioAoFazendeiro,
    buscarVeterinarios,
} from "@/services/veterinarioService";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

export type Usuario = {
  nome: string;
  email: string;
};

export type Veterinario = {
  id: string;
  crmv: string;
  numero: string;
  bairro: string;
  cep: string;
  cidade: string;
  estado: string;
  complemento?: string;
  usuarios: Usuario;
};

export default function VeterinariosScreen() {
  const router = useRouter();
  const [veterinarios, setVeterinarios] = useState<Veterinario[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVeterinarios = async () => {
    try {
      const lista = await buscarVeterinarios();
      setVeterinarios(lista);
    } catch (err) {
      console.error("Erro ao buscar veterinários:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVeterinarios();
  }, []);

  const renderItem = ({ item }: { item: Veterinario }) => (
    <Pressable
      style={styles.card}
      onPress={() => handleSelectVeterinario(item)}
    >
      <View style={styles.cardHeaderRow}>
        <Text style={styles.nome}>{item.usuarios?.nome}</Text>
      </View>
      <Text style={styles.crm}>CRMV: {item.crmv}</Text>
      <Text style= {styles.info}>E-mail: {item.usuarios?.email}</Text>
      <Text style={styles.info}> 
        <Text>Endereço: </Text>
            {item.cidade} - {item.estado}, {item.bairro}, {item.numero}</Text>
      {item.complemento ? (
        <Text style={styles.complemento}>Compl.: {item.complemento}</Text>
      ) : null}
    </Pressable>
  );

  const total = veterinarios.length;

  return (
    <View style={styles.container}>
      {/* Desliga header nativo pra usar o inline */}
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.inner}>
        {/* 🔙 Header inline */}
        <View style={styles.inlineHeader}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={22} color="#00780a" />
          </Pressable>
          {/* <Text style={styles.inlineHeaderTitle}>voltar</Text> */}
        </View>

        {/* Título + subtítulo */}
        <Text style={styles.title}>Veterinários parceiros</Text>
        <Text style={styles.subtitle}>
          Veja abaixo os veterinários cadastrados no sistema e consulte seus dados de contato e localização.
        </Text>

        {/* Badge com contador */}
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeNumber}>{total}</Text>
            <Text style={styles.badgeLabel}>
              {total === 1
                ? "veterinário disponível"
                : total > 1
                ? "veterinários disponíveis"
                : "nenhum veterinário cadastrado"}
            </Text>
          </View>
        </View>


        {/* Lista / estados */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#00780a" />
            <Text style={styles.centerText}>Carregando veterinários...</Text>
          </View>
        ) : total === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>
              Ainda não há veterinários cadastrados. Peça para que se registrem
              no app para aparecerem aqui.
            </Text>
          </View>
        ) : (
          <FlatList
            data={veterinarios}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  /* Layout geral */
  container: {
    flex: 1,
    backgroundColor: "#F5F7F5",
  },
  inner: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    maxWidth: 700,
    alignSelf: "center",
  },

  /* Header inline */
  inlineHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  backButton: {
    paddingRight: 8,
    paddingVertical: 4,
  },
  inlineHeaderTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },

  /* Título principal */
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1B1B1F",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#666",
  },

  /* Badge */
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

  /* Dica */
  hintText: {
    marginTop: 4,
    marginBottom: 8,
    fontSize: 12,
    color: "#666",
  },

  /* Estados */
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  centerText: {
    marginTop: 8,
    fontSize: 13,
    color: "#666",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 16,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 20,
  },

  /* Card */
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 4,
  },
  nome: {
    fontSize: 16,
    fontWeight: "800",
    color: "#006400",
  },
  crm: {
    fontSize: 12,
    color: "#666",
  },
  info: {
    fontSize: 13,
    color: "#444",
  },
  complemento: {
    fontSize: 12,
    color: "#777",
    marginTop: 2,
    fontStyle: "italic",
  },
});

const handleSelectVeterinario = async (veterinario: Veterinario) => {
  atribuirVeterinarioAoFazendeiro(veterinario);
};