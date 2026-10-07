import CustomCalendar from "@/components/calendar";
import { DateTimePicker } from "@/components/date-time-picker";
import { DropdownPicker } from "@/components/dropdown-picker";
import { ThemedView } from "@/components/themed-view";
import { FancyButton } from "@/components/ui/fancy-button";
import { getDotDateColor, parseDate } from "@/helpers/utils";
import { axiosInstance } from "@/services/api";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

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

export default function SchedulesScreen() {
  const [scheduleList, setScheduleList] = useState<ISchedule[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [mainForm, setMainForm] = useState<IFormData>();
  const [plagueList, setPlagueList] = useState();
  const [statusList, setStatusList] = useState();
  const [serviceList, setServiceList] = useState();
  const [propertyList, setPropertyList] = useState();

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
  useFocusEffect(
    useCallback(() => {
      const getSchedules = async () => {
        try {
          const resp = await axiosInstance.get("/schedules");
          setScheduleList(resp.data);
        } catch (error) {
          console.error("Erro ao buscar agendamentos:", error);
        }
      };
      getSchedules();
    }, []),
  );

  const day = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
  });

  const month = new Date()
    .toLocaleDateString("pt-BR", {
      month: "long",
    })
    .slice(0, 3);

  const weekDayFull = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
  }).format(new Date());

  function closeClean() {
    setOpenModal(false);
    setMainForm(undefined);
  }

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

  async function submitForm() {
    try {
      await axiosInstance.post("/inserirSchedules", mainForm);
      try {
        const resp = await axiosInstance.get(`/schedules`);
        setScheduleList(resp.data);
        closeClean();
        setOpenModal(false);
      } catch (error) {
        console.error("Erro ao buscar agendamentos:", error);
      }
    } catch (error) {
      console.error("Erro ao inserir agendamento:", error);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <Modal visible={openModal} transparent={true}>
        <View style={styles.modalOverlay}>
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
      <View style={styles.pannel}>
        <Text style={styles.title}>Agendamento</Text>
        <Text
          style={styles.subtitle}
        >{`${weekDayFull}, ${day} de ${month}`}</Text>
      </View>
      <View style={styles.calendarContainer}>
        <CustomCalendar multiDots={multiDotData} />
      </View>

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
  },
  calendarContainer: {
    minHeight: 350,
    marginHorizontal: "4%",
    backgroundColor: "#ffffff",
    borderColor: "#d9d9d9",
    borderWidth: 1,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
  },
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
    flex: 1,
    backgroundColor: "#F3F6F5",
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
});
