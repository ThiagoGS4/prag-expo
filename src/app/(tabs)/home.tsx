import { ThemedView } from "@/components/themed-view"
import { FancyButton } from "@/components/ui/fancy-button"
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme"
import { extractTokenClaims } from "@/helpers/utils"
import { axiosInstance } from "@/services/api"
import { Feather as Icon } from "@react-native-vector-icons/feather"
import {
    addDays,
    isToday,
    isWithinInterval,
    parseISO,
    startOfDay,
} from "date-fns"
import { router, useFocusEffect } from "expo-router"
import * as SecureStore from "expo-secure-store"
import { useCallback, useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function HomeScreen() {
    const [data, setData] = useState({
        today: 0,
        done: 0,
        pendingToday: 0,
        scheduled7Days: 0,
    })
    const [username, setUsername] = useState("")

    const dataAtual = new Date()
    const diaNumero = dataAtual.getDate()

    const diaSemanaExtenso = new Intl.DateTimeFormat("pt-BR", {
        weekday: "long",
    }).format(dataAtual)

    const mesExtenso = new Intl.DateTimeFormat("pt-BR", {
        month: "long",
    }).format(dataAtual)

    useFocusEffect(
        useCallback(() => {
            const fetchDashboardData = async () => {
                try {
                    const resp = await axiosInstance.get("/schedules")
                    const schedules = resp.data || []

                    const now = new Date()
                    const startOfToday = startOfDay(now)

                    const todaySchedules = schedules.filter((item: any) =>
                        isToday(parseISO(item.scheduled_start)),
                    )

                    const completedToday = todaySchedules.filter(
                        (item: any) => !!item.completed_at,
                    )

                    const pendingToday = todaySchedules.filter(
                        (item: any) => !item.completed_at,
                    )

                    const next7Days = schedules.filter((item: any) => {
                        const start = parseISO(item.scheduled_start)
                        return isWithinInterval(start, {
                            start: startOfToday,
                            end: addDays(now, 7),
                        })
                    })

                    setData({
                        today: todaySchedules.length,
                        done: completedToday.length,
                        pendingToday: pendingToday.length,
                        scheduled7Days: next7Days.length,
                    })
                } catch (error) {
                    console.error("Erro ao buscar dados do painel:", error)
                }
            }
            const extractClaims = () => {
                const token = SecureStore.getItem("accessToken")
                return extractTokenClaims(token) || "Usuário"
            }

            setUsername(extractClaims())
            fetchDashboardData()
        }, []),
    )

    return (
        <ThemedView style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.pannel}>
                    <Text style={{ color: "#000000" }}>Domus Target</Text>
                    <Text style={{ color: "#000000" }}>
                        {diaSemanaExtenso}, {diaNumero} de {mesExtenso}
                    </Text>
                </View>
                <View>
                    <Text> Serviços</Text>
                </View>
                <View style={styles.cardContainer}>
                    <View style={styles.statusCard}>
                        <Text>parei aqui</Text>
                        {data.pendingToday}
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
                            <Icon
                                name="check-circle"
                                size={32}
                                color="black"
                            ></Icon>
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
                        <Text>
                            Serviços pendentes para hoje: {data.pendingToday}
                        </Text>
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
                            <Icon
                                name="calendar"
                                size={32}
                                color="black"
                            ></Icon>
                        </View>
                        <Text>
                            Agendamentos (próx 7 dias): {data.scheduled7Days}
                        </Text>
                    </View>
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
            </SafeAreaView>
        </ThemedView>
    )
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
    cardContainer: { alignItems: "center" },
    statusCard: {
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
    icon: {
        backgroundColor: "#1aff35",
    },
    pannel: {
        display: "flex",
        gap: 20,
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
        textAlign: "center",
    },
    code: {
        textTransform: "uppercase",
    },
})
