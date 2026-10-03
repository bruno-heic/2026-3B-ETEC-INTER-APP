import { GestureResponderEvent, Text, TouchableOpacity } from "react-native";
import { theme } from "../constants/theme";

interface ButtonProps {
  text: string;
  event: (event: GestureResponderEvent) => void;
}

export const SecondaryButton = ({ text, event }: ButtonProps) => {
  return (
    <TouchableOpacity
      style={{
        backgroundColor: theme.colors.secondary,
        borderColor: "#1d1d1d",
        borderWidth: 1,
        paddingVertical: theme.spacing.md,
        alignItems: "center",
        borderRadius: 30,
      }}
      onPress={event}
    >
      <Text
        style={{
          color: theme.colors.text,
          fontSize: theme.fontSizes.md,
          textAlign: "center",
          fontFamily: theme.fonts.sansMedium,
        }}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
};
