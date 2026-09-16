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
      style={[styles.dropdown, isFocus && { borderColor: "blue" }]}
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
    marginBottom: 8,
    fontSize: 14,
  },
  icon: {
    marginRight: 10,
  },
});
