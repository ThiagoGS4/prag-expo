import { useState } from "react";
import { StyleSheet } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

type IDropdownPicker = {
  dataList: {
    id: number | null;
    [key: string]: string | number | null;
  }[];
  itemLabel?: string;
  value?: number;
  setValueFather(value: number | null): void;
};

export function DropdownPicker({
  dataList,
  itemLabel,
  value,
  setValueFather,
}: IDropdownPicker) {
  const [isFocus, setIsFocus] = useState(false);
  const [selectedValue, setSelectedValue] = useState<number | null>(
    value ?? null,
  );

  return (
    <Dropdown
      style={styles.inputBox}
      data={dataList}
      valueField="id"
      labelField={Object.keys(dataList[0])[1]}
      placeholder={
        !isFocus ? (itemLabel ? itemLabel : "Selecione um item") : "..."
      }
      value={selectedValue}
      onFocus={() => setIsFocus(true)}
      onBlur={() => setIsFocus(false)}
      onChange={(item) => {
        setSelectedValue(item.id);
        setValueFather(item.id);
        setIsFocus(false);
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  dropdown: {
    height: 50,
    borderColor: "gray",
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: "white",
  },
  label: {
    fontSize: 12,
    color: "#333",
    marginBottom: 4,
    fontWeight: "bold",
    paddingLeft: 2,
  },
  icon: {
    marginRight: 10,
  },
  inputBox: {
    height: 45,
    backgroundColor: "#EAEAEA",
    borderColor: "#D1D1D1",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: "#333333",
    fontSize: 14,
  },
});
