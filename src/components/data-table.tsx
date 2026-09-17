import { isIsoDateString } from "@/helpers/utils";
import { Feather as Icon } from "@react-native-vector-icons/feather/static";
import { format, isDate, parseISO } from "date-fns";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Row, Rows, Table } from "react-native-table-component";

type IDataTable = {
  headers?: string[];
  dataList: any[];
  keyColumn?: string;
  actions?: IAction[];
};

type IAction = {
  name?: string;
  icon?: string;
  iconColor?: string;
  onPress: (row: any) => void;
};

export function DataTable({
  headers,
  dataList,
  keyColumn,
  actions,
}: IDataTable) {
  const baseHeaders = headers?.length
    ? headers
    : dataList.length > 0
      ? Object.keys(dataList[0])
      : [];

  const listHeaders =
    actions && actions.length > 0 ? [...baseHeaders, "Ações"] : baseHeaders;

  const widthArr = Array(listHeaders.length).fill(150);

  const listData = dataList.map((dataListElem) => {
    const rowValues = Object.values(dataListElem).map((value) => {
      if (value === null || value === undefined) return "";
      if (isIsoDateString(value))
        return format(parseISO(value as string), "dd/MM/yyyy HH:mm");
      if (isDate(value)) return format(value as Date, "dd/MM/yyyy HH:mm");
      if (typeof value === "object" && !Array.isArray(value)) {
        return (
          (value as any).name ||
          (value as any).nickname ||
          JSON.stringify(value)
        );
      }
      return value;
    });

    if (actions?.length) {
      rowValues.push(
        <View style={styles.actionsContainer}>
          {actions.map((act, index) => (
            <Pressable
              key={index}
              onPress={() => act.onPress(dataListElem)}
              style={styles.actionButton}
            >
              {act.icon && (
                <Icon
                  name={act.icon as any}
                  size={20}
                  color={act.iconColor || "#333333"}
                />
              )}
              {act.name && (
                <Text
                  style={{
                    color: act.iconColor || "#333333",
                    marginLeft: act.icon ? 4 : 0,
                  }}
                >
                  {act.name}
                </Text>
              )}
            </Pressable>
          ))}
        </View>,
      );
    }

    return rowValues;
  });

  return (
    <View style={styles.container}>
      <ScrollView>
        <ScrollView horizontal bounces={false}>
          <Table borderStyle={{ borderWidth: 1, borderColor: "#E0E5EC" }}>
            <Row
              data={listHeaders}
              widthArr={widthArr}
              style={styles.head}
              textStyle={styles.headText}
            />
            <Rows
              data={listData}
              widthArr={widthArr}
              style={styles.row}
              textStyle={styles.text}
            />
          </Table>
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F7F8FA",
  },
  head: {
    height: 50,
    backgroundColor: "#388cf9",
  },
  headText: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    color: "#FFFFFF",
  },
  row: {
    backgroundColor: "#FFFFFF",
  },
  text: {
    margin: 8,
    fontSize: 14,
    fontWeight: "400",
    textAlign: "center",
    color: "#333333",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    flex: 1,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
});
