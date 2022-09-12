import { createTheme } from "@mui/material/styles";
import { Colors } from "./colors";

const theme = createTheme({
    palette: {
        mode: "light",
        background: {
            default: Colors.grayLight,
        },
        primary: {
            main: Colors.primary,
            light: Colors.primaryLight,
            dark: Colors.primaryDark,
            contrastText: Colors.white,
        },
        secondary: {
            main: Colors.secondary,
            light: Colors.secondaryLight,
            dark: Colors.secondaryDark,
            contrastText: Colors.white,
        },
        error: {
            main: Colors.error,
            light: Colors.errorLight,
            dark: Colors.errorDark,
            contrastText: Colors.white,
        },
        success: {
            main: Colors.green,
            light: Colors.greenLight,
            dark: Colors.greenDark,
            contrastText: Colors.white,
        },
    },
});

export default theme;
