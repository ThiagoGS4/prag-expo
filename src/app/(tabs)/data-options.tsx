import { handleLogout } from "@/components/app-tabs";
import { DataTable } from "@/components/data-table";
import ExpansionPannel from "@/components/expansion-pannel";
import { ThemedView } from "@/components/themed-view";
import { FancyButton } from "@/components/ui/fancy-button";
import { MaxContentWidth, Spacing } from "@/constants/theme";
import { getFullWrittenDay } from "@/helpers/utils";
import { axiosInstance } from "@/services/api";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type EntityType = "service" | "status" | "plague";

interface IFormData {
  id?: number;
  name?: string;
}

export default function DataOptionsScreen() {
  const [serviceList, setServiceList] = useState<any[]>([]);
  const [statusList, setStatusList] = useState<any[]>([]);
  const [plagueList, setPlagueList] = useState<any[]>([]);

  const [activeEntity, setActiveEntity] = useState<EntityType>("service");
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteData, setDeleteData] = useState<{ id: number; name: string }>();
  const [deleteModal, setDeleteModal] = useState(false);
  const [mainForm, setMainForm] = useState<IFormData>();

  const endpoints = {
    service: {
      get: "/services",
      post: "/inserirServices",
      put: "/alterarServices",
      del: "/services",
      key: "serviceName",
      label: "Serviço",
    },
    status: {
      get: "/status",
      post: "/inserirStatus",
      put: "/alterarStatus",
      del: "/status",
      key: "statusName",
      label: "Status",
    },
    plague: {
      get: "/plagues",
      post: "/inserirPlagues",
      put: "/alterarPlagues",
      del: "/plagues",
      key: "plagueName",
      label: "Praga",
    },
  };

  const loadData = async () => {
    try {
      const [servResp, statResp, plagResp] = await Promise.all([
        axiosInstance.get(endpoints.service.get),
        axiosInstance.get(endpoints.status.get),
        axiosInstance.get(endpoints.plague.get),
      ]);
      setServiceList(servResp.data);
      setStatusList(statResp.data);
      setPlagueList(plagResp.data);
    } catch (error) {
      console.error("Erro ao buscar dados das opções:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  function openEditModal(type: EntityType, row: any) {
    setActiveEntity(type);
    setIsEditing(true);
    setMainForm({
      id: row.id,
      name: row[endpoints[type].key],
    });
    setOpenModal(true);
  }

  function openCreateModal(type: EntityType) {
    setActiveEntity(type);
    setIsEditing(false);
    setMainForm({ name: "" });
    setOpenModal(true);
  }

  function openDeleteModal(type: EntityType, id: number, name: string) {
    setActiveEntity(type);
    setDeleteData({ id, name });
    setDeleteModal(true);
  }

  function closeClean() {
    setIsEditing(false);
    setOpenModal(false);
    setDeleteModal(false);
    setMainForm(undefined);
    setDeleteData(undefined);
  }

  async function submitForm() {
    const config = endpoints[activeEntity];
    const payload: any = {};

    if (isEditing) payload.id = mainForm?.id;
    payload[config.key] = mainForm?.name;

    try {
      if (isEditing) {
        await axiosInstance.put(config.put, payload);
      } else {
        await axiosInstance.post(config.post, payload);
      }
      await loadData();
      closeClean();
    } catch (error) {
      console.error(`Erro ao salvar ${config.label}:`, error);
    }
  }

  async function confirmDelete() {
    if (!deleteData) return;
    const config = endpoints[activeEntity];

    try {
      await axiosInstance.delete(`${config.del}/${deleteData.id}`);
      await loadData();
      closeClean();
    } catch (error) {
      console.error(`Erro ao deletar ${config.label}:`, error);
    }
  }

  const getActions = (type: EntityType) => [
    {
      icon: "edit",
      iconColor: "#43a047",
      onPress: (row: any) => openEditModal(type, row),
    },
    {
      icon: "trash-2",
      iconColor: "red",
      onPress: (row: any) =>
        openDeleteModal(type, row.id, row[endpoints[type].key]),
    },
  ];

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={{ flex: 1, backgroundColor: "#F7F8FA" }}>
          <Modal visible={deleteModal} transparent={true} animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.formModalBody}>
                <Text
                  style={{
                    fontSize: 16,
                    textAlign: "center",
                    marginBottom: 20,
                  }}
                >
                  Deseja realmente excluir o(a){" "}
                  {endpoints[activeEntity].label.toLowerCase()} "
                  {deleteData?.name ?? ""}"?
                </Text>
                <View style={styles.buttonAlign}>
                  <Pressable onTouchEnd={closeClean}>
                    <Text style={{ color: "#333333" }}>Cancelar</Text>
                  </Pressable>
                  <Pressable onTouchEnd={confirmDelete}>
                    <Text style={{ color: "red", fontWeight: "bold" }}>
                      Excluir
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>

          <Modal visible={openModal} transparent={true} animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.formModalBody}>
                <Text style={styles.modalTitle}>
                  {isEditing ? "Editar" : "Novo"}{" "}
                  {endpoints[activeEntity].label}
                </Text>
                <TextInput
                  value={mainForm?.name}
                  onChangeText={(texto) =>
                    setMainForm((prev) => ({
                      ...prev,
                      name: texto,
                    }))
                  }
                  placeholder={`Nome do(a) ${endpoints[activeEntity].label}`}
                  style={styles.inputBox}
                />
                <View style={styles.buttonAlign}>
                  <Pressable onTouchEnd={closeClean}>
                    <Text style={{ color: "#333333" }}>Cancelar</Text>
                  </Pressable>
                  <Pressable
                    disabled={!mainForm?.name}
                    onTouchEnd={submitForm}
                    style={{ opacity: mainForm?.name ? 1 : 0.5 }}
                  >
                    <Text
                      style={{
                        color: "#43a047",
                        fontWeight: "bold",
                      }}
                    >
                      {isEditing ? "Atualizar" : "Salvar"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>

          <View style={styles.pannel}>
            <Text style={styles.title}>Opções do Sistema</Text>
            <Text style={styles.subtitle}>{getFullWrittenDay()}</Text>
          </View>

          <ScrollView
            contentContainerStyle={{
              paddingBottom: 40,
              paddingTop: "15%",
            }}
          >
            <View style={styles.pageHeader}>
              <FancyButton
                bgColor="#e53935"
                padding={8}
                buttonFunc={handleLogout}
                icon="log-out"
              >
                <Text style={styles.buttonText}>Sair da conta</Text>
              </FancyButton>
            </View>

            <View style={{ gap: 8 }}>
              <ExpansionPannel label="Serviço">
                <View style={styles.section}>
                  <DataTable
                    headers={["ID", "Serviço"]}
                    dataList={serviceList}
                    keyColumn="id"
                    actions={getActions("service")}
                  />
                </View>
                <View style={{ alignItems: "center", marginBottom: 20 }}>
                  <FancyButton
                    icon="plus"
                    bgColor="#1f6f5b"
                    fontColor="#FFFFFF"
                    width={320}
                    height={50}
                    buttonFunc={() => openCreateModal("service")}
                  >
                    Novo Serviço
                  </FancyButton>
                </View>
              </ExpansionPannel>

              <ExpansionPannel label="Status">
                <View style={styles.section}>
                  <DataTable
                    headers={["ID", "Status"]}
                    dataList={statusList}
                    keyColumn="id"
                    actions={getActions("status")}
                  />
                </View>
                <View style={{ alignItems: "center", marginBottom: 20 }}>
                  <FancyButton
                    icon="plus"
                    bgColor="#1f6f5b"
                    fontColor="#FFFFFF"
                    width={320}
                    height={50}
                    buttonFunc={() => openCreateModal("status")}
                  >
                    Novo Status
                  </FancyButton>
                </View>
              </ExpansionPannel>

              <ExpansionPannel label="Plagues">
                <View style={styles.section}>
                  <DataTable
                    headers={["ID", "Praga"]}
                    dataList={plagueList}
                    keyColumn="id"
                    actions={getActions("plague")}
                  />
                </View>
                <View style={{ alignItems: "center", marginBottom: 20 }}>
                  <FancyButton
                    icon="plus"
                    bgColor="#1f6f5b"
                    fontColor="#FFFFFF"
                    width={320}
                    height={50}
                    buttonFunc={() => openCreateModal("plague")}
                  >
                    Nova Praga
                  </FancyButton>
                </View>
              </ExpansionPannel>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
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
  section: {
    marginBottom: 32,
  },
  pageHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: "#CCCCCC",
    paddingBottom: 16,
    paddingHorizontal: "4%",
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333333",
  },
  buttonText: {
    textAlign: "center",
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  formModalBody: {
    width: "90%",
    maxHeight: "80%",
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 8,
  },
  inputBox: {
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 8,
    fontSize: 16,
    color: "#333333",
  },
  buttonAlign: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 24,
    marginTop: 12,
  },
});
