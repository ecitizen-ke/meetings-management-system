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

const theme = createTheme({
  palette: {
    primary: {
      main: green[700],
    },
    secondary: {
      main: red[500],
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <RouterProvider router={AppRouter} />
      </ThemeProvider>
    </Provider>
  </StrictMode>
);
