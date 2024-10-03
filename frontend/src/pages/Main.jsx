import {
  Card,
  CardContent,
  Divider,
  Grid,
  Typography,
  Button,
} from "@mui/material";
import { green, red } from "@mui/material/colors";
import React, { useEffect, useState } from "react";
import { getData } from "../utils/api";
import { Config } from "../Config";
import { useDispatch } from "react-redux";
import { DataGrid } from "@mui/x-data-grid";
import moment from "moment";
import { useNavigate } from "react-router";
import Notification from "../components/Notification";
import { handleApiError } from "../utils/errorHandler";

const Main = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    complete: 0,
    ongoing: 0,
    pending: 0,
  });
  const [meetings, setMeetings] = useState([]);
  const columns = [
    { field: "id", headerName: "#", width: 70 },
    { field: "title", headerName: "Title", width: 220 },
    { field: "boardroom_name", headerName: "Boardroom", width: 220 },
    { field: "description", headerName: "Description", width: 220 },
    {
      field: "meeting_date",
      headerName: "Meeting Date",
      width: 220,
      renderCell: (params) => (
        <div>{moment(params.row.meeting_date).format("MMMM D, YYYY")}</div>
      ),
    },
    {
      field: "start_time",
      headerName: "Start Time",
      width: 130,
      renderCell: (params) => (
        <div>{moment(params.row.start_time, "HH:mm:ss").format("HH:mm A")}</div>
      ),
    },
    {
      field: "end_time",
      headerName: "End Time",
      width: 130,
      renderCell: (params) => (
        <div>{moment(params.row.end_time, "HH:mm:ss").format("HH:mm A")}</div>
      ),
    },
    {
      field: "actions",
      headerName: "",
      width: 350,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <>
          <div>
            <Button
              onClick={() => navigate("/dashboard/attendees/" + params.row.id)}
              variant="contained"
              color="info"
              size="small"
            >
              View Attendees
            </Button>
          </div>
        </>
      ),
    },
  ];

  const fetchStats = async () => {
    try {
      const customHeaders = {
        Authorization: "Bearer xxxxxx",
        "Content-Type": "application/json",
      };
      const result = await getData(
        `${Config.API_URL}/reports-summary`,
        customHeaders
      );
      setStats(result);
    } catch (error) {
      handleApiError(error, dispatch);
    }
  };
  const fetchMeetings = async () => {
    try {
      const customHeaders = {
        Authorization: "Bearer xxxxxx",
        "Content-Type": "application/json",
      };
      const result = await getData(`${Config.API_URL}/meetings`, customHeaders);
      setMeetings(result);
    } catch (error) {
      handleApiError(error, dispatch);
    }
  };
  useEffect(() => {
    fetchStats();
    fetchMeetings();
  }, []);
  return (
    <div>
      <Grid container spacing={2}>
        <Grid item md={3} xs={12}>
          <Card
            style={{
              backgroundColor: green[400],
            }}
            color="primary"
          >
            <CardContent>
              <Typography
                color={`white`}
                gutterBottom
                variant="h4"
                component="div"
              >
                Ongoing
              </Typography>
              <Typography color={`white`} variant="h5">
                {stats.ongoing}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item md={3} xs={12}>
          <Card
            style={{
              backgroundColor: red[400],
            }}
            color="primary"
          >
            <CardContent>
              <Typography
                color={`white`}
                gutterBottom
                variant="h4"
                component="div"
              >
                Upcoming
              </Typography>
              <Typography color={`white`} variant="h5">
                {stats.pending}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item md={3} xs={12}>
          <Card color="primary">
            <CardContent>
              <Typography
                color={`black`}
                gutterBottom
                variant="h4"
                component="div"
              >
                Completed
              </Typography>
              <Typography color={`black`} variant="h5">
                {stats.complete}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item md={3} xs={12}>
          <Card
            style={{
              backgroundColor: "#222222",
            }}
            color=""
          >
            <CardContent>
              <Typography
                color={`white`}
                gutterBottom
                variant="h4"
                component="div"
              >
                Total Meetings
              </Typography>
              <Typography color={`white`} variant="h5">
                {stats.ongoing + stats.pending + stats.complete}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <br />
      <Divider />
      <Notification />
      <br />
      <Typography variant="h3" component="div">
        Recent Meetings
      </Typography>
      <br />
      <br />

      <div style={{ width: "100%", marginTop: "35px" }}>
        <DataGrid
          rows={meetings}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[5, 10]}
          checkboxSelection
        />
      </div>
    </div>
  );
};

export default Main;
