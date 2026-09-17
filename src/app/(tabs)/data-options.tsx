import { handleLogout } from "@/components/app-tabs";
import { DataTable } from "@/components/data-table";
import { FancyButton } from "@/components/ui/fancy-button";
import { axiosInstance } from "@/services/api";
import { useEffect, useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

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

  useEffect(() => {
    loadData();
  }, []);

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
    <View style={{ flex: 1, backgroundColor: "#F7F8FA" }}>
      <Modal visible={deleteModal} transparent={true} animationType="fade">
        <View style={styles.container}>
          <View style={styles.formModalBody}>
            <Text
              style={{ fontSize: 16, textAlign: "center", marginBottom: 20 }}
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
        <View style={styles.container}>
          <View style={styles.formModalBody}>
            <Text style={styles.modalTitle}>
              {isEditing ? "Editar" : "Novo"} {endpoints[activeEntity].label}
            </Text>
            <TextInput
              value={mainForm?.name}
              onChangeText={(texto) =>
                setMainForm((prev) => ({ ...prev, name: texto }))
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
                <Text style={{ color: "#43a047", fontWeight: "bold" }}>
                  {isEditing ? "Atualizar" : "Salvar"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 40,
          paddingTop: "15%",
        }}
      >
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Opções do Sistema</Text>
          <FancyButton
            bgColor="#e53935"
            padding={8}
            buttonFunc={handleLogout}
            icon="log-out"
          >
            <Text style={styles.buttonText}>Sair da conta</Text>
          </FancyButton>
        </View>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FancyButton
              bgColor="#43a047"
              padding={8}
              buttonFunc={() => openCreateModal("service")}
              icon="plus"
            >
              <Text style={styles.buttonText}>Novo Serviço</Text>
            </FancyButton>
          </View>
          <View style={styles.tableWrapper}>
            <DataTable
              headers={["ID", "Serviço"]}
              dataList={serviceList}
              keyColumn="id"
              actions={getActions("service")}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FancyButton
              bgColor="#43a047"
              padding={8}
              buttonFunc={() => openCreateModal("status")}
              icon="plus"
            >
              <Text style={styles.buttonText}>Novo Status</Text>
            </FancyButton>
          </View>
          <View style={styles.tableWrapper}>
            <DataTable
              headers={["ID", "Status"]}
              dataList={statusList}
              keyColumn="id"
              actions={getActions("status")}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FancyButton
              bgColor="#43a047"
              padding={8}
              buttonFunc={() => openCreateModal("plague")}
              icon="plus"
            >
              <Text style={styles.buttonText}>Nova Praga</Text>
            </FancyButton>
          </View>
          <View style={styles.tableWrapper}>
            <DataTable
              headers={["ID", "Praga"]}
              dataList={plagueList}
              keyColumn="id"
              actions={getActions("plague")}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 12,
  },
  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: "#CCCCCC",
    paddingBottom: 16,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333333",
  },
  tableWrapper: {
    minHeight: 200,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#43a047",
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  buttonText: {
    textAlign: "center",
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginLeft: 4,
  },
  container: {
    backgroundColor: "rgba(0,0,0,0.4)",
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  formModalBody: {
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 16,
    elevation: 5,
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
