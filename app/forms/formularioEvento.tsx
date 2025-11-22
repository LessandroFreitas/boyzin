// app/forms/formularioEvento.tsx
import { Ionicons } from "@expo/vector-icons"; // 🔹 NOVO
import DateTimePicker from "@react-native-community/datetimepicker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import ModalExcluir from "@/components/modalExcluirEvento";
import {
  atualizarEvento,
  criarEvento,
  obterEvento,
  type AnimalEvent,
  type EventType,
} from "../../services/eventoService";
import { criarVacina } from "../../services/vacinaService";

/* ===== Helpers de data (YYYY-MM-DD) ===== */
function pad(n: number) {
  return String(n).padStart(2, "0");
}
function toISO(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function parseISO(s?: string) {
  if (!s) return null;
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return isNaN(d.getTime()) ? null : d;
}

/* ===== Campo de data multiplataforma ===== */
function ISODateField({
  label,
  value,
  onChange,
  maxDate,
  minDate,
  helperText,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  maxDate?: Date;
  minDate?: Date;
  helperText?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const date = parseISO(value) ?? new Date();

  return (
    <View style={{ gap: 4 }}>
      <Text style={styles.label}>{label}</Text>
      {helperText && <Text style={styles.helperText}>{helperText}</Text>}

      {Platform.OS === "web" ? (
        // @ts-ignore (DOM)
        <input
          type="date"
          value={value}
          max={maxDate ? toISO(maxDate) : undefined}
          min={minDate ? toISO(minDate) : undefined}
          onChange={(e: any) => onChange(e.target.value)}
          style={styles.webInput}
        />
      ) : (
        <>
          <Pressable onPress={() => setOpen(true)}>
            <TextInput
              value={value}
              editable={false}
              style={styles.input}
              placeholder="YYYY-MM-DD"
            />
          </Pressable>
          {open && (
            <DateTimePicker
              mode="date"
              value={date}
              display={Platform.OS === "ios" ? "inline" : "default"}
              onChange={(_, d) => {
                if (d) onChange(toISO(d));
                setOpen(false);
              }}
              maximumDate={maxDate}
              minimumDate={minDate}
            />
          )}
        </>
      )}
    </View>
  );
}

const TIPOS: EventType[] = ["INSEMINAÇÃO", "VACINA", "REPRODUÇÃO", "NASCIMENTO"];

const TIPO_HINTS: Record<
  EventType,
  { title: string; text: string }
> = {
  INSEMINAÇÃO: {
    title: "Janela ideal de inseminação",
    text: "Registre a inseminação logo após o procedimento. Isso ajuda a acompanhar o cio e prever a próxima avaliação de gestação.",
  },
  VACINA: {
    title: "Controle de imunização",
    text: "Informe nome, lote e validade (se possível). Um histórico detalhado evita falhas no calendário vacinal do rebanho.",
  },
  REPRODUÇÃO: {
    title: "Acompanhamento reprodutivo",
    text: "Use este tipo para coberturas naturais, diagnósticos de gestação e retornos de cio.",
  },
  NASCIMENTO: {
    title: "Registro de nascimento",
    text: "Registrar a data de nascimento é essencial para idade, peso à desmama e desempenho futuro do animal.",
  },
};

export default function FormularioEvento() {
  const router = useRouter();
  const { animalId, id } =
    useLocalSearchParams<{ animalId: string; id?: string }>();

  const editando = Boolean(id);
  const [salvando, setSalvando] = React.useState(false);
  const [excluindo, setExcluindo] = React.useState(false);
  const [modalExcluirVisivel, setModalExcluirVisivel] = React.useState(false);

  // campos do evento
  const [tipo, setTipo] = React.useState<EventType>("INSEMINAÇÃO");
  const [data, setData] = React.useState<string>(toISO(new Date()));
  const [descricao, setDescricao] = React.useState("");

  // campos extras quando tipo = VACINA
  const [vacinaNome, setVacinaNome] = React.useState("");
  const [vacinaLote, setVacinaLote] = React.useState("");
  const [vacinaValidade, setVacinaValidade] = React.useState<string>("");
  const [mostrarValidade, setMostrarValidade] = React.useState(false);

  // Preload quando editar
  React.useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const ev = await obterEvento(String(id));

        // 🔹 Normalizar o tipo vindo do banco para um dos tipos válidos
        const tipoNormalizado = TIPOS.includes(ev.tipo as EventType)
          ? (ev.tipo as EventType)
          : "INSEMINAÇÃO";

        setTipo(tipoNormalizado);
        setData(ev.data_do_evento);
        setDescricao(ev.descricao ?? "");
      } catch (e: any) {
        Alert.alert("Erro", e.message ?? "Falha ao carregar evento.");
      }
    })();
  }, [id]);

  const obrigatoriosOk = !!animalId && !!data && !!tipo;

  // 🔹 Hint seguro, mesmo se tipo vier quebrado
  const tipoHint =
    TIPO_HINTS[tipo] ?? {
      title: "Evento do animal",
      text: "Registre as informações importantes para o histórico do animal.",
    };

  /* ===== SALVAR ===== */
  async function onSalvar() {
    try {
      if (!obrigatoriosOk) {
        Alert.alert("Campos obrigatórios", "Selecione o tipo e a data.");
        return;
      }
      setSalvando(true);

      const payload: AnimalEvent = {
        id: id ? Number(id) : undefined,
        id_animal: String(animalId),
        tipo,
        data_do_evento: data,
        descricao: descricao || undefined,
      };

      if (payload.id) await atualizarEvento(payload.id, payload);
      else await criarEvento(payload);

      // se for vacina, grava também na tabela de vacinas
      if (tipo === "VACINA" && vacinaNome.trim()) {
        let validadeDias: number | null = null;
        const dAplic = parseISO(data);
        const dVal = parseISO(vacinaValidade);
        if (dAplic && dVal) {
          const diff =
            (dVal.getTime() - dAplic.getTime()) / (1000 * 60 * 60 * 24);
          validadeDias = Math.max(Math.round(diff), 0);
        }

        await criarVacina({
          animal_id: String(animalId),
          tipo: vacinaNome.trim(),
          data_aplicacao: data,
          validade_dias: validadeDias ?? null,
        });
      }

      Alert.alert("Sucesso", "Evento salvo!");
      router.back();
    } catch (e: any) {
      Alert.alert("Erro", e.message ?? "Não foi possível salvar o evento.");
    } finally {
      setSalvando(false);
    }
  }

  /* ===== EXCLUIR ===== */
  function onExcluir() {
    if (!id) {
      Alert.alert(
        "Erro",
        "Não foi possível identificar o evento para exclusão."
      );
      return;
    }
    setModalExcluirVisivel(true);
  }

  const helperData =
    tipo === "INSEMINAÇÃO"
      ? "Use a data exata em que a inseminação foi realizada."
      : "Informe a data em que o evento aconteceu.";

  const tituloPagina = editando ? "Editar evento" : "Novo evento";

  /* ===== INTERFACE ===== */
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F5F7F5" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 70 : 0}
    >
      {/* 🔹 Desliga o header nativo para usar header inline com seta */}
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={250}
        enableOnAndroid
      >
        <View style={styles.cardWrapper}>
          {/* 🔹 HEADER INLINE COM BOTÃO DE VOLTAR (MESMO ESTILO DO FORMULÁRIO DE ANIMAL) */}
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

          <View style={styles.card}>
            {/* Header do formulário (sem os chips) */}
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>
                {editando ? "Editar evento" : "Registrar novo evento"}
              </Text>
              <Text style={styles.formSubtitle}>
                Preencha os dados do cio, inseminação, vacina, nascimento ou
                outra ocorrência importante para o histórico do animal.
              </Text>
            </View>

            {/* Tipo */}
            <Text style={styles.label}>Tipo *</Text>
            <View style={styles.rowWrap}>
              {TIPOS.map((t) => (
                <Pressable
                  key={t}
                  onPress={() => setTipo(t)}
                  style={[
                    styles.chip,
                    tipo === t && {
                      backgroundColor: "#00780a",
                      borderColor: "#00780a",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      tipo === t && { color: "#fff" },
                    ]}
                  >
                    {t}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Dica dinâmica do tipo (com fallback seguro) */}
            <View style={styles.tipoHintBox}>
              <Text style={styles.tipoHintTitle}>{tipoHint.title}</Text>
              <Text style={styles.tipoHintText}>{tipoHint.text}</Text>
            </View>

            {/* Data */}
            <ISODateField
              label="Data do evento *"
              value={data}
              onChange={setData}
              maxDate={new Date()}
              helperText={helperData}
            />

            {/* Descrição */}
            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={[styles.input, { minHeight: 90, textAlignVertical: "top" }]}
              multiline
              value={descricao}
              onChangeText={setDescricao}
              placeholder="Observações, sintomas, comentários sobre o cio, inseminação ou ocorrência..."
            />

            {/* Campos de vacina */}
            {tipo === "VACINA" && (
              <View style={{ gap: 10, marginTop: 10 }}>
                <Text style={styles.sectionTitle}>Dados da vacina</Text>

                <Text style={styles.label}>Nome da vacina *</Text>
                <TextInput
                  style={styles.input}
                  value={vacinaNome}
                  onChangeText={setVacinaNome}
                  placeholder="Ex.: Aftosa, Raiva..."
                />

                <Text style={styles.label}>Lote (opcional)</Text>
                <TextInput
                  style={styles.input}
                  value={vacinaLote}
                  onChangeText={setVacinaLote}
                  placeholder="Ex.: L123"
                />

                <Text style={styles.label}>Validade (opcional)</Text>
                <Pressable onPress={() => setMostrarValidade(true)}>
                  <TextInput
                    style={styles.input}
                    editable={false}
                    placeholder="Selecione a validade"
                    value={vacinaValidade}
                  />
                </Pressable>

                {mostrarValidade && (
                  <DateTimePicker
                    mode="date"
                    value={
                      vacinaValidade
                        ? parseISO(vacinaValidade) ?? new Date()
                        : new Date()
                    }
                    display={Platform.OS === "ios" ? "inline" : "default"}
                    onChange={(_, d) => {
                      setMostrarValidade(false);
                      if (d) setVacinaValidade(toISO(d));
                    }}
                  />
                )}
              </View>
            )}

            {/* Ações */}
            <Pressable
              onPress={onSalvar}
              style={[styles.btn, styles.primaryBtn]}
              disabled={salvando}
            >
              <Text style={styles.btnText}>
                {salvando
                  ? "Salvando..."
                  : editando
                  ? "Salvar alterações"
                  : "Salvar evento"}
              </Text>
            </Pressable>

            {editando && (
              <Pressable
                onPress={onExcluir}
                style={[styles.btn, styles.dangerBtn]}
                disabled={excluindo}
              >
                <Text style={styles.btnText}>
                  {excluindo ? "Excluindo..." : "Excluir evento"}
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </KeyboardAwareScrollView>

      {/* Modal de confirmação de exclusão */}
      {editando && (
        <ModalExcluir
          visible={modalExcluirVisivel}
          onClose={() => setModalExcluirVisivel(false)}
          rawId={id}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  cardWrapper: {
    maxWidth: 700,
    width: "100%",
    alignSelf: "center",
  },

  /* 🔹 Header inline igual ao do formulário de animal */
  inlineHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  backButton: {
    paddingVertical: 4,
    paddingRight: 8,
  },
  inlineHeaderTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
    gap: 12,
  },

  formHeader: {
    marginBottom: 6,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B1B1F",
  },
  formSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#666",
  },

  label: { fontWeight: "600", color: "#222" },
  helperText: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 4,
  },

  input: {
    backgroundColor: "#F9F9F9",
    borderWidth: 1,
    borderColor: "#D0D0D0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  webInput: {
    width: "100%",
    display: "block",
    boxSizing: "border-box",
    background: "#F9F9F9",
    border: "1px solid #D0D0D0",
    borderRadius: 10,
    padding: "10px 12px",
    height: 44,
    outline: "none",
    fontSize: 14,
  } as any,

  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: "#CCCCCC",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
  },
  chipText: { color: "#00780a", fontWeight: "600", fontSize: 13 },

  tipoHintBox: {
    marginTop: 4,
    marginBottom: 4,
    backgroundColor: "#F1F8E9",
    padding: 10,
    borderRadius: 10,
  },
  tipoHintTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#33691E",
    marginBottom: 2,
  },
  tipoHintText: {
    fontSize: 12,
    color: "#4B5563",
  },

  sectionTitle: {
    fontWeight: "700",
    fontSize: 16,
    color: "#00780a",
  },

  btn: {
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
    marginTop: 8,
  },
  primaryBtn: {
    backgroundColor: "#00780a",
  },
  dangerBtn: {
    backgroundColor: "#DC2626",
  },
  btnText: { color: "#fff", fontWeight: "800", fontSize: 14 },
});