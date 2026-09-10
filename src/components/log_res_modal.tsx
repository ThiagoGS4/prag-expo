import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewProps,
} from "react-native";

//funções

type Props = {
  openModal: boolean;
  onClose(): void;
} & ViewProps;

export function LogResModal({
  style,
  openModal = false,
  onClose,
  ...rest
}: Props) {
  const [loginForm, setLoginForm] = useState<{}>({
    user: "",
    password: "",
  });

  return (
    <Modal visible={openModal} transparent={true}>
      <View style={styles.container}>
        <View style={styles.inputs}>
          <TextInput
            placeholder="usuário"
            onChange={(texto) =>
              setLoginForm((prev) => ({ ...prev, user: texto }))
            }
            defaultValue={""}
            style={styles.inputBox}
          />
          <TextInput
            placeholder="senha"
            onChange={(texto) =>
              setLoginForm((prev) => ({ ...prev, password: texto }))
            }
            defaultValue={""}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.inputBox}
          />
          <View style={styles.buttonAlign}>
            <Pressable onTouchEnd={() => onClose()} style={styles.button}>
              <Text>Fechar</Text>
            </Pressable>

            <Pressable onTouchEnd={() => onClose()} style={styles.button}>
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

  inputs: {
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    padding: 20,
    margin: "15%",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  }, // todo: parei aqui, fazer botão de "entrar"

  inputBox: {
    padding: 7,
    height: 32,
    borderWidth: 1,
    borderRadius: 10,
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
