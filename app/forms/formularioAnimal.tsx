// app/forms/formularioAnimal.tsx
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { Animal, obterAnimal, salvarAnimal } from "../../services/animalService";

/* ===================== Helpers de Data ===================== */
const pad = (n: number) => String(n).padStart(2, "0");
const formatBR = (d: Date) =>
  `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
const parseBR = (s?: string) => {
  if (!s) return null;
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  return isNaN(d.getTime()) ? null : d;
};
const clampByBounds = (
  d: Date,
  { minDate, maxDate }: { minDate?: Date; maxDate?: Date }
) => {
  if (maxDate && d > maxDate) return maxDate;
  if (minDate && d < minDate) return minDate;
  return d;
};

function toISODate(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatISO(br: string) {
  const d = parseBR(br);
  if (!d) return "";
  return toISODate(d);
}

// Converte YYYY-MM-DD para Date local
function parseISOToLocal(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/* ===================== DatePicker Simples ===================== */
export function DatePicker({
  label,
  value,
  onChange,
  maxDate,
  minDate,
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
  maxDate?: Date;
  minDate?: Date;
}) {
  const [show, setShow] = useState(false);
  const current = parseBR(value) ?? new Date();

  const handleChange = (_: DateTimePickerEvent, selectedDate?: Date) => {
    setShow(Platform.OS === "ios"); // iOS mantém aberto
    if (selectedDate) {
      const clamped = clampByBounds(selectedDate, { minDate, maxDate });
      onChange(formatBR(clamped));
    }
  };

  // ===== Web fallback =====
  if (Platform.OS === "web") {
    return (
      <View style={{ gap: 6, width: "100%" }}>
        <Text style={styles.label}>{label}</Text>
        {/* @ts-ignore: elemento web */}
        <input
          type="date"
          value={value ? formatISO(value) : ""}
          max={maxDate ? toISODate(maxDate) : undefined}
          min={minDate ? toISODate(minDate) : undefined}
          onChange={(e: any) => {
            const d = parseISOToLocal(e.target.value);
            if (!isNaN(d.getTime())) onChange(formatBR(d));
          }}
          style={styles.webDateInput as any}
        />
      </View>
    );
  }

  return (
    <View style={{ gap: 6, width: "100%" }}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity onPress={() => setShow(true)} style={styles.input}>
        <Text style={{ color: value ? "#111" : "#9ca3af" }}>
          {value || "dd/mm/aaaa"}
        </Text>
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={current}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={handleChange}
          maximumDate={maxDate}
          minimumDate={minDate}
        />
      )}
    </View>
  );
}

/* ===================== Tipagem do Form ===================== */
type AnimalForm = {
  nome: string;
  raca: string;
  sexo: "M" | "F" | "";
  dataNascimento: string;
  pai_nome: string;
  pai_registro: string;
  pai_raca: string;
  mae_nome: string;
  mae_registro: string;
  mae_raca: string;
};

/* ===================== UI Auxiliares ===================== */
const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    <View style={{ gap: 12 }}>{children}</View>
  </View>
);

const LabeledInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric" | "email-address";
}) => (
  <View style={{ gap: 6 }}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType ?? "default"}
    />
  </View>
);

/* ===================== Tela ===================== */
export default function FormularioAnimal() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [animalId, setAnimalId] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const [form, setForm] = useState<AnimalForm>({
    nome: "",
    raca: "",
    sexo: "",
    dataNascimento: "",
    pai_nome: "",
    pai_registro: "",
    pai_raca: "",
    mae_nome: "",
    mae_registro: "",
    mae_raca: "",
  });

  const setField = <K extends keyof AnimalForm>(
    key: K,
    value: AnimalForm[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const obrigatoriosOk =
    !!form.nome.trim() &&
    !!form.raca.trim() &&
    !!form.sexo &&
    !!form.dataNascimento.trim();

  /* Carregar dados quando estiver editando */
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const a = await obterAnimal(id);
        setAnimalId(a.id!);
        setForm({
          nome: a.nome ?? "",
          raca: a.raca ?? "",
          sexo: (a.sexo as "M" | "F") ?? "",
          dataNascimento: a.data_nascimento ?? "",
          pai_nome: a.pai_nome ?? "",
          pai_registro: a.pai_registro ?? "",
          pai_raca: a.pai_raca ?? "",
          mae_nome: a.mae_nome ?? "",
          mae_registro: a.mae_registro ?? "",
          mae_raca: a.mae_raca ?? "",
        });
      } catch (e: any) {
        Alert.alert("Erro", e.message ?? "Falha ao carregar animal.");
      }
    })();
  }, [id]);

  const onSalvar = async () => {
    if (!obrigatoriosOk) {
      Alert.alert(
        "Campos obrigatórios",
        "Preencha Nome, Raça, Sexo e Data de Nascimento."
      );
      return;
    }

    const animalParaSalvar: Animal = {
      id: animalId ?? undefined,
      nome: form.nome,
      raca: form.raca,
      sexo: form.sexo as "M" | "F",
      data_nascimento: form.dataNascimento,
      pai_nome: form.pai_nome || undefined,
      pai_registro: form.pai_registro || undefined,
      pai_raca: form.pai_raca || undefined,
      mae_nome: form.mae_nome || undefined,
      mae_registro: form.mae_registro || undefined,
      mae_raca: form.mae_raca || undefined,
    };

    try {
      setSalvando(true);
      const salvo = await salvarAnimal(animalParaSalvar);
      setAnimalId(salvo.id!);
      Alert.alert("Sucesso", "Animal salvo com sucesso!");
      router.push("/(tabs)");
    } catch (err: any) {
      Alert.alert("Erro", err.message || "Não foi possível salvar o animal.");
    } finally {
      setSalvando(false);
    }
  };

  const tituloPagina = animalId ? "Editar Animal" : "Cadastro de Animal";

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F5F7F5" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 70 : 0}
    >
      {/* Desliga o header nativo para usarmos o header inline */}
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAwareScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={250}
        enableOnAndroid
      >
        {/* 🔹 HEADER INLINE COM ÍCONE + TÍTULO (OPÇÃO 2) */}
        <View style={styles.inlineHeader}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={22} color="#00780a" />
          </TouchableOpacity>
          {/* <Text style={styles.inlineHeaderTitle}>voltar</Text> */}
        </View>

        {/* Título grande da tela (mantido) */}
        <Text style={styles.mainTitle}>{tituloPagina}</Text>
        <Text style={styles.subtitle}>
          Preencha as informações abaixo para manter o histórico completo do
          rebanho.
        </Text>

        {/* Dados do Animal */}
        <Section title="Dados do Animal">
          <LabeledInput
            label="Nome *"
            value={form.nome}
            onChangeText={(t) => setField("nome", t)}
          />
          <LabeledInput
            label="Raça *"
            value={form.raca}
            onChangeText={(t) => setField("raca", t)}
          />

          <View style={{ gap: 6 }}>
            <Text style={styles.label}>Sexo *</Text>
            <View style={styles.sexoRow}>
              {(["M", "F"] as const).map((sx) => (
                <TouchableOpacity
                  key={sx}
                  onPress={() => setField("sexo", sx)}
                  activeOpacity={0.9}
                  style={[
                    styles.sexoBtn,
                    form.sexo === sx && styles.sexoBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.sexoBtnText,
                      form.sexo === sx && { color: "#fff" },
                    ]}
                  >
                    {sx === "M" ? "Macho" : "Fêmea"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <DatePicker
            label="Data de Nascimento *"
            value={form.dataNascimento}
            onChange={(s) => setField("dataNascimento", s)}
            maxDate={new Date()}
          />
        </Section>

        {/* Informações do Pai */}
        <Section title="Informações do Pai">
          <LabeledInput
            label="Nome"
            value={form.pai_nome}
            onChangeText={(t) => setField("pai_nome", t)}
          />
          <LabeledInput
            label="Registro"
            value={form.pai_registro}
            onChangeText={(t) => setField("pai_registro", t)}
          />
          <LabeledInput
            label="Raça"
            value={form.pai_raca}
            onChangeText={(t) => setField("pai_raca", t)}
          />
        </Section>

        {/* Informações da Mãe */}
        <Section title="Informações da Mãe">
          <LabeledInput
            label="Nome"
            value={form.mae_nome}
            onChangeText={(t) => setField("mae_nome", t)}
          />
          <LabeledInput
            label="Registro"
            value={form.mae_registro}
            onChangeText={(t) => setField("mae_registro", t)}
          />
          <LabeledInput
            label="Raça"
            value={form.mae_raca}
            onChangeText={(t) => setField("mae_raca", t)}
          />
        </Section>

        {/* Botão Eventos (primeiro - verde sólido) */}
        {animalId && (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() =>
              router.push({ pathname: "/pages/eventos", params: { animalId } })
            }
            style={styles.btnSolid}
          >
            <Text style={styles.btnSolidText}>Ver eventos do animal</Text>
          </TouchableOpacity>
        )}

        {/* Salvar (segundo - só borda verde) */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onSalvar}
          disabled={salvando || !obrigatoriosOk}
          style={[
            styles.btnOutline,
            (salvando || !obrigatoriosOk) && { opacity: 0.6 },
          ]}
        >
          <Text style={styles.btnOutlineText}>
            {salvando
              ? "Salvando..."
              : animalId
              ? "Salvar alterações"
              : "Salvar Animal"}
          </Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </KeyboardAvoidingView>
  );
}

/* ===================== Estilos ===================== */
const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 32,
    backgroundColor: "#F5F7F5",
    gap: 20,
    alignItems: "center",
  },

  /* 🔹 Header inline (ícone + texto) */
  inlineHeader: {
    width: "100%",
    maxWidth: 800,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
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

  mainTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#00780a",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 4,
    maxWidth: 320,
  },

  section: {
    width: "100%",
    maxWidth: 800,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    padding: 14,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionHeader: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 6,
    marginBottom: 6,
  },
  sectionTitle: {
    fontWeight: "700",
    fontSize: 16,
    color: "#00780a",
  },

  label: { fontWeight: "600", color: "#111827", fontSize: 13 },

  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  webDateInput: {
    width: "100%",
    padding: 10,
    borderRadius: 10,
    border: "1px solid #d1d5db",
    boxSizing: "border-box",
    background: "#f9fafb",
    fontSize: 14,
  },

  sexoRow: { flexDirection: "row", gap: 10 },
  sexoBtn: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: "#ffffff",
  },
  sexoBtnActive: {
    backgroundColor: "#00780a",
    borderColor: "#00780a",
  },
  sexoBtnText: { color: "#00780a", fontWeight: "600", fontSize: 13 },

  /* Botão Verde Sólido */
  btnSolid: {
    backgroundColor: "#00780a",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    marginTop: 8,
    width: "100%",
    maxWidth: 800,
  },
  btnSolidText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },

  /* Botão Só Borda */
  btnOutline: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#00780a",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    marginTop: 8,
    width: "100%",
    maxWidth: 800,
  },
  btnOutlineText: {
    color: "#00780a",
    fontWeight: "800",
    fontSize: 15,
  },
});