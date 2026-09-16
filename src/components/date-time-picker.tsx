import { timePickerConverter } from "@/helpers/utils";
import RNDateTimePicker, {
  DateTimePickerChangeEvent,
} from "@react-native-community/datetimepicker";
import { Feather as Icon } from "@react-native-vector-icons/feather/static";
import { addHours, lightFormat } from "date-fns";
import { PropsWithChildren, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type IDateTimePicker = {
  placeholder: string;
  value?: Date;
  editing?: boolean;
  previousValue?: Date;
  disabled?: boolean;
  setDateTimeValue: (date: Date | undefined) => void;
} & PropsWithChildren;

export function DateTimePicker({
  placeholder,
  value,
  editing = false,
  previousValue,
  disabled = false,
  setDateTimeValue,
}: IDateTimePicker) {
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [dateReturn, setDateReturn] = useState<Date>();

  function wrapDateTime(newTime: Date, baseDate?: Date) {
    const finalDate = baseDate ? new Date(baseDate) : new Date();
    finalDate.setUTCHours(newTime.getHours(), newTime.getMinutes(), 0, 0);
    return finalDate;
  }

  function handleDismiss() {
    setShowDayPicker(false);
    setShowTimePicker(false);
    if (editing) {
      setDateTimeValue(undefined);
    }
  }

  return (
    <View>
      {showDayPicker && (
        <RNDateTimePicker
          display="calendar"
          design="material"
          mode="date"
          onDismiss={handleDismiss}
          value={value ? addHours(value, 3) : new Date()}
          onValueChange={(date: DateTimePickerChangeEvent) => {
            setDateReturn(timePickerConverter(date));
            setShowDayPicker(false);
            setShowTimePicker(true);
          }}
          positiveButton={{ label: "OK", textColor: "green" }}
          negativeButton={{ label: "Cancelar", textColor: "red" }}
        />
      )}

      {showTimePicker && (
        <RNDateTimePicker
          initialInputMode="keyboard"
          design="material"
          mode="time"
          onDismiss={handleDismiss}
          value={value ? addHours(value, 3) : new Date()}
          onValueChange={(time: DateTimePickerChangeEvent) => {
            const finalDateTime = wrapDateTime(
              timePickerConverter(time),
              previousValue || dateReturn,
            );

            setDateTimeValue(finalDateTime);
            setShowTimePicker(false);
          }}
        />
      )}

      {value && <Text>{placeholder}</Text>}

      <View style={styles.container}>
        <TextInput
          placeholder={placeholder}
          value={
            value ? lightFormat(addHours(value, 3), "dd/MM/yyyy HH:mm") : ""
          }
          editable={false}
          style={styles.inputBox}
        />
        <Pressable
          disabled={disabled}
          onPress={() =>
            previousValue ? setShowTimePicker(true) : setShowDayPicker(true)
          }
          style={disabled ? styles.disabledButton : styles.button}
        >
          <Icon
            name={previousValue || disabled ? "clock" : "calendar"}
            size={20}
            color={disabled ? "#FFFFFF" : "#000000"}
          />
          <Text>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  button: {
    flexDirection: "row",
    backgroundColor: "#388cf9",
    padding: 4,
    borderRadius: 10,
  },
  disabledButton: {
    flexDirection: "row",
    backgroundColor: "#646464",
    padding: 4,
    borderRadius: 10,
  },
  inputBox: {
    padding: 7,
    height: 32,
    borderWidth: 1,
    borderRadius: 10,
  },
});
