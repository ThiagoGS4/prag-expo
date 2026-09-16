import CustomCalendar from "@/components/calendar";
import { DateTimePicker } from "@/components/date-time-picker";
import { DropdownPicker } from "@/components/dropdown-picker";
import { getDateStatus, getDotDateColor, parseDate } from "@/helpers/utils";
import { axiosInstance } from "@/services/api";
import { addHours, format, parseISO } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

interface ISchedule {
  id: number;
  scheduled_start: string;
  scheduled_end: string;
  completed_at: null;
  notes: string;
  created_at: string;
  updated_at: string;
  properties: Properties;
  plagues: Properties;
  service: Properties;
  status: Properties;
  user: Properties;
}

interface Properties {
  id: number;
  name: string;
}

interface IFormData {
  id?: number;
  scheduled_start?: Date;
  scheduled_end?: Date;
  notes?: string;
  properties?: number;
  plagues?: number;
  service?: number;
  status?: number;
  editing?: boolean;
}

export default function SchedulesScreen() {
  const [scheduleList, setScheduleList] = useState<ISchedule[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [mainForm, setMainForm] = useState<IFormData>();
  const [deleteId, setDeleteId] = useState<number>();
  const [deleteModal, setDeleteModal] = useState(false);
  const [plagueList, setPlagueList] = useState();
  const [statusList, setStatusList] = useState();
  const [serviceList, setServiceList] = useState();
  const [propertyList, setPropertyList] = useState();
  const [isEditing, setIsEditing] = useState(false);
  // useMemo
  const agendaSections = useMemo(() => {
    if (!scheduleList || scheduleList.length === 0) return [];

    const grouped: Record<string, any[]> = {};

    scheduleList.forEach((item) => {
      const formattedDate = parseDate(item.scheduled_start);
      if (!grouped[formattedDate]) {
        grouped[formattedDate] = [];
      }
      grouped[formattedDate].push({
        name: item.properties.name,
        from: format(addHours(item.scheduled_start, 3), "HH:mm"),
        to: format(addHours(item.scheduled_end, 3), "HH:mm"),
        status: getDateStatus(item.scheduled_start, item.status.name),
        formData: item,
      });
    });

    const formatedToSections = Object.keys(grouped).map((dateKey) => ({
      title: dateKey,
      data: grouped[dateKey],
    }));

    return formatedToSections;
  }, [scheduleList]);

  const multiDotData = useMemo(() => {
    if (!scheduleList || scheduleList.length === 0) return {};

    const parsedMultiDot = scheduleList.reduce((acc: any, item: ISchedule) => {
      const parsedDate = parseDate(item.scheduled_start);
      if (!acc[parsedDate]) {
        acc[parsedDate] = { dots: [] };
      }
      acc[parsedDate].dots.push({
        key: "",
        color: getDotDateColor(item.scheduled_start, item.status.name),
      });
      return acc;
    }, {});
    return parsedMultiDot;
  }, [scheduleList]);
  // use effect
  useEffect(() => {
    const getSchedules = async () => {
      try {
        const resp = await axiosInstance.get("/schedules");
        setScheduleList(resp.data);
      } catch (error) {
        console.error("Erro ao buscar agendamentos:", error);
      }
    };
    getSchedules();
  }, []);
  useEffect(() => {
    const getPlagues = async () => {
      try {
        const resp = await axiosInstance.get("/plagues");
        setPlagueList(resp.data);
      } catch (error) {
        console.error("Erro ao buscar pragas:", error);
      }
    };
    const getStatuses = async () => {
      try {
        const resp = await axiosInstance.get("/status");
        setStatusList(resp.data);
      } catch (error) {
        console.error("Erro ao buscar statuses:", error);
      }
    };
    const getServices = async () => {
      try {
        const resp = await axiosInstance.get("/services");
        setServiceList(resp.data);
      } catch (error) {
        console.error("Erro ao buscar serviços:", error);
      }
    };
    const getProperties = async () => {
      try {
        const resp = await axiosInstance.get("/properties");
        setPropertyList(
          resp.data.map((item: any) => {
            return {
              id: item.id,
              nickname: item.nickname,
            };
          }),
        );
      } catch (error) {
        console.error("Erro ao buscar propriedades:", error);
      }
    };
    getPlagues();
    getStatuses();
    getServices();
    getProperties();
  }, []);

  // functions:

  function openEditModal(formData?: ISchedule) {
    setIsEditing(true);
    setMainForm({
      id: formData?.id,
      scheduled_start: formData?.scheduled_start
        ? parseISO(formData.scheduled_start)
        : undefined,
      scheduled_end: formData?.scheduled_end
        ? parseISO(formData!.scheduled_end)
        : undefined,
      plagues: formData?.plagues.id,
      properties: formData?.properties.id,
      status: formData?.status.id,
      service: formData?.service.id,
    });
    setOpenModal(true);
  }

  function openDeleteModal(id: number) {
    setDeleteId(id);
    setDeleteModal(true);
  }

  function openInsertModal() {
    setOpenModal(true);
  }

  function closeClean() {
    setIsEditing(false);
    setOpenModal(false);
    setDeleteModal(false);
    setMainForm(undefined);
    setDeleteId(undefined);
  }

  async function submitForm() {
    if (isEditing) {
      try {
        await axiosInstance.put("/alterarSchedules", mainForm);
        try {
          const resp = await axiosInstance.get("/schedules");
          setScheduleList(resp.data);
          setOpenModal(false);
        } catch (error) {
          console.error("Erro ao buscar agendamentos:", error);
        }
      } catch (error) {
        console.error("Erro ao editar agendamento:", error);
      }
    } else {
      try {
        await axiosInstance.post("/inserirSchedules", mainForm);
        try {
          const resp = await axiosInstance.get("/schedules");
          setScheduleList(resp.data);
          setOpenModal(false);
        } catch (error) {
          console.error("Erro ao buscar agendamentos:", error);
        }
      } catch (error) {
        console.error("Erro ao inserir agendamento:", error);
      }
    }
  }

  async function deleteSchedule() {
    if (!deleteId) return;
    try {
      await axiosInstance.delete(`/schedules/${deleteId}`);
      try {
        const resp = await axiosInstance.get("/schedules");
        setScheduleList(resp.data);
        closeClean();
      } catch (error) {
        console.error("Erro ao atualizar lista após deletar:", error);
      }
    } catch (error) {
      console.error("Erro ao deletar agendamento:", error);
    }
  }

  return (
    <View style={{ flex: 1, paddingTop: "10%" }}>
      <Modal visible={deleteModal} transparent={true}>
        <View style={styles.container}>
          <View style={styles.formModalBody}>
            <Text
              style={{ fontSize: 16, textAlign: "center", marginBottom: 20 }}
            >
              Deseja realmente excluir este agendamento?
            </Text>
            <View style={styles.buttonAlign}>
              <Pressable onTouchEnd={() => closeClean()}>
                <Text style={{ color: "#000000" }}>Cancelar</Text>
              </Pressable>
              <Pressable onTouchEnd={() => deleteSchedule()}>
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
            <DateTimePicker
              placeholder="Dia/Horário de início"
              value={mainForm?.scheduled_start}
              setDateTimeValue={(value) => {
                setMainForm((prev) => ({
                  ...prev,
                  scheduled_start: value,
                }));
              }}
            ></DateTimePicker>
            <DateTimePicker
              placeholder="Horário de fim"
              value={mainForm?.scheduled_end}
              setDateTimeValue={(value) => {
                setMainForm((prev) => ({
                  ...prev,
                  scheduled_end: value,
                }));
              }}
              previousValue={mainForm?.scheduled_start}
              disabled={!mainForm?.scheduled_start}
            ></DateTimePicker>

            <DropdownPicker
              dataList={plagueList as any}
              value={mainForm?.plagues}
              setValueFather={(value) =>
                setMainForm((prev) => ({
                  ...prev,
                  plagues: value ?? undefined,
                }))
              }
              itemLabel="Selecionar praga"
            ></DropdownPicker>

            <DropdownPicker
              dataList={propertyList as any}
              value={mainForm?.properties}
              setValueFather={(value) =>
                setMainForm((prev) => ({
                  ...prev,
                  properties: value ?? undefined,
                }))
              }
              itemLabel="Selecionar propriedade"
            ></DropdownPicker>

            <DropdownPicker
              dataList={statusList as any}
              value={mainForm?.status}
              setValueFather={(value) =>
                setMainForm((prev) => ({
                  ...prev,
                  status: value ?? undefined,
                }))
              }
              itemLabel="Selecionar status"
            ></DropdownPicker>

            <DropdownPicker
              dataList={serviceList as any}
              value={mainForm?.service}
              setValueFather={(value) =>
                setMainForm((prev) => ({
                  ...prev,
                  service: value ?? undefined,
                }))
              }
              itemLabel="Selecionar serviço"
            ></DropdownPicker>

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
      <CustomCalendar
        agendaSections={agendaSections}
        multiDots={multiDotData}
        openUpsertModal={openEditModal}
        openDeleteModal={openDeleteModal}
      ></CustomCalendar>
      <Pressable style={styles.actionButton} onPress={() => openInsertModal()}>
        <Text style={styles.buttonText}>+ Novo agendamento</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    padding: 10,
    backgroundColor: "#1860fa",
  },
  buttonText: {
    textAlign: "center",
    fontSize: 18,
    color: "#FFFFFF",
  },
  buttonAlign: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 30,
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
  inputBox: {
    padding: 7,
    height: 32,
    borderWidth: 1,
    borderRadius: 10,
  },
});
