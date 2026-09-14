import { Feather as Icon } from "@react-native-vector-icons/feather/static";
import { PropsWithChildren } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

type IFancyButton = {
  icon?: string;
  bgColor?: string;
  fontColor?: string;
  buttonFunc(): void;
} & PropsWithChildren;

export function FancyButton({
  icon,
  bgColor,
  fontColor,
  buttonFunc,
  children,
}: IFancyButton) {
  const styles = StyleSheet.create({
    button: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      borderRadius: 10,
      borderStyle: "solid",
      borderWidth: 1,
      padding: 3,
      paddingLeft: 6,
      paddingRight: 6,
      backgroundColor: bgColor ? bgColor : "",
      borderColor: fontColor ? fontColor : "",
    },
  });

  return (
    <Pressable onTouchEnd={() => buttonFunc()} style={styles.button}>
      {icon && (
        <Icon
          name={icon as any}
          size={24}
          color={fontColor ? fontColor : "black"}
        />
      )}
      <Text
        style={{
          color: fontColor ?? "#000000",
        }}
      >
        {children}
      </Text>
    </Pressable>
  );
}
