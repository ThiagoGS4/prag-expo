import CustomCalendar from "@/components/calendar";
import { getDateStatus, getDotDateColor, parseDate } from "@/helpers/utils";
import { axiosInstance } from "@/services/api";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

interface ISchedule {
  id: number;
  scheduled_start: string;
  scheduled_end: string;
  completed_at: null;
  notes: null;
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
        from: format(item.scheduled_start, "HH:mm"),
        to: format(item.scheduled_end, "HH:mm"),
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

  // functions:

  function openUpsertModal(formData?: ISchedule) {
    setOpenModal(true);
  }

  return (
    <View style={{ flex: 1, paddingTop: "10%" }}>
      <Modal visible={openModal} transparent={true}>
        <View style={styles.container}>
          <Pressable onTouchEnd={() => setOpenModal(false)}>
            <Text style={styles.buttonText}>Fechar</Text>
          </Pressable>
        </View>
      </Modal>
      <CustomCalendar
        agendaSections={agendaSections}
        multiDots={multiDotData}
        openUpsertModal={openUpsertModal}
      ></CustomCalendar>
      <Pressable style={styles.actionButton} onPress={() => openUpsertModal()}>
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
  container: {
    backgroundColor: "rgba(0,0,0,0.3)",
    flex: 1,
    justifyContent: "center",
    padding: 30,
  },
});
