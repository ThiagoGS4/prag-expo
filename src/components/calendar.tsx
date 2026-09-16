import { Feather as Icon } from "@react-native-vector-icons/feather/static";
import { PropsWithChildren } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  AgendaList,
  CalendarProvider,
  ExpandableCalendar,
  LocaleConfig,
} from "react-native-calendars";
import { Positions } from "react-native-calendars/src/expandableCalendar";

LocaleConfig.locales["pt-br"] = {
  monthNames: [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ],
  monthNamesShort: [
    "Jan.",
    "Fev.",
    "Mar.",
    "Abr.",
    "Mai.",
    "Jun.",
    "Jul.",
    "Ago.",
    "Set.",
    "Out.",
    "Nov.",
    "Dez.",
  ],
  dayNames: [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
  ],
  dayNamesShort: ["Dom.", "Seg.", "Ter.", "Qua.", "Qui.", "Sex.", "Sáb."],
  today: "Hoje",
};
LocaleConfig.defaultLocale = "pt-br";

interface IAgendaSections {
  data: IAgendaSectionDate[];
  title: string;
}

interface IAgendaSectionDate {
  name: string;
}

interface IMultiDots {
  [key: string]: IDayObj;
}

interface IDayObj {
  dots: IDotsItem[];
}

interface IDotsItem {
  color: string;
  key: string;
}

type ICalendarProps = {
  agendaSections: IAgendaSections[];
  multiDots: IMultiDots;
  openUpsertModal(item: any): void;
  openDeleteModal(id: number): void;
} & PropsWithChildren;

export default function CustomCalendar({
  agendaSections,
  multiDots,
  openUpsertModal,
  openDeleteModal,
}: ICalendarProps) {
  const today = new Date().toISOString().split("T")[0];

  return (
    <CalendarProvider date={today}>
      <ExpandableCalendar
        initialPosition={Positions.OPEN}
        markingType="multi-dot"
        markedDates={multiDots}
      />

      <AgendaList
        sections={agendaSections}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.cardFromTo}>
                {item.from} - {item.to}
              </Text>
              <Text style={styles.cardText}>{item.name}</Text>
            </View>
            <View style={{ alignItems: "center", gap: 10 }}>
              <Text
                style={[
                  styles.cardText,
                  { color: item.status.color, textAlign: "center" },
                ]}
              >
                {item.status.value}
              </Text>
              <View style={{ display: "flex", flexDirection: "row", gap: 10 }}>
                <Icon
                  name="trash"
                  color="red"
                  size={30}
                  onPress={() => openDeleteModal(item.formData.id)}
                />
                <Icon
                  onPress={() => openUpsertModal(item.formData)}
                  name="edit"
                  color="orange"
                  size={30}
                />
              </View>
            </View>
          </View>
        )}
        sectionStyle={styles.sectionHeader}
      />
    </CalendarProvider>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 20,
    marginHorizontal: 15,
    marginVertical: 8,
    elevation: 2,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardFromTo: {
    color: "#333",
    fontSize: 25,
    fontWeight: "500",
  },
  cardText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "500",
  },
  sectionHeader: {
    backgroundColor: "#000000",
    color: "gray",
    paddingHorizontal: 15,
    paddingVertical: 10,
    textTransform: "capitalize",
    borderColor: "orange",
    borderStyle: "solid",
    borderWidth: 1,
    borderRadius: 12,
  },
});
