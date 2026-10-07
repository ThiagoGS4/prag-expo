import { DateTimePicker } from "@/components/date-time-picker";
import { DropdownPicker } from "@/components/dropdown-picker";
import SchedulesCards from "@/components/schedules-cards";
import { ThemedView } from "@/components/themed-view";
import { FancyButton } from "@/components/ui/fancy-button";
import { MaxContentWidth, Spacing } from "@/constants/theme";
import { axiosInstance } from "@/services/api";
import { format, parse, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

interface ISchedule {
  id: number;
  scheduled_start: string;
  scheduled_end: string;
  completed_at: Date;
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

export default function schedulesDayCards() {
  const { selectedDate } = useLocalSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [mainForm, setMainForm] = useState<IFormData>();
  const [allDaySchedules, setAllDaySchedules] = useState<IFormData[]>();
  const [openModal, setOpenModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number>();
  const [deleteModal, setDeleteModal] = useState(false);
  const [plagueList, setPlagueList] = useState();
  const [statusList, setStatusList] = useState();
  const [serviceList, setServiceList] = useState();
  const [propertyList, setPropertyList] = useState();

  const dayDataParsed =
    allDaySchedules?.map((item: any, index: number) => {
      return {
        id: item.id,
        index,
        scheduleStart: item.scheduled_start,
        scheduleEnd: item.scheduled_end,
        name: item.properties.name,
        status: item.status.name,
        fullScheduleData: item,
      };
    }) ?? [];

  useFocusEffect(
    useCallback(() => {
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
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      const fetchDashboardData = async () => {
        const isoDateString = `${selectedDate}T00:00:00.000Z`;

        try {
          const resp = await axiosInstance.get(
            `/scheduledDay/${isoDateString}`,
          );
          const dayData = resp.data || [];

          console.log("dayData -> ", dayData);

          setAllDaySchedules(dayData);
        } catch (error) {
          console.error("Erro ao buscar dados do painel:", error);
        }
      };
      fetchDashboardData();
    }, [selectedDate]),
  );

  const date = parse(selectedDate as string, "yyyy-MM-dd", new Date());

  const day = format(date, "dd");

  const month = format(date, "MMM", { locale: ptBR });

  const weekDayFull = format(date, "EEEE", { locale: ptBR });

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

  async function deleteSchedule() {
    if (!deleteId) return;
    try {
      await axiosInstance.delete(`/schedules/${deleteId}`);
      try {
        const isoDateString = `${selectedDate}T00:00:00.000Z`;
        const resp = await axiosInstance.get(`/scheduledDay/${isoDateString}`);
        setAllDaySchedules(resp.data);
        closeClean();
      } catch (error) {
        console.error("Erro ao atualizar lista após deletar:", error);
      }
    } catch (error) {
      console.error("Erro ao deletar agendamento:", error);
    }
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
          const isoDateString = `${selectedDate}T00:00:00.000Z`;
          const resp = await axiosInstance.get(
            `/scheduledDay/${isoDateString}`,
          );
          setAllDaySchedules(resp.data);
          closeClean();
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
          const isoDateString = `${selectedDate}T00:00:00.000Z`;
          const resp = await axiosInstance.get(
            `/scheduledDay/${isoDateString}`,
          );
          setAllDaySchedules(resp.data);
          closeClean();
          setOpenModal(false);
        } catch (error) {
          console.error("Erro ao buscar agendamentos:", error);
        }
      } catch (error) {
        console.error("Erro ao inserir agendamento:", error);
      }
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <Modal visible={deleteModal} transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.formModalBody}>
              <Text
                style={{
                  fontSize: 16,
                  textAlign: "center",
                  marginBottom: 20,
                }}
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
          <View style={styles.modalOverlay}>
            <View style={styles.formModalBody}>
              <DateTimePicker
                placeholder="Dia/Horário de início"
                preSelectedDay={new Date(`${selectedDate}T00:00:00.000Z`)}
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
        <View style={styles.pannel}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              position: "relative",
            }}
          >
            <View
              style={{
                width: 50,
                height: 34,
                position: "absolute",
                left: -28,
              }}
            >
              <FancyButton
                buttonFunc={() => router.push("/(tabs)/schedules")}
                icon="arrow-left"
              />
            </View>
            <Text style={styles.title}>Agendamento</Text>
          </View>
          <Text
            style={styles.subtitle}
          >{`${weekDayFull}, ${day} de ${month}`}</Text>
        </View>

        <SchedulesCards
          fullData={dayDataParsed ?? []}
          cardsPerPage={7}
          fullCrud
          openUpsertModal={openEditModal}
          openDeleteModal={openDeleteModal}
        />
        <View style={{ alignItems: "center" }}>
          <FancyButton
            icon="plus"
            bgColor="#1f6f5b"
            fontColor="#FFFFFF"
            width={320}
            height={50}
            buttonFunc={() => setOpenModal(true)}
          >
            Novo agendamento
          </FancyButton>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
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
  },
  buttonAlign: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 30,
  },
});
