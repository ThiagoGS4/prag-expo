import { Feather as Icon } from "@react-native-vector-icons/feather/static";
import { PropsWithChildren, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";

type IDivisorBar = {
  label: string;
} & PropsWithChildren;

export default function ExpansionPannel({ label, children }: IDivisorBar) {
  const [toggleHeight, setToggleHeight] = useState(false);

  return (
    <View style={{ gap: 10 }}>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: 6,
        }}
      >
        <View
          style={{
            width: "38%",
            height: 3,
            backgroundColor: "#9E9E9E",
            borderRadius: 1,
          }}
        ></View>
        <View style={{ minWidth: "16%" }}>
          <Text style={{ color: "#9e9e9e", textAlign: "center" }}>{label}</Text>
        </View>
        <View
          style={{
            width: "30%",
            height: 3,
            backgroundColor: "#9E9E9E",
            borderRadius: 1,
          }}
        ></View>
        <Pressable
          onPress={() => setToggleHeight(!toggleHeight)}
          style={{
            padding: 6,
            backgroundColor: "#ffffff",
            borderRadius: 20,
            borderWidth: 1,
          }}
        >
          <Icon
            name={toggleHeight ? "arrow-up" : "arrow-down"}
            color={"#000000"}
            size={18}
          />
        </Pressable>
      </View>
      {toggleHeight && (
        <Animated.View
          entering={FadeInUp.duration(200)}
          exiting={FadeOutUp.duration(200)}
        >
          {children}
        </Animated.View>
      )}
    </View>
  );
}
