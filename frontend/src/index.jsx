import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { AppRouter } from "./Routes.jsx";
import "./App.css";
import { Provider } from "react-redux";
import { store } from "./redux/store.js";
import { createTheme } from "@mui/material";
import { ThemeProvider } from "@emotion/react";
import { green, purple, red, orange } from "@mui/material/colors";
import Notification from "./components/Notification.jsx";

const theme = createTheme({
  palette: {
    primary: {
      main: green[700],
    },
    secondary: {
      main: red[500],
    },
  },
  typography: {
    fontFamily: "Lexend",
    h1: {
      fontSize: "3rem",
      fontWeight: 700,
    },
    h2: {
      fontSize: "2.5rem",
      fontWeight: 600,
    },
    h3: {
      fontSize: "2rem",
      fontWeight: 500,
    },
    h4: {
      fontSize: "1.75rem",
      fontWeight: 400,
    },
    h5: {
      fontSize: "1.5rem",
      fontWeight: 300,
    },
    h6: {
      fontSize: "1.25rem",
      fontWeight: 200,
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      {/* <Notification /> */}
      <ThemeProvider theme={theme}>
        <RouterProvider router={AppRouter} />
      </ThemeProvider>
    </Provider>
  </StrictMode>
);
