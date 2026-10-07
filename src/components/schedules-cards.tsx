import { Spacing } from "@/constants/theme";
import { parseDate } from "@/helpers/utils";
import { Feather as Icon } from "@react-native-vector-icons/feather/static";
import { addHours, format } from "date-fns";
import { useMemo, useState } from "react";
import { SectionList, StyleSheet, Text, View } from "react-native";
import DivisorBar from "./divisor-bar";
import { FancyButton } from "./ui/fancy-button";
import VerticalDivisor from "./vertical-divisor";

type ISchedulesCards = {
  fullData: IData[];
  cardsPerPage?: number;
  fullCrud?: boolean;
  openDeleteModal?(id: number): void;
  openUpsertModal?(formData: ISchedule): void;
};

interface IAgendaSections {
  data: ISectionData[];
  day: string;
  month: string;
  title: string;
}

interface ISectionData {
  formData: IData;
  from: string;
  name: string;
  to: string;
  status?: string;
  id?: number;
  fullScheduleData?: ISchedule;
}

interface IData {
  index: number;
  name: string;
  scheduleEnd: string;
  scheduleStart: string;
  status?: string;
  id?: number;
  fullScheduleData?: ISchedule;
}

interface ISchedule {
  id: number;
  scheduled_start: string;
  scheduled_end: string;
  completed_at: Date;
  notes: string;
  created_at: string;
  updated_at: string;
  properties: SubStuff;
  plagues: SubStuff;
  service: SubStuff;
  status: SubStuff;
  user: SubStuff;
}

interface SubStuff {
  id: number;
  name: string;
}

export default function SchedulesCards({
  fullData,
  cardsPerPage = 3,
  fullCrud = false,
  openDeleteModal,
  openUpsertModal,
}: ISchedulesCards) {
  const [startIndex, setStartIndex] = useState(0);

  const rangeDataComp = fullData.slice(startIndex, startIndex + cardsPerPage);

  const allSchedules = fullData || [];

  const firstItemIndex = rangeDataComp[0]?.index ?? 0;
  const lastItemIndex = rangeDataComp[rangeDataComp.length - 1]?.index ?? -1;
  const isPrevDisabled = rangeDataComp.length === 0 || firstItemIndex === 0;
  const isNextDisabled =
    allSchedules.length === 0 || lastItemIndex >= allSchedules.length - 1;

  // lidando com botão próximo
  function nextBtn() {
    setStartIndex(startIndex + cardsPerPage);
  }

  // lidando com botão anterior
  function prevBtn() {
    const indexPrev = startIndex - cardsPerPage;

    if (indexPrev < 0) {
      setStartIndex(0);
    } else {
      setStartIndex(indexPrev);
    }
  }

  const agendaSections: IAgendaSections[] = useMemo(() => {
    if (!rangeDataComp || rangeDataComp.length === 0) {
      return [];
    }

    const grouped: Record<string, any[]> = {};

    rangeDataComp.forEach((item) => {
      const formattedDate = parseDate(item.scheduleStart);

      if (!grouped[formattedDate]) {
        grouped[formattedDate] = [];
      }

      grouped[formattedDate].push({
        name: item.name,
        from: format(addHours(item.scheduleStart, 3), "HH:mm"),
        to: format(addHours(item.scheduleEnd, 3), "HH:mm"),
        formData: item,
        status: item.status,
        id: item.id,
        fullScheduleData: item.fullScheduleData,
      });
    });

    const formatedToSections = Object.keys(grouped).map((dateKey) => ({
      title: dateKey,
      day: new Date(dateKey).toLocaleDateString("pt-BR", {
        day: "2-digit",
      }),
      month: new Date(dateKey)
        .toLocaleDateString("pt-BR", {
          month: "long",
        })
        .slice(0, 3),
      data: grouped[dateKey],
    }));
    return formatedToSections;
  }, [rangeDataComp]);

  return (
    <View>
      <View style={styles.fastAccess}>
        <SectionList
          scrollEnabled={false}
          sections={agendaSections}
          keyExtractor={(item, index) => item.name + index}
          renderItem={({ item }) => (
            <View style={styles.infoCard}>
              <View
                style={{
                  padding: 4,
                  borderRadius: 12,
                  marginRight: 8,
                }}
              >
                <Icon name="clock" size={32} color="black"></Icon>
              </View>

              <Text style={styles.cardText}>
                {item.from} - {item.to}
              </Text>
              <VerticalDivisor label="" height={20}></VerticalDivisor>
              <View>
                <Text style={styles.cardText}>{item.name}</Text>
                {fullCrud && (
                  <Text style={styles.cardStatus}>{item.status}</Text>
                )}
              </View>
              {fullCrud && (
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 10,
                    marginLeft: "3%",
                  }}
                >
                  <Icon
                    name="trash"
                    color="red"
                    size={26}
                    onPress={() => {
                      console.log("item.formData.id! --> ", item.formData.id);
                      openDeleteModal!(item.formData.id!);
                    }}
                  />
                  <Icon
                    onPress={() => {
                      console.log(
                        "item.fullScheduleData --> ",
                        item.fullScheduleData,
                      );
                      openUpsertModal!(item.fullScheduleData!);
                    }}
                    name="edit"
                    color="orange"
                    size={26}
                  />
                </View>
              )}
            </View>
          )}
          renderSectionHeader={({ section }) => {
            return (
              <View
                style={{
                  paddingHorizontal: Spacing.three,
                  paddingTop: Spacing.three,
                }}
              >
                <DivisorBar label={section.day + " de " + section.month} />
              </View>
            );
          }}
        />
      </View>
      <View style={styles.pageButtons}>
        <FancyButton
          disabled={isPrevDisabled}
          buttonFunc={() => prevBtn()}
          icon="arrow-left"
          width={70}
        />
        <FancyButton
          disabled={isNextDisabled}
          buttonFunc={() => nextBtn()}
          icon="arrow-right"
          width={70}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fastAccess: {
    gap: 16,
    minHeight: 260,
  },
  infoCard: {
    marginHorizontal: Spacing.four,
    backgroundColor: "#FFFFFF",
    padding: 10,
    gap: 4,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    marginVertical: 6,
    boxShadow: "0px 4px 10px 2px rgba(0, 0, 0, 0.25)",
  },
  cardText: {
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 15,
    color: "#000000",
  },
  cardStatus: {
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 12,
    color: "#000000",
  },
  pageButtons: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
});
