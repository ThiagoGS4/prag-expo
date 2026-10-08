import RNDateTimePicker from "@react-native-community/datetimepicker";
import { Feather as Icon } from "@react-native-vector-icons/feather/static";
import { addHours, lightFormat } from "date-fns";
import { PropsWithChildren, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type IDateTimePicker = {
  placeholder: string;
  value?: Date;
  editing?: boolean;
  preSelectedDay?: Date;
  previousValue?: Date;
  disabled?: boolean;
  setDateTimeValue: (date: Date | undefined) => void;
} & PropsWithChildren;

export function DateTimePicker({
  placeholder,
  value,
  editing = false,
  preSelectedDay,
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

  const initialDate = value
    ? addHours(value, 3)
    : preSelectedDay
      ? preSelectedDay
      : new Date();

  return (
    <View>
      {showDayPicker && (
        <RNDateTimePicker
          display="calendar"
          design="material"
          mode="date"
          onDismiss={handleDismiss}
          value={initialDate}
          onValueChange={(_, date) => {
            if (date) {
              setDateReturn(date);
              setShowDayPicker(false);
              setShowTimePicker(true);
            }
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
          value={initialDate}
          onValueChange={(_, time) => {
            if (time) {
              const baseDate =
                previousValue || dateReturn || value || preSelectedDay;

              const finalDateTime = wrapDateTime(time, baseDate);
              setDateTimeValue(finalDateTime);
            }
            setShowTimePicker(false);
          }}
        />
      )}

      {value && <Text style={styles.label}>{placeholder}</Text>}

      <View style={styles.container}>
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#888888"
          value={
            value ? lightFormat(addHours(value, 3), "dd/MM/yyyy HH:mm") : ""
          }
          editable={false}
          style={styles.inputBox}
        />
        <Pressable
          disabled={disabled}
          onPress={() => {
            if (previousValue || preSelectedDay) {
              setShowTimePicker(true);
            } else {
              setShowDayPicker(true);
            }
          }}
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
    width: "100%",
  },
  label: {
    fontSize: 12,
    color: "#333",
    marginBottom: 4,
    fontWeight: "bold",
    paddingLeft: 2,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1f6f5b",
    height: 45,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  disabledButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#646464",
    height: 45,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  inputBox: {
    flex: 1,
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
