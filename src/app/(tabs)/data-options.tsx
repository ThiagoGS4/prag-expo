import { handleLogout } from "@/components/app-tabs";
import { DataTable } from "@/components/data-table";
import ExpansionPannel from "@/components/expansion-pannel";
import { ThemedView } from "@/components/themed-view";
import { FancyButton } from "@/components/ui/fancy-button";
import { MaxContentWidth, Spacing } from "@/constants/theme";
import { getFullWrittenDay } from "@/helpers/utils";
import { axiosInstance } from "@/services/api";
import { Feather as Icon } from "@react-native-vector-icons/feather/static";
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

interface IFormData {
  id?: number;
  name?: string;
}

export default function DataOptionsScreen() {
  const [serviceList, setServiceList] = useState<any[]>([]);
  const [statusList, setStatusList] = useState<any[]>([]);
  const [plagueList, setPlagueList] = useState<any[]>([]);

  const [openService, setOpenService] = useState(false);
  const [isEditingService, setIsEditingService] = useState(false);
  const [formService, setFormService] = useState<IFormData>();
  const [deleteServiceModal, setDeleteServiceModal] = useState(false);
  const [deleteServiceData, setDeleteServiceData] = useState<{
    id: number;
    name: string;
  }>();

  const [openStatus, setOpenStatus] = useState(false);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [formStatus, setFormStatus] = useState<IFormData>();
  const [deleteStatusModal, setDeleteStatusModal] = useState(false);
  const [deleteStatusData, setDeleteStatusData] = useState<{
    id: number;
    name: string;
  }>();

  const [openPlague, setOpenPlague] = useState(false);
  const [isEditingPlague, setIsEditingPlague] = useState(false);
  const [formPlague, setFormPlague] = useState<IFormData>();
  const [deletePlagueModal, setDeletePlagueModal] = useState(false);
  const [deletePlagueData, setDeletePlagueData] = useState<{
    id: number;
    name: string;
  }>();

  const loadData = async () => {
    try {
      const [servResp, statResp, plagResp] = await Promise.all([
        axiosInstance.get("/services"),
        axiosInstance.get("/status"),
        axiosInstance.get("/plagues"),
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

  function closeServiceClean() {
    setIsEditingService(false);
    setOpenService(false);
    setDeleteServiceModal(false);
    setFormService(undefined);
    setDeleteServiceData(undefined);
  }

  async function submitService() {
    const payload: any = { serviceName: formService?.name };
    if (isEditingService) payload.id = formService?.id;

    try {
      if (isEditingService)
        await axiosInstance.put("/alterarServices", payload);
      else await axiosInstance.post("/inserirServices", payload);
      await loadData();
      closeServiceClean();
    } catch (error) {
      console.error("Erro ao salvar serviço:", error);
    }
  }

  async function confirmDeleteService() {
    if (!deleteServiceData) return;
    try {
      await axiosInstance.delete(`/services/${deleteServiceData.id}`);
      await loadData();
      closeServiceClean();
    } catch (error) {
      console.error("Erro ao deletar serviço:", error);
    }
  }

  const serviceActions = [
    {
      icon: "edit",
      iconColor: "#43a047",
      onPress: (row: any) => {
        setFormService({ id: row.id, name: row.serviceName });
        setIsEditingService(true);
        setOpenService(true);
      },
    },
    {
      icon: "trash-2",
      iconColor: "red",
      onPress: (row: any) => {
        setDeleteServiceData({ id: row.id, name: row.serviceName });
        setDeleteServiceModal(true);
      },
    },
  ];

  function closeStatusClean() {
    setIsEditingStatus(false);
    setOpenStatus(false);
    setDeleteStatusModal(false);
    setFormStatus(undefined);
    setDeleteStatusData(undefined);
  }

  async function submitStatus() {
    const payload: any = { statusName: formStatus?.name };
    if (isEditingStatus) payload.id = formStatus?.id;

    try {
      if (isEditingStatus) await axiosInstance.put("/alterarStatus", payload);
      else await axiosInstance.post("/inserirStatus", payload);
      await loadData();
      closeStatusClean();
    } catch (error) {
      console.error("Erro ao salvar status:", error);
    }
  }

  async function confirmDeleteStatus() {
    if (!deleteStatusData) return;
    try {
      await axiosInstance.delete(`/status/${deleteStatusData.id}`);
      await loadData();
      closeStatusClean();
    } catch (error) {
      console.error("Erro ao deletar status:", error);
    }
  }

  const statusActions = [
    {
      icon: "edit",
      iconColor: "#43a047",
      onPress: (row: any) => {
        setFormStatus({ id: row.id, name: row.statusName });
        setIsEditingStatus(true);
        setOpenStatus(true);
      },
    },
    {
      icon: "trash-2",
      iconColor: "red",
      onPress: (row: any) => {
        setDeleteStatusData({ id: row.id, name: row.statusName });
        setDeleteStatusModal(true);
      },
    },
  ];

  function closePlagueClean() {
    setIsEditingPlague(false);
    setOpenPlague(false);
    setDeletePlagueModal(false);
    setFormPlague(undefined);
    setDeletePlagueData(undefined);
  }

  async function submitPlague() {
    const payload: any = { plagueName: formPlague?.name };
    if (isEditingPlague) payload.id = formPlague?.id;

    try {
      if (isEditingPlague) await axiosInstance.put("/alterarPlagues", payload);
      else await axiosInstance.post("/inserirPlagues", payload);
      await loadData();
      closePlagueClean();
    } catch (error) {
      console.error("Erro ao salvar praga:", error);
    }
  }

  async function confirmDeletePlague() {
    if (!deletePlagueData) return;
    try {
      await axiosInstance.delete(`/plagues/${deletePlagueData.id}`);
      await loadData();
      closePlagueClean();
    } catch (error) {
      console.error("Erro ao deletar praga:", error);
    }
  }

  const plagueActions = [
    {
      icon: "edit",
      iconColor: "#43a047",
      onPress: (row: any) => {
        setFormPlague({ id: row.id, name: row.plagueName });
        setIsEditingPlague(true);
        setOpenPlague(true);
      },
    },
    {
      icon: "trash-2",
      iconColor: "red",
      onPress: (row: any) => {
        setDeletePlagueData({ id: row.id, name: row.plagueName });
        setDeletePlagueModal(true);
      },
    },
  ];

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={{ flex: 1, backgroundColor: "#F7F8FA" }}>
          <Modal
            visible={deleteServiceModal}
            transparent={true}
            animationType="fade"
          >
            <View style={styles.modalOverlay}>
              <View style={styles.formModalBody}>
                <Text
                  style={{
                    fontSize: 16,
                    textAlign: "center",
                    marginBottom: 20,
                  }}
                >
                  Deseja realmente excluir o serviço "
                  {deleteServiceData?.name ?? ""}"?
                </Text>
                <View style={styles.buttonAlign}>
                  <Pressable onTouchEnd={closeServiceClean}>
                    <Text style={{ color: "#333333" }}>Cancelar</Text>
                  </Pressable>
                  <Pressable onTouchEnd={confirmDeleteService}>
                    <Text style={{ color: "red", fontWeight: "bold" }}>
                      Excluir
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>

          <Modal visible={openService} transparent={true} animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.formModalBody}>
                <View
                  style={{ flexDirection: "row", gap: 6, marginBottom: 10 }}
                >
                  <Text style={styles.modalTitleHeader}>
                    {isEditingService ? "Editando" : "Novo"} Serviço
                  </Text>
                  <Icon name="settings" size={25} />
                </View>
                <TextInput
                  value={formService?.name}
                  onChangeText={(texto) =>
                    setFormService((prev) => ({ ...prev, name: texto }))
                  }
                  placeholder="Nome do serviço"
                  style={styles.inputBox}
                />
                <View style={styles.buttonAlign}>
                  <FancyButton
                    buttonFunc={closeServiceClean}
                    width={85}
                    height={38}
                  >
                    <Text style={{ color: "#000000" }}>Cancelar</Text>
                  </FancyButton>
                  <FancyButton
                    buttonFunc={submitService}
                    disabled={!formService?.name}
                    bgColor="#1f6f5b"
                    fontColor="#FFFFFF"
                    width={85}
                    height={38}
                  >
                    <Text style={{ textDecorationLine: "underline" }}>
                      {isEditingService ? "Atualizar" : "Salvar"}
                    </Text>
                  </FancyButton>
                </View>
              </View>
            </View>
          </Modal>

          <Modal
            visible={deleteStatusModal}
            transparent={true}
            animationType="fade"
          >
            <View style={styles.modalOverlay}>
              <View style={styles.formModalBody}>
                <Text
                  style={{
                    fontSize: 16,
                    textAlign: "center",
                    marginBottom: 20,
                  }}
                >
                  Deseja realmente excluir o status "
                  {deleteStatusData?.name ?? ""}"?
                </Text>
                <View style={styles.buttonAlign}>
                  <Pressable onTouchEnd={closeStatusClean}>
                    <Text style={{ color: "#333333" }}>Cancelar</Text>
                  </Pressable>
                  <Pressable onTouchEnd={confirmDeleteStatus}>
                    <Text style={{ color: "red", fontWeight: "bold" }}>
                      Excluir
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>

          <Modal visible={openStatus} transparent={true} animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.formModalBody}>
                <View
                  style={{ flexDirection: "row", gap: 6, marginBottom: 10 }}
                >
                  <Text style={styles.modalTitleHeader}>
                    {isEditingStatus ? "Editando" : "Novo"} Status
                  </Text>
                  <Icon name="settings" size={25} />
                </View>
                <TextInput
                  value={formStatus?.name}
                  onChangeText={(texto) =>
                    setFormStatus((prev) => ({ ...prev, name: texto }))
                  }
                  placeholder="Nome do status"
                  style={styles.inputBox}
                />
                <View style={styles.buttonAlign}>
                  <FancyButton
                    buttonFunc={closeStatusClean}
                    width={85}
                    height={38}
                  >
                    <Text style={{ color: "#000000" }}>Cancelar</Text>
                  </FancyButton>
                  <FancyButton
                    buttonFunc={submitStatus}
                    disabled={!formStatus?.name}
                    bgColor="#1f6f5b"
                    fontColor="#FFFFFF"
                    width={85}
                    height={38}
                  >
                    <Text style={{ textDecorationLine: "underline" }}>
                      {isEditingStatus ? "Atualizar" : "Salvar"}
                    </Text>
                  </FancyButton>
                </View>
              </View>
            </View>
          </Modal>

          <Modal
            visible={deletePlagueModal}
            transparent={true}
            animationType="fade"
          >
            <View style={styles.modalOverlay}>
              <View style={styles.formModalBody}>
                <Text
                  style={{
                    fontSize: 16,
                    textAlign: "center",
                    marginBottom: 20,
                  }}
                >
                  Deseja realmente excluir a praga "
                  {deletePlagueData?.name ?? ""}"?
                </Text>
                <View style={styles.buttonAlign}>
                  <Pressable onTouchEnd={closePlagueClean}>
                    <Text style={{ color: "#333333" }}>Cancelar</Text>
                  </Pressable>
                  <Pressable onTouchEnd={confirmDeletePlague}>
                    <Text style={{ color: "red", fontWeight: "bold" }}>
                      Excluir
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>

          <Modal visible={openPlague} transparent={true} animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.formModalBody}>
                <View
                  style={{ flexDirection: "row", gap: 6, marginBottom: 10 }}
                >
                  <Text style={styles.modalTitleHeader}>
                    {isEditingPlague ? "Editando" : "Nova"} Praga
                  </Text>
                  <Icon name="settings" size={25} />
                </View>
                <TextInput
                  value={formPlague?.name}
                  onChangeText={(texto) =>
                    setFormPlague((prev) => ({ ...prev, name: texto }))
                  }
                  placeholder="Nome da praga"
                  style={styles.inputBox}
                />
                <View style={styles.buttonAlign}>
                  <FancyButton
                    buttonFunc={closePlagueClean}
                    width={85}
                    height={38}
                  >
                    <Text style={{ color: "#000000" }}>Cancelar</Text>
                  </FancyButton>
                  <FancyButton
                    buttonFunc={submitPlague}
                    disabled={!formPlague?.name}
                    bgColor="#1f6f5b"
                    fontColor="#FFFFFF"
                    width={85}
                    height={38}
                  >
                    <Text style={{ textDecorationLine: "underline" }}>
                      {isEditingPlague ? "Atualizar" : "Salvar"}
                    </Text>
                  </FancyButton>
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
            }}
          >
            <View style={{ gap: 8 }}>
              <ExpansionPannel label="Serviço">
                <View style={styles.section}>
                  <DataTable
                    headers={["ID", "Serviço"]}
                    dataList={serviceList}
                    keyColumn="id"
                    actions={serviceActions}
                  />
                </View>
                <View style={{ alignItems: "center", marginBottom: 20 }}>
                  <FancyButton
                    icon="plus"
                    bgColor="#1f6f5b"
                    fontColor="#FFFFFF"
                    width={320}
                    height={50}
                    buttonFunc={() => {
                      setFormService({ name: "" });
                      setIsEditingService(false);
                      setOpenService(true);
                    }}
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
                    actions={statusActions}
                  />
                </View>
                <View style={{ alignItems: "center", marginBottom: 20 }}>
                  <FancyButton
                    icon="plus"
                    bgColor="#1f6f5b"
                    fontColor="#FFFFFF"
                    width={320}
                    height={50}
                    buttonFunc={() => {
                      setFormStatus({ name: "" });
                      setIsEditingStatus(false);
                      setOpenStatus(true);
                    }}
                  >
                    Novo Status
                  </FancyButton>
                </View>
              </ExpansionPannel>

              <ExpansionPannel label="Pragas">
                <View style={styles.section}>
                  <DataTable
                    headers={["ID", "Praga"]}
                    dataList={plagueList}
                    keyColumn="id"
                    actions={plagueActions}
                  />
                </View>
                <View style={{ alignItems: "center", marginBottom: 20 }}>
                  <FancyButton
                    icon="plus"
                    bgColor="#1f6f5b"
                    fontColor="#FFFFFF"
                    width={320}
                    height={50}
                    buttonFunc={() => {
                      setFormPlague({ name: "" });
                      setIsEditingPlague(false);
                      setOpenPlague(true);
                    }}
                  >
                    Nova Praga
                  </FancyButton>
                </View>
              </ExpansionPannel>
            </View>
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
    borderTopWidth: 1,
    borderTopColor: "#CCCCCC",
    paddingTop: 16,
    marginTop: 12,
    paddingHorizontal: "4%",
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
  modalTitleHeader: {
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 20,
    color: "#000000",
  },
  inputBox: {
    height: 45,
    backgroundColor: "#EAEAEA",
    borderColor: "#D1D1D1",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: "#333333",
    fontSize: 14,
  },
  buttonAlign: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
});
