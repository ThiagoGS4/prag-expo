import { Text, View } from "react-native";

type IDivisorBar = {
  label: string;
};

export default function DivisorBar({ label }: IDivisorBar) {
  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
    >
      <View
        style={{
          width: "42%",
          height: 3,
          backgroundColor: "#9E9E9E",
          borderRadius: 1,
        }}
      ></View>
      <Text style={{ color: "#9e9e9e" }}>{label}</Text>
      <View
        style={{
          width: "42%",
          height: 3,
          backgroundColor: "#9E9E9E",
          borderRadius: 1,
        }}
      ></View>
    </View>
  );
}
