import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewProps,
} from "react-native";

//funções

type Props = {
  openModal: boolean;
  onClose(): void;
  onAction(): void;
} & ViewProps;

export function LogResModal({
  style,
  openModal = false,
  onClose,
  onAction: onLogin,
  children,
  ...rest
}: Props) {
  return (
    <Modal visible={openModal} transparent={true}>
      <View style={styles.container}>
        <View style={styles.modalBody}>
          {children}
          <View style={styles.buttonAlign}>
            <Pressable onTouchEnd={() => onClose()} style={styles.button}>
              <Text>Fechar</Text>
            </Pressable>

            <Pressable onTouchEnd={() => onLogin()} style={styles.button}>
              <Text>Logar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(0,0,0,0.3)",
    flex: 1,
    justifyContent: "center",
    padding: 30,
  },

  modalBody: {
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    padding: 20,
    margin: "15%",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  buttonAlign: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 30,
  },
  button: {
    borderRadius: 10,
    borderStyle: "solid",
    borderColor: "#000000",
    borderWidth: 1.5,
    padding: 3,
    paddingLeft: 6,
    paddingRight: 6,
  },
});
