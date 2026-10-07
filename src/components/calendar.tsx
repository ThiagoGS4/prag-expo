import { router } from "expo-router";
import { PropsWithChildren } from "react";
import {
  Calendar,
  CalendarProvider,
  DateData,
  LocaleConfig,
} from "react-native-calendars";

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
  multiDots: IMultiDots;
} & PropsWithChildren;

export default function CustomCalendar({ multiDots }: ICalendarProps) {
  const today = new Date().toISOString().split("T")[0];
  return (
    <CalendarProvider date={today}>
      <Calendar
        markingType="multi-dot"
        markedDates={multiDots}
        onDayPress={(date: DateData) =>
          router.push({
            params: { selectedDate: date.dateString },
            pathname: "/(tabs)/schedules-day-cards",
          })
        }
      />
    </CalendarProvider>
  );
}
