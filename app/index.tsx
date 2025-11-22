import { Link } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      {/* Logo / Título */}
      <View style={styles.header}>
        <Image
          source={require("@/assets/images/logo.png")} 
          style={styles.logo}
        />
        <Text style={styles.title}>Bem-vindo ao Flo Bovino</Text>
        <Text style={styles.subtitle}>
          Cadastre-se ou entre para continuar
        </Text>
      </View>

      {/* Botões principais */}
      <View style={styles.buttonContainer}>
        <Link href="../forms/formularioFazendeiro" asChild>
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Cadastrar Fazendeiro</Text>
          </Pressable>
        </Link>

        <Link href="../forms/formularioVeterinario " asChild>
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Cadastrar Veterinário</Text>
          </Pressable>
        </Link>

        <Link href="../pages/login" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Fazer Login</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#00780aff",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: "#555",
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    gap: 16,
  },
  primaryButton: {
    backgroundColor: "#00780aff",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: "90%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  secondaryButton: {
    borderColor: "#00780aff",
    borderWidth: 2,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: "90%",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#00780aff",
    fontWeight: "bold",
    fontSize: 16,
  },
});