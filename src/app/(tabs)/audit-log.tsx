import { DataTable } from "@/components/data-table";
import { ThemedView } from "@/components/themed-view";
import { MaxContentWidth, Spacing } from "@/constants/theme";
import { getFullWrittenDay } from "@/helpers/utils";
import { axiosInstance } from "@/services/api";
import { format, parseISO } from "date-fns";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface IAuditLog {
  id: number;
  operation: string;
  method: string;
  status: string;
  created_at: string;
  created_by: string;
  ip: string;
  payload: string | any;
}

export default function AuditLogScreen() {
  const [auditLogList, setAuditLogList] = useState<any[]>([]);

  const headers = [
    "Operação",
    "Método",
    "Status",
    "Criado em",
    "Executor",
    "IP",
    "Conteúdo",
  ];

  useFocusEffect(
    useCallback(() => {
      const fetchAuditLogs = async () => {
        try {
          const resp = await axiosInstance.get("/auditLog");
          const data: IAuditLog[] = resp.data;

          const sortedData = data.sort((a, b) => {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            return dateB - dateA;
          });

          const mappedData = sortedData.map((item) => ({
            operation: item.operation,
            method: item.method,
            status: item.status,
            created_at: format(
              parseISO(item.created_at),
              "dd/MM/yyyy HH:mm:ss",
            ),
            created_by: item.created_by,
            ip: item.ip,
            payload: item.payload,
          }));

          setAuditLogList(mappedData);
        } catch (error) {
          console.error("Erro ao buscar logs de auditoria:", error);
        }
      };

      fetchAuditLogs();
    }, []),
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.pannel}>
          <Text style={styles.title}>Logs de Auditoria</Text>
          <Text style={styles.subtitle}>{getFullWrittenDay()}</Text>
        </View>

        <DataTable headers={headers} dataList={auditLogList} keyColumn="id" />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F6F5",
  },
  safeArea: {
    flex: 1,
    gap: Spacing.three,
    maxWidth: MaxContentWidth,
    width: "100%",
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
    textAlign: "center",
  },
});
