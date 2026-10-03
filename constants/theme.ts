export const theme = {
  colors: {
    background: "#000000",
    text: "#ffffff",
    muted: "#555555",
    dim: "#aaaaaa",
    accent: "#00fd2e",
    border: "#1c1c1c",
    borderStrong: "#333333",
    primary: "#0090FE",
    primaryBorder: "#1d98f7",
    secondary: "#111111",
  },
  fonts: {
    mono: "SpaceMono",
    monoBold: "SpaceMono-Bold",
    monoItalic: "SpaceMono-Italic",
    monoBoldItalic: "SpaceMono-BoldItalic",
    sans: "GoogleSans",
    sansMedium: "GoogleSans-Medium",
    sansSemiBold: "GoogleSans-SemiBold",
  },
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 40,
  },
  radius: {
    sm: 4,
    md: 8,
  },
  border: {
    default: 1,
  },
};

export type Theme = typeof theme;
