import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { excluirEvento } from "../services/eventoService";

export default function ModalExcluir({ visible, onClose, rawId }: any) {
  const [excluindo, setExcluindo] = useState(false);
  const router = useRouter();

  async function handleExcluir() {
    try {
      setExcluindo(true);
      const parsedId = Number(rawId);
      if (Number.isNaN(parsedId)) throw new Error("ID do evento é inválido.");

      await excluirEvento(parsedId);
      alert("Evento excluído com sucesso!");
      onClose();
      router.replace("../pages/home");
    } catch (e: any) {
      console.error("Erro ao excluir evento:", e);
      alert(e?.message ?? "Não foi possível excluir o evento.");
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Excluir evento</Text>
          <Text style={styles.message}>
            Deseja realmente excluir este evento?
          </Text>

          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelar]}
              onPress={onClose}
              disabled={excluindo}
            >
              <Text style={styles.textCancelar}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.excluir]}
              onPress={handleExcluir}
              disabled={excluindo}
            >
              {excluindo ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.textExcluir}>Excluir</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelar: {
    backgroundColor: "#ddd",
  },
  excluir: {
    backgroundColor: "#e63946",
  },
  textCancelar: {
    color: "#333",
    fontWeight: "bold",
  },
  textExcluir: {
    color: "#fff",
    fontWeight: "bold",
  },
});