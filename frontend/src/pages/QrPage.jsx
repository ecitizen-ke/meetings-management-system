import * as React from "react";
import { styled, alpha } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import { useSelector } from "react-redux";
import { ArrowBack, Home } from "@mui/icons-material";
import { Avatar, Card, CardHeader, CardMedia, Tooltip } from "@mui/material";
import { red } from "@mui/material/colors";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import "../assets/landing.css";
import { useNavigate, useParams } from "react-router";
import logo from "../assets/logo.svg";
import moment from "moment";
import { Config } from "../Config";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(1),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    [theme.breakpoints.up("sm")]: {
      width: "12ch",
      "&:focus": {
        width: "20ch",
      },
    },
  },
}));

export default function QrPage() {
  // const qrSelector = useSelector((state) => state.qr.qrlink);
  // const meeting = useSelector((state) => state.qr.meeting);
  const [qrLink, setQrLink] = React.useState("");
  let meeting = JSON.parse(sessionStorage.getItem("meeting"));
  const navigate = useNavigate();
  const params = useParams();
  const generateQrCode = async (id) => {
    try {
      const result = await fetch(`${Config.API_URL}/qr/${id}`);
      const blob = await result.blob();
      const imageUrl = URL.createObjectURL(blob);
      setQrLink(imageUrl);
    } catch (error) {
      console.error(error);
    }
  };
  React.useEffect(() => {
    generateQrCode(params.id);
  }, []);
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar>
        <Toolbar>
          <Tooltip title="Go Back">
            <IconButton
              onClick={() => navigate("/dashboard/meetings")}
              size="large"
              edge="start"
              color="inherit"
              aria-label="open drawer"
              sx={{ mr: 2 }}
            >
              {/* <MenuIcon /> */}
              <ArrowBack />
            </IconButton>
          </Tooltip>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }}
          >
            Meeting Management System
          </Typography>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…"
              inputProps={{ "aria-label": "search" }}
            />
          </Search>
        </Toolbar>
      </AppBar>

      <div className="qr-area">
        <Card elevation={2} sx={{ width: "35%", marginTop: 10 }}>
          <center
            style={{
              padding: "10px",
            }}
          >
            <img
              src={logo}
              style={{
                maxHeight: 55,
              }}
              alt="logo"
            />
          </center>
          <CardHeader
            action={`${
              meeting && moment(meeting.meeting_date).format("MMMM D, YYYY")
            }`}
            title={meeting && meeting.title}
            subheader={`Venue: ${meeting && meeting.boardroom_name}`}
          />

          <CardMedia component="img" image={qrLink} alt="QR " />
        </Card>
      </div>
    </Box>
  );
}
