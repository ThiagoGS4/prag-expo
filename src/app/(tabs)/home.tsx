import DivisorBar from "@/components/divisor-bar";
import { ThemedView } from "@/components/themed-view";
import { FancyButton } from "@/components/ui/fancy-button";
import VerticalDivisor from "@/components/vertical-divisor";
import { MaxContentWidth, Spacing } from "@/constants/theme";
import { extractTokenClaims, parseDate } from "@/helpers/utils";
import { axiosInstance } from "@/services/api";
import { Feather as Icon } from "@react-native-vector-icons/feather/static";
import {
  addDays,
  addHours,
  format,
  isToday,
  isWithinInterval,
  parseISO,
  startOfDay,
} from "date-fns";
import { router, useFocusEffect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, SectionList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const [data, setData] = useState<{
    today: number;
    done: number;
    pendingToday: number;
    scheduled7Days: number;
    scheduledWeek: {
      scheduleStart: string;
      scheduleEnd: string;
      name: string;
      index: number;
    }[];
  }>();
  const [pageWeekData, setPageWeekData] = useState<
    {
      scheduleStart: string;
      scheduleEnd: string;
      name: string;
      index: number;
    }[]
  >([]);
  const [username, setUsername] = useState("");

  const dataAtual = new Date();
  const diaNumero = dataAtual.getDate();

  const diaSemanaExtenso = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
  }).format(dataAtual);

  const mesExtenso = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
  }).format(dataAtual);

  useFocusEffect(
    useCallback(() => {
      const fetchDashboardData = async () => {
        try {
          const resp = await axiosInstance.get(
            `/scheduledWeek/${new Date().toISOString()}`,
          );
          const schedules = resp.data || [];

          const now = new Date();
          const startOfToday = startOfDay(now);

          const todaySchedules = schedules.filter((item: any) =>
            isToday(parseISO(item.scheduled_start)),
          );

          const completedToday = todaySchedules.filter(
            (item: any) => !!item.completed_at,
          );

          const pendingToday = todaySchedules.filter(
            (item: any) => !item.completed_at,
          );

          const next7Days = schedules.filter((item: any) => {
            const start = parseISO(item.scheduled_start);
            return isWithinInterval(start, {
              start: startOfToday,
              end: addDays(now, 7),
            });
          });

          const week = schedules.map((item: any, index: number) => {
            return {
              index,
              scheduleStart: item.scheduled_start,
              scheduleEnd: item.scheduled_end,
              name: item.properties.name,
            };
          });

          setData({
            today: todaySchedules.length,
            done: completedToday.length,
            pendingToday: pendingToday.length,
            scheduled7Days: next7Days.length,
            scheduledWeek: week,
          });

          const pagedWeek = week ? week.slice(0, 3) : [];
          setPageWeekData(pagedWeek);
        } catch (error) {
          console.error("Erro ao buscar dados do painel:", error);
        }
      };

      const extractClaims = () => {
        const token = SecureStore.getItem("accessToken");
        return extractTokenClaims(token) || "Usuário";
      };

      setUsername(extractClaims());
      fetchDashboardData();
    }, []),
  );

  // isso deixa os botões enabled ou disabled
  const allSchedules = data?.scheduledWeek || [];
  const firstItemIndex = pageWeekData[0]?.index ?? 0;
  const lastItemIndex = pageWeekData[pageWeekData.length - 1]?.index ?? -1;

  const isPrevDisabled = pageWeekData.length === 0 || firstItemIndex === 0;
  const isNextDisabled =
    allSchedules.length === 0 || lastItemIndex >= allSchedules.length - 1;

  // lidando com botão próximo
  function nextBtn() {
    const weekData = pageWeekData ?? [];
    if (weekData.length === 0) {
      return;
    }
    const lastItem = weekData?.[weekData.length - 1];
    const nextIndex = (lastItem?.index ?? -1) + 1;

    const nextPartial = data
      ? data.scheduledWeek.slice(nextIndex, nextIndex + 3)
      : [];

    setPageWeekData(nextPartial);
  }
  // lidando com botão anterior
  function prevBtn() {
    const weekData = pageWeekData;
    if (weekData.length === 0) {
      return;
    }
    const firstItem = weekData?.[0];
    const firstItemIndex = firstItem?.index ?? 0;

    let prevIndex = firstItemIndex - 3;

    if (prevIndex < 0) prevIndex = 0;

    const prevPartial = data
      ? data.scheduledWeek.slice(prevIndex, prevIndex + 3)
      : [];

    setPageWeekData(prevPartial);
  }

  const agendaSections = useMemo(() => {
    if (!pageWeekData || pageWeekData.length === 0) return [];

    const grouped: Record<string, any[]> = {};

    pageWeekData.forEach((item) => {
      const formattedDate = parseDate(item.scheduleStart);

      if (!grouped[formattedDate]) {
        grouped[formattedDate] = [];
      }

      grouped[formattedDate].push({
        name: item.name,

        from: format(addHours(item.scheduleStart, 3), "HH:mm"),

        to: format(addHours(item.scheduleEnd, 3), "HH:mm"),

        formData: item,
      });
    });

    const formatedToSections = Object.keys(grouped).map((dateKey) => ({
      title: dateKey,
      day: new Date(dateKey).toLocaleDateString("pt-BR", {
        day: "2-digit",
      }),
      month: new Date(dateKey)
        .toLocaleDateString("pt-BR", {
          month: "long",
        })
        .slice(0, 3),
      data: grouped[dateKey],
    }));

    console.log(formatedToSections[0]);

    return formatedToSections;
  }, [pageWeekData]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.pannel}>
            <Text style={styles.title}>Domus Target</Text>
            <Text style={styles.subtitle}>
              {diaSemanaExtenso}, {diaNumero} de {mesExtenso}
            </Text>
          </View>
          <View>
            <Text style={styles.subsections}> Serviços</Text>
          </View>
          <View style={styles.cardContainer}>
            <View style={styles.statusCard}>
              <View style={{ justifyContent: "center", alignItems: "center" }}>
                <Text style={[styles.numbers, { color: "#ffd400" }]}>
                  {data?.pendingToday}
                </Text>
                <Text>Pend.</Text>
              </View>
              <View style={{ justifyContent: "center", alignItems: "center" }}>
                <Text style={[styles.numbers, { color: "#7fc8a9" }]}>
                  {data?.done}
                </Text>
                <Text>Concluídos</Text>
              </View>
              <View style={{ justifyContent: "center", alignItems: "center" }}>
                <Text style={[styles.numbers, { color: "#1a5093" }]}>
                  {data?.today}
                </Text>
                <Text>Hoje</Text>
              </View>
            </View>
          </View>

          <View>
            <Text style={styles.subsections}>
              {" "}
              Agendamentos próximos (7 dias)
            </Text>
          </View>
          <View style={styles.fastAccess}>
            <SectionList
              scrollEnabled={false}
              sections={agendaSections}
              keyExtractor={(item, index) => item.name + index}
              renderItem={({ item }) => (
                <View style={styles.infoCard}>
                  <View
                    style={{
                      padding: 4,
                      borderRadius: 12,
                      marginRight: 8,
                    }}
                  >
                    <Icon name="clock" size={32} color="black"></Icon>
                  </View>

                  <Text style={styles.cardText}>
                    {item.from} - {item.to}
                  </Text>
                  <VerticalDivisor label="" height={20}></VerticalDivisor>
                  <Text style={styles.cardText}>{item.name}</Text>
                </View>
              )}
              renderSectionHeader={({ section }) => {
                return (
                  <View
                    style={{
                      paddingHorizontal: Spacing.three,
                      paddingTop: Spacing.three,
                    }}
                  >
                    <DivisorBar label={section.day + " de " + section.month} />
                  </View>
                );
              }}
            />
          </View>
          <View style={styles.pageButtons}>
            <FancyButton
              disabled={isPrevDisabled}
              buttonFunc={() => prevBtn()}
              icon="arrow-left"
              width={70}
            />
            <FancyButton
              disabled={isNextDisabled}
              buttonFunc={() => nextBtn()}
              icon="arrow-right"
              width={70}
            />
          </View>

          {/* atalho para ir para agendamentos */}
          <View style={{ alignItems: "center" }}>
            <FancyButton
              icon="calendar"
              bgColor="#1f6f5b"
              fontColor="#FFFFFF"
              width={320}
              height={50}
              buttonFunc={() => router.push("/(tabs)/schedules")}
            >
              Ir para agendamentos
            </FancyButton>
          </View>
        </ScrollView>
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
  scrollContent: {
    gap: Spacing.three,
    paddingBottom: Spacing.four,
  },
  safeArea: {
    flex: 1,
    gap: Spacing.three,
    maxWidth: MaxContentWidth,
    width: "100%",
  },
  fastAccess: {
    gap: 16,
    minHeight: 260,
  },
  subsections: {
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 16,
    color: "#000000",
    paddingHorizontal: Spacing.two,
  },
  infoCard: {
    marginHorizontal: Spacing.four,
    backgroundColor: "#FFFFFF",
    padding: 10,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    marginVertical: 6,
    boxShadow: "0px 4px 10px 2px rgba(0, 0, 0, 0.25)",
  },
  cardContainer: { alignItems: "center" },
  numbers: {
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 20,
  },
  statusCard: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    width: 366,
    height: 93,
    backgroundColor: "#ffffff",
    borderColor: "rgba(0, 0, 0, 0.30)",
    borderWidth: 1,
    borderRadius: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  cardText: {
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 15,
    color: "#000000",
  },
  pageButtons: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  icon: {
    backgroundColor: "#1aff35",
  },
  pannel: {
    display: "flex",
    gap: 12,
    alignItems: "center",
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
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 24,
    color: "#000000",
  },
  subtitle: {
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 12,
    color: "#1f6f5b",
  },
  code: {
    textTransform: "uppercase",
  },
});
