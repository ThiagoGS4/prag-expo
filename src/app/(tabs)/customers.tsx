import { DataTable } from "@/components/data-table";
import { DropdownPicker } from "@/components/dropdown-picker";
import { FancyButton } from "@/components/ui/fancy-button";
import { axiosInstance } from "@/services/api";
import { useEffect, useState } from "react";
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

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

  useEffect(() => {
    const getProperties = async () => {
      try {
        const resp = await axiosInstance.get("/customer");
        setCustomerList(resp.data);
      } catch (error) {
        console.error("Erro ao buscar clientes:", error);
      }
    };
    getProperties();
  }, []);

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
    <View style={{ flex: 1, paddingTop: "10%" }}>
      <Modal visible={deleteModal} transparent={true}>
        <View style={styles.container}>
          <View style={styles.formModalBody}>
            <Text
              style={{ fontSize: 16, textAlign: "center", marginBottom: 20 }}
            >
              Deseja realmente excluir este o cliente "{deleteData?.name ?? ""}
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
      <Modal visible={openModal} transparent={true}>
        <View style={styles.container}>
          <View style={styles.formModalBody}>
            <TextInput
              value={mainForm?.name}
              onChangeText={(texto) =>
                setMainForm((prev) => ({ ...prev, name: texto }))
              }
              placeholder="nome"
              style={styles.inputBox}
            />
            <DropdownPicker
              dataList={optionList as any}
              value={tipoPessoa}
              setValueFather={(value) => {
                setMainForm((prev) => ({ ...prev, cpf: null, cnpj: null }));
                setTipoPessoa(value ?? 1);
              }}
              itemLabel="Selecionar tipo de pessoa"
            ></DropdownPicker>
            {tipoPessoa === 1 && (
              <TextInput
                value={mainForm?.cpf ?? undefined}
                onChangeText={(texto) =>
                  setMainForm((prev) => ({ ...prev, cpf: texto }))
                }
                placeholder="cpf"
                style={styles.inputBox}
              />
            )}
            {tipoPessoa === 2 && (
              <TextInput
                value={mainForm?.cnpj ?? undefined}
                onChangeText={(texto) =>
                  setMainForm((prev) => ({ ...prev, cnpj: texto }))
                }
                placeholder="cnpj"
                style={styles.inputBox}
              />
            )}
            <TextInput
              value={mainForm?.phone}
              onChangeText={(texto) =>
                setMainForm((prev) => ({ ...prev, phone: texto }))
              }
              placeholder="telefone"
              style={styles.inputBox}
            />
            <TextInput
              value={mainForm?.email}
              onChangeText={(texto) =>
                setMainForm((prev) => ({ ...prev, email: texto }))
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
      <View style={styles.buttonContainer}>
        <FancyButton
          bgColor="#1860fa"
          padding={8}
          buttonFunc={() => setOpenModal(true)}
          icon="user"
        >
          <Text style={styles.buttonText}>+ Novo cliente</Text>
        </FancyButton>
      </View>
      <View style={styles.tableStyle}>
        <DataTable
          dataList={customerList ?? []}
          keyColumn="id"
          actions={actions}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inputBox: {
    padding: 7,
    height: 32,
    borderWidth: 1,
    borderRadius: 10,
  },
  actionButton: {
    backgroundColor: "#1860fa",
    borderRadius: 14,
  },
  buttonText: {
    textAlign: "center",
    fontSize: 18,
    color: "#FFFFFF",
  },
  buttonContainer: {
    padding: 20,
    display: "flex",
    alignItems: "flex-end",
  },
  buttonAlign: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 30,
  },
  tableStyle: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#21aa38",
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  container: {
    backgroundColor: "rgba(0,0,0,0.3)",
    flex: 1,
    justifyContent: "center",
    padding: 30,
  },
  formModalBody: {
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    padding: 20,
    margin: "15%",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
});
