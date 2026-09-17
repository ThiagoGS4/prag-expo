import { DataTable } from "@/components/data-table";
import { DropdownPicker } from "@/components/dropdown-picker";
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

interface ICustomer {
  id: number;
  name: string;
}

interface IProperty {
  id: number;
  nickname: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
  country: string;
  formatted_address: string;
  google_place_id: string;
  latitude: number;
  longitude: number;
  property_type: string;
  is_active: number;
  created_at: string;
  customer: ICustomer;
}

interface IFormData {
  id?: number;
  nickname?: string;
  customer?: number;
  cep?: string;
  street?: string;
  number?: string;
  complement?: string;
  district?: string;
  city?: string;
  state?: string;
  country?: string;
  google_place_id?: string;
  latitude?: number;
  longitude?: number;
  property_type?: string;
  is_active?: number;
  formatted_address?: string;
}

export default function PropertiesScreen() {
  const [propertyList, setPropertyList] = useState<IProperty[]>([]);
  const [customerList, setCustomerList] = useState<ICustomer[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteData, setDeleteData] = useState<{ id: number; name: string }>();
  const [mainForm, setMainForm] = useState<IFormData>();
  const [deleteModal, setDeleteModal] = useState<boolean>(false);

  const propertyTypes = [
    { id: "PUBLICO", name: "Público" },
    { id: "PRIVADO", name: "Privado" },
  ];

  const activeOptions = [
    { id: 1, name: "Ativo" },
    { id: 0, name: "Inativo" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propResp, custResp] = await Promise.all([
          axiosInstance.get("/properties"),
          axiosInstance.get("/customer"),
        ]);
        setPropertyList(propResp.data);
        setCustomerList(custResp.data);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };
    fetchData();
  }, []);

  function openEditModal(formData?: IProperty) {
    setIsEditing(true);
    setMainForm({
      id: formData?.id,
      nickname: formData?.nickname,
      customer: formData?.customer?.id,
      cep: formData?.cep,
      street: formData?.street,
      number: formData?.number,
      complement: formData?.complement,
      district: formData?.district,
      city: formData?.city,
      state: formData?.state,
      country: formData?.country,
      google_place_id: formData?.google_place_id,
      latitude: formData?.latitude,
      longitude: formData?.longitude,
      property_type: formData?.property_type,
      is_active: formData?.is_active,
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
    const complementStr = mainForm?.complement
      ? ` - ${mainForm.complement}`
      : "";
    const generatedAddress = `${mainForm?.street ?? ""}, ${mainForm?.number ?? ""}${complementStr} - ${mainForm?.district ?? ""}, ${mainForm?.city ?? ""} - ${mainForm?.state ?? ""}, ${mainForm?.country ?? ""}`;

    const payload = {
      ...mainForm,
      formatted_address: generatedAddress,
    };

    if (isEditing) {
      try {
        await axiosInstance.put("/alterarProperties", payload);
        try {
          const resp = await axiosInstance.get("/properties");
          setPropertyList(resp.data);
          setOpenModal(false);
        } catch (error) {
          console.error("Erro ao buscar propriedades:", error);
        }
      } catch (error) {
        console.error("Erro ao editar propriedade:", error);
      }
    } else {
      try {
        await axiosInstance.post("/inserirProperties", payload);
        try {
          const resp = await axiosInstance.get("/properties");
          setPropertyList(resp.data);
          setOpenModal(false);
        } catch (error) {
          console.error("Erro ao buscar propriedades:", error);
        }
      } catch (error) {
        console.error("Erro ao inserir propriedade:", error);
      }
    }
  }

  async function deleteProperty() {
    if (!deleteData) return;
    try {
      await axiosInstance.delete(`/properties/${deleteData.id}`);
      try {
        const resp = await axiosInstance.get("/properties");
        setPropertyList(resp.data);
        closeClean();
      } catch (error) {
        console.error("Erro ao atualizar lista após deletar:", error);
      }
    } catch (error) {
      console.error("Erro ao deletar propriedade:", error);
    }
  }

  const actions = [
    {
      icon: "edit",
      iconColor: "#388cf9",
      onPress: (linhaClicada: IProperty) => openEditModal(linhaClicada),
    },
    {
      icon: "trash-2",
      iconColor: "red",
      onPress: (linhaClicada: IProperty) =>
        openDeleteModal(linhaClicada.id, linhaClicada.nickname),
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
              Deseja realmente excluir a propriedade "{deleteData?.name ?? ""}"?
            </Text>
            <View style={styles.buttonAlign}>
              <Pressable onTouchEnd={() => closeClean()}>
                <Text style={{ color: "#000000" }}>Cancelar</Text>
              </Pressable>
              <Pressable onTouchEnd={() => deleteProperty()}>
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
            <ScrollView contentContainerStyle={{ gap: 10 }}>
              <TextInput
                value={mainForm?.nickname}
                onChangeText={(texto) =>
                  setMainForm((prev) => ({ ...prev, nickname: texto }))
                }
                placeholder="Apelido da Propriedade (ex: Casa do João 2)"
                style={styles.inputBox}
              />

              <DropdownPicker
                dataList={customerList as any}
                value={mainForm?.customer}
                setValueFather={(value) =>
                  setMainForm((prev) => ({
                    ...prev,
                    customer: value ?? undefined,
                  }))
                }
                itemLabel="Selecionar Cliente"
              />

              <DropdownPicker
                dataList={propertyTypes as any}
                value={mainForm?.property_type as any}
                setValueFather={(value) =>
                  setMainForm((prev) => ({
                    ...prev,
                    property_type: value as any,
                  }))
                }
                itemLabel="Tipo de Propriedade"
              />

              <DropdownPicker
                dataList={activeOptions as any}
                value={mainForm?.is_active}
                setValueFather={(value) =>
                  setMainForm((prev) => ({ ...prev, is_active: value ?? 1 }))
                }
                itemLabel="Status"
              />

              <TextInput
                value={mainForm?.cep}
                onChangeText={(texto) =>
                  setMainForm((prev) => ({ ...prev, cep: texto }))
                }
                placeholder="CEP"
                style={styles.inputBox}
                keyboardType="numeric"
              />

              <TextInput
                value={mainForm?.street}
                onChangeText={(texto) =>
                  setMainForm((prev) => ({ ...prev, street: texto }))
                }
                placeholder="Rua"
                style={styles.inputBox}
              />

              <TextInput
                value={mainForm?.number}
                onChangeText={(texto) =>
                  setMainForm((prev) => ({ ...prev, number: texto }))
                }
                placeholder="Número"
                style={styles.inputBox}
                keyboardType="numeric"
              />

              <TextInput
                value={mainForm?.complement}
                onChangeText={(texto) =>
                  setMainForm((prev) => ({ ...prev, complement: texto }))
                }
                placeholder="Complemento"
                style={styles.inputBox}
              />

              <TextInput
                value={mainForm?.district}
                onChangeText={(texto) =>
                  setMainForm((prev) => ({ ...prev, district: texto }))
                }
                placeholder="Bairro"
                style={styles.inputBox}
              />

              <TextInput
                value={mainForm?.city}
                onChangeText={(texto) =>
                  setMainForm((prev) => ({ ...prev, city: texto }))
                }
                placeholder="Cidade"
                style={styles.inputBox}
              />

              <TextInput
                value={mainForm?.state}
                onChangeText={(texto) =>
                  setMainForm((prev) => ({ ...prev, state: texto }))
                }
                placeholder="Estado (UF)"
                style={styles.inputBox}
              />

              <TextInput
                value={mainForm?.country}
                onChangeText={(texto) =>
                  setMainForm((prev) => ({ ...prev, country: texto }))
                }
                placeholder="País"
                style={styles.inputBox}
              />
            </ScrollView>

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
          icon="home"
        >
          <Text style={styles.buttonText}>+ Nova propriedade</Text>
        </FancyButton>
      </View>
      <View style={styles.tableStyle}>
        <DataTable
          dataList={propertyList ?? []}
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
    marginTop: 10,
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
    marginVertical: "15%",
    display: "flex",
    flexDirection: "column",
    maxHeight: "80%",
  },
});
