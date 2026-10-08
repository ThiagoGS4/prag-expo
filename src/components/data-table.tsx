import { Spacing } from "@/constants/theme";
import { isIsoDateString } from "@/helpers/utils";
import { Feather as Icon } from "@react-native-vector-icons/feather/static";
import { format, isDate, parseISO } from "date-fns";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { Row, Rows, Table } from "react-native-table-component";
import { FancyButton } from "./ui/fancy-button";

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
  const [jsonModal, setJsonModal] = useState(false);
  const [jsonView, setJsonView] = useState("");
  const [startIndex, setStartIndex] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const dataLenRef = useRef(dataList.length);
  useEffect(() => {
    dataLenRef.current = dataList.length;
  }, [dataList.length]);

  useFocusEffect(
    useCallback(() => {
      setStartIndex(0);

      const len = dataLenRef.current;
      setRowsPerPage(len > 0 && len < 5 ? len : 5);
    }, []),
  );

  useEffect(() => {
    if (dataList.length > 0) {
      setRowsPerPage((atual) => {
        if (dataList.length < 5) return dataList.length;
        if (atual > dataList.length) return dataList.length;
        if (atual === 0) return 5;
        return atual;
      });
    }
  }, [dataList.length]);

  // mapeando index
  const rangeDataComp = dataList
    .map((item, index) => ({
      ...item,
      index,
    }))
    .slice(startIndex, startIndex + rowsPerPage);

  const baseHeaders = headers?.length
    ? headers
    : dataList.length > 0
      ? Object.keys(dataList[0])
      : [];

  const listHeaders =
    actions && actions.length > 0 ? [...baseHeaders, "Ações"] : baseHeaders;

  const widthArr = Array(listHeaders.length).fill(150);
  const isJsonString = (value: any) => {
    if (typeof value !== "string") return false;
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object";
    } catch {
      return false;
    }
  };

  const openJsonViewer = (content: string) => {
    setJsonView(content);
    setJsonModal(true);
  };
  const listData = rangeDataComp.map((rangeDataCompElem) => {
    const { index, ...dadosReais } = rangeDataCompElem;

    const rowValues = Object.values(dadosReais).map((value) => {
      if (value === null || value === undefined) return "";
      if (isIsoDateString(value))
        return format(parseISO(value as string), "dd/MM/yyyy HH:mm");
      if (isDate(value)) return format(value as Date, "dd/MM/yyyy HH:mm");
      if (isJsonString(value)) {
        return (
          <Pressable
            onPress={() =>
              openJsonViewer(
                JSON.stringify(JSON.parse(value as string), null, 2),
              )
            }
          >
            <Text style={styles.jsonLink}>ver conteúdo</Text>
          </Pressable>
        );
      }
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
          {actions.map((act, indexAction) => (
            <Pressable
              key={indexAction}
              onPress={() => act.onPress(rangeDataCompElem)}
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
  // paginação da tabela

  const allSchedules = dataList || [];

  const firstItemIndex = rangeDataComp[0]?.index ?? 0;
  const lastItemIndex = rangeDataComp[rangeDataComp.length - 1]?.index ?? -1;
  const isPrevDisabled = rangeDataComp.length === 0 || firstItemIndex === 0;
  const isNextDisabled =
    allSchedules.length === 0 || lastItemIndex >= allSchedules.length - 1;

  // lidando com botão próximo
  function nextBtn() {
    setStartIndex(startIndex + rowsPerPage);
  }

  // lidando com botão anterior
  function prevBtn() {
    const indexPrev = startIndex - rowsPerPage;

    if (indexPrev < 0) {
      setStartIndex(0);
    } else {
      setStartIndex(indexPrev);
    }
  }

  return (
    <View style={styles.container}>
      <Modal visible={jsonModal} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView style={styles.jsonScrollView}>
              <Text style={styles.jsonText}>{jsonView}</Text>
            </ScrollView>
            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setJsonModal(false)}
                style={styles.closeButton}
              >
                <Icon name="x" size={18} color="#666666" />
                <Text style={styles.closeButtonText}>Fechar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      <ScrollView>
        <ScrollView horizontal bounces={false}>
          <View>
            <Table borderStyle={{ borderWidth: 0 }}>
              <Row
                data={listHeaders}
                widthArr={widthArr}
                style={styles.head}
                textStyle={styles.headText}
              />
            </Table>
            <Table borderStyle={{ borderWidth: 1, borderColor: "#000000" }}>
              <Rows
                data={listData}
                widthArr={widthArr}
                style={styles.row}
                textStyle={styles.text}
              />
            </Table>
          </View>
        </ScrollView>
      </ScrollView>
      <View style={styles.pageButtons}>
        <FancyButton
          disabled={isPrevDisabled}
          buttonFunc={() => prevBtn()}
          icon="arrow-left"
          width={70}
        />

        <View style={styles.paginationCenter}>
          <Dropdown
            style={styles.dropdownStyle}
            data={Array.from({ length: dataList.length }, (_, index) => ({
              index: (index + 1).toString(),
              value: index + 1,
            }))}
            labelField={"index"}
            valueField={"value"}
            placeholder="ex. 15"
            placeholderStyle={{ color: "#858585" }}
            autoScroll={false}
            value={rowsPerPage}
            onChange={(item) => setRowsPerPage(item.value)}
            search={true}
            searchField="index"
            renderLeftIcon={() => (
              <Icon
                name="chevron-down"
                size={20}
                color="black"
                style={{ marginRight: 8 }}
              />
            )}
            renderRightIcon={() => null}
          />

          <Text style={styles.paginationText}>-</Text>
          <Text style={styles.paginationText}>
            {`${Math.ceil((startIndex + 1 - rowsPerPage) / rowsPerPage) + 1} de ${Math.ceil(dataList.length / rowsPerPage)}`}
          </Text>
        </View>

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
  pageButtons: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    alignItems: "center",
  },
  paginationCenter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  dropdownStyle: {
    width: 74,
    height: 35,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  paginationText: {
    fontSize: 14,
    color: "#858585",
    fontWeight: "500",
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F7F8FA",
  },
  head: {
    height: 50,
    backgroundColor: "#E5E5E5",
    borderWidth: 1,
    borderColor: "#000000",
    borderBottomWidth: 0,
  },
  headText: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    color: "#000000",
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
  jsonLink: {
    margin: 8,
    fontSize: 14,
    textAlign: "center",
    color: "#429ec9",
    textDecorationLine: "underline",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    maxHeight: "80%",
    overflow: "hidden",
    elevation: 8,
  },
  jsonScrollView: {
    padding: 16,
  },
  jsonText: {
    fontFamily: "monospace",
    fontSize: 12,
    color: "#333333",
  },
  modalActions: {
    padding: 12,
    borderTopWidth: 1,
    borderColor: "#EEEEEE",
    alignItems: "flex-end",
  },
  closeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CCCCCC",
  },
  closeButtonText: {
    color: "#666666",
    marginLeft: 6,
    fontWeight: "500",
  },
});
