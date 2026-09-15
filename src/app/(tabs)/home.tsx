import { ThemedView } from "@/components/themed-view";
import { FancyButton } from "@/components/ui/fancy-button";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { extractTokenClaims } from "@/helpers/utils";
import { Feather as Icon } from "@react-native-vector-icons/feather";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const [data, setData] = useState({
    today: 0,
    done: 0,
    pendingToday: 0,
    scheduled7Days: 0,
  });
  const [username, setUsername] = useState("");

  const dataAtual = new Date();

  const diaNumero = dataAtual.getDate();

  const diaSemanaExtenso = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
  }).format(dataAtual);

  const mesExtenso = new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(
    dataAtual,
  );

  useEffect(() => {
    const extractClaims = () => {
      return extractTokenClaims(SecureStore.getItem("accessToken"));
    };
    setUsername(extractClaims());
  });

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.pannel}>
          <View>
            <Text style={{ color: "#FFFFFF", fontSize: 12, textAlign: "left" }}>
              PAINEL DE CONTROLE
            </Text>
            <Text style={{ color: "#FFFFFF", fontSize: 16, textAlign: "left" }}>
              Olá {username} 👋
            </Text>
            <Text style={{ color: "#FFFFFF", fontSize: 12, textAlign: "left" }}>
              {diaSemanaExtenso}, {diaNumero} de {mesExtenso}
            </Text>
          </View>
          <View>
            <FancyButton
              icon="calendar"
              bgColor="#45c057"
              fontColor="#FFFFFF"
              buttonFunc={() => router.push("/(tabs)/schedules")}
            >
              Ir para agendamentos
            </FancyButton>
          </View>
        </View>

        <View style={styles.fastAccess}>
          <View style={styles.infoCard}>
            <View
              style={{
                backgroundColor: "#1aff35",
                padding: 4,
                borderRadius: 12,
                marginRight: 8,
              }}
            >
              <Icon name="sun" size={32} color="black"></Icon>
            </View>
            <Text>Agendamentos de hoje: {data.today}</Text>
          </View>

          <View style={styles.infoCard}>
            <View
              style={{
                backgroundColor: "#14a324",
                padding: 4,
                borderRadius: 12,
                marginRight: 8,
              }}
            >
              <Icon name="check-circle" size={32} color="black"></Icon>
            </View>
            <Text>Serviços finalizados hoje: {data.done}</Text>
          </View>

          <View style={styles.infoCard}>
            <View
              style={{
                backgroundColor: "#fdbe41",
                padding: 4,
                borderRadius: 12,
                marginRight: 8,
              }}
            >
              <Icon name="clock" size={32} color="black"></Icon>
            </View>
            <Text>Serviços pendentes para hoje: {data.pendingToday}</Text>
          </View>

          <View style={styles.infoCard}>
            <View
              style={{
                backgroundColor: "#177add",
                padding: 4,
                borderRadius: 12,
                marginRight: 8,
              }}
            >
              <Icon name="calendar" size={32} color="black"></Icon>
            </View>
            <Text>Agendamentos (próx 7 dias): {data.scheduled7Days}</Text>
          </View>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    flexDirection: "row",
    backgroundColor: "#F3F6F5",
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: "center",
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  fastAccess: {
    display: "flex",
    gap: 16,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    padding: 10,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    boxShadow: "0px 4px 10px 2px rgba(0, 0, 0, 0.25)",
  },
  icon: {
    backgroundColor: "#1aff35",
  },
  pannel: {
    display: "flex",
    gap: 20,
    alignItems: "center",
    experimental_backgroundImage: "linear-gradient(45deg, #1F8A5D, #0E56A0)",
    padding: 26,
    paddingRight: 60,
    paddingLeft: 60,
    borderRadius: 12,
  },
  heroSection: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  title: {
    textAlign: "center",
  },
  code: {
    textTransform: "uppercase",
  },
});
