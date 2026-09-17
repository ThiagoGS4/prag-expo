import { DataTable } from "@/components/data-table";
import { axiosInstance } from "@/services/api";
import { format, parseISO } from "date-fns";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

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

  useEffect(() => {
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
          created_at: format(parseISO(item.created_at), "dd/MM/yyyy HH:mm:ss"),
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
  }, []);

  return (
    <View style={{ flex: 1, paddingTop: "10%" }}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Logs de Auditoria</Text>
      </View>

      <View style={styles.tableStyle}>
        <DataTable headers={headers} dataList={auditLogList} keyColumn="id" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333333",
  },
  tableStyle: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#43a047",
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
});
