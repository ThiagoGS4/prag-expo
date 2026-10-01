import { View } from "react-native";

type IVerticalDivisor = {
  label: string;
  height: string | number;
};

export default function VerticalDivisor({ label, height }: IVerticalDivisor) {
  return (
    <View
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
    >
      <View
        style={{
          margin: 5,
          width: 2,
          height: height ? (height as any) : "auto",
          backgroundColor: "#9E9E9E",
          borderRadius: 1,
        }}
      ></View>
    </View>
  );
}
