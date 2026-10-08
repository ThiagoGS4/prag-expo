import { DataTable } from "@/components/data-table";
import { DropdownPicker } from "@/components/dropdown-picker";
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
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ICustomer {
  id: number;
  name: string;
  cpf: null | string;
  cnpj: null | string;
  phone: string;
  email: string;
  created_at: string;
}

interface IFormData {
  id?: number;
  name?: string;
  cpf?: string | null;
  cnpj?: string | null;
  phone?: string;
  email?: string;
}

export default function CustomersScreen() {
  const [customerList, setCustomerList] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteData, setDeleteData] = useState<{ id: number; name: string }>();
  const [mainForm, setMainForm] = useState<IFormData>();
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [tipoPessoa, setTipoPessoa] = useState<number>(1);

  const optionList = [
    {
      id: 1,
      name: "Pessoa Física",
    },
    {
      id: 2,
      name: "Pessoa Jurídica",
    },
  ];

  useFocusEffect(
    useCallback(() => {
      const getProperties = async () => {
        try {
          const resp = await axiosInstance.get("/customer");
          setCustomerList(resp.data);
        } catch (error) {
          console.error("Erro ao buscar clientes:", error);
        }
      };
      getProperties();
    }, []),
  );

  function openEditModal(formData?: ICustomer) {
    setIsEditing(true);
    setMainForm({
      id: formData?.id,
      name: formData?.name,
      cpf: formData?.cpf ?? null,
      cnpj: formData?.cnpj ?? null,
      phone: formData?.phone,
      email: formData?.email,
    });
    setOpenModal(true);
  }

  function openDeleteModal(id: number, name: string) {
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
    if (isEditing) {
      try {
        await axiosInstance.put("/alterarCustomer", mainForm);
        try {
          const resp = await axiosInstance.get("/customer");
          setCustomerList(resp.data);
          closeClean();
          setOpenModal(false);
        } catch (error) {
          console.error("Erro ao buscar clientes:", error);
        }
      } catch (error) {
        console.error("Erro ao editar clientes:", error);
      }
    } else {
      try {
        await axiosInstance.post("/inserirCustomer", mainForm);
        try {
          const resp = await axiosInstance.get("/customer");
          setCustomerList(resp.data);
          closeClean();
          setOpenModal(false);
        } catch (error) {
          console.error("Erro ao buscar clientes:", error);
        }
      } catch (error) {
        console.error("Erro ao inserir clientes:", error);
      }
    }
  }

  async function deleteCliente() {
    if (!deleteData) return;
    try {
      await axiosInstance.delete(`/customer/${deleteData.id}`);
      try {
        const resp = await axiosInstance.get("/customer");
        setCustomerList(resp.data);
        closeClean();
      } catch (error) {
        console.error("Erro ao atualizar lista após deletar:", error);
      }
    } catch (error) {
      console.error("Erro ao deletar cliente:", error);
    }
  }

  const actions = [
    {
      icon: "edit",
      iconColor: "#388cf9",
      onPress: (linhaClicada: ICustomer) => openEditModal(linhaClicada),
    },
    {
      icon: "trash-2",
      iconColor: "red",
      onPress: (linhaClicada: ICustomer) =>
        openDeleteModal(linhaClicada.id, linhaClicada.name),
    },
  ];

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
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
                Deseja realmente excluir este o cliente "
                {deleteData?.name ?? ""}
                "?
              </Text>
              <View style={styles.buttonAlign}>
                <Pressable onTouchEnd={() => closeClean()}>
                  <Text style={{ color: "#000000" }}>Cancelar</Text>
                </Pressable>
                <Pressable onTouchEnd={() => deleteCliente()}>
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
              <TextInput
                value={mainForm?.name}
                onChangeText={(texto) =>
                  setMainForm((prev) => ({
                    ...prev,
                    name: texto,
                  }))
                }
                placeholder="nome"
                style={styles.inputBox}
              />
              <DropdownPicker
                dataList={optionList as any}
                value={tipoPessoa}
                setValueFather={(value) => {
                  setMainForm((prev) => ({
                    ...prev,
                    cpf: null,
                    cnpj: null,
                  }));
                  setTipoPessoa(value ?? 1);
                }}
                itemLabel="Selecionar tipo de pessoa"
              ></DropdownPicker>
              {tipoPessoa === 1 && (
                <TextInput
                  value={mainForm?.cpf ?? undefined}
                  onChangeText={(texto) =>
                    setMainForm((prev) => ({
                      ...prev,
                      cpf: texto,
                    }))
                  }
                  placeholder="cpf"
                  style={styles.inputBox}
                />
              )}
              {tipoPessoa === 2 && (
                <TextInput
                  value={mainForm?.cnpj ?? undefined}
                  onChangeText={(texto) =>
                    setMainForm((prev) => ({
                      ...prev,
                      cnpj: texto,
                    }))
                  }
                  placeholder="cnpj"
                  style={styles.inputBox}
                />
              )}
              <TextInput
                value={mainForm?.phone}
                onChangeText={(texto) =>
                  setMainForm((prev) => ({
                    ...prev,
                    phone: texto,
                  }))
                }
                placeholder="telefone"
                style={styles.inputBox}
              />
              <TextInput
                value={mainForm?.email}
                onChangeText={(texto) =>
                  setMainForm((prev) => ({
                    ...prev,
                    email: texto,
                  }))
                }
                placeholder="e-mail"
                style={styles.inputBox}
              />

              <View style={styles.buttonAlign}>
                <Pressable onTouchEnd={() => closeClean()}>
                  <Text style={{ color: "#000000" }}>Fechar</Text>
                </Pressable>

                <Pressable onTouchEnd={() => submitForm()}>
                  <Text style={{ color: "#000000" }}>Enviar</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        <View style={styles.pannel}>
          <Text style={styles.title}>Clientes</Text>
          <Text style={styles.subtitle}>{getFullWrittenDay()}</Text>
        </View>

        <DataTable
          dataList={customerList ?? []}
          keyColumn="id"
          actions={actions}
        />

        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <FancyButton
            icon="plus"
            bgColor="#1f6f5b"
            fontColor="#FFFFFF"
            width={320}
            height={50}
            buttonFunc={() => setOpenModal(true)}
          >
            Novo cliente
          </FancyButton>
        </View>
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
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  formModalBody: {
    width: "90%",
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
  inputBox: {
    padding: 7,
    height: 32,
    borderWidth: 1,
    borderRadius: 10,
  },
  buttonAlign: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 30,
    marginTop: 10,
  },
});
