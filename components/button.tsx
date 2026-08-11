import { Text, TouchableOpacity, GestureResponderEvent } from "react-native";
import { theme } from "../constants/theme";

interface ButtonProps {
  text: string;
  event: (event: GestureResponderEvent) => void;
}

export const MainButton = ({ text, event }: ButtonProps) => {
  return (
    <TouchableOpacity
      style={{
        borderWidth: theme.border.default,
        borderColor: theme.colors.text,
        paddingVertical: 15,
      }}
      onPress={event}
    >
      <Text
        style={{
          color: theme.colors.text,
          fontSize: theme.fontSizes.lg,
          textAlign: "center",
          fontFamily: theme.fonts.mono,
        }}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
};
