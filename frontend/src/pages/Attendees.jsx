import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Config } from "../Config";
import { DataGrid } from "@mui/x-data-grid";
import { Button, IconButton } from "@mui/material";
import { ChevronLeft, PieChart } from "@mui/icons-material";

const Attendees = () => {
  const [attendees, setAttendees] = useState([]);
  const [meeting, setMeeting] = useState(null);
  const params = useParams();

  //   fetch attendees from the db
  const fetchAttendees = () => {
    fetch(`${Config.API_URL}/admin/attendees/${params.id}`)
      .then((response) => response.json())
      .then((data) => setAttendees(data))
      .catch((error) => console.error(error));
  };

  //   fetch meeting
  const fetchMeeting = () => {
    fetch(`${Config.API_URL}/meeting/${params.id}`)
      .then((response) => response.json())
      .then((response) => setMeeting(response))
      .catch((error) => console.error(error));
  };
  useEffect(() => {
    console.log(params.id);
    if (params.id) {
      fetchAttendees();
      fetchMeeting();
    }
  }, []);

  const columns = [
    {
      field: "uid",
      headerName: "#",
      width: 70,
      renderCell: (params) => {
        return params.id;
      },
    },
    { field: "first_name", headerName: "First Name", width: 150 },
    { field: "last_name", headerName: "Last Name", width: 150 },
    { field: "email", headerName: "Email", width: 220 },
    { field: "phone", headerName: "Phone Number", width: 220 },
    { field: "designation", headerName: "Designation", width: 220 },
    { field: "department", headerName: "Department", width: 220 },
  ];

  const generateReport = () => {
    fetch(`${Config.API_URL}/admin/generate_excel/${meeting.id}`)
      .then((response) => response.blob())
      .then((blob) => {
        console.log(blob);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = meeting.title + "_attendees_report.xlsx";
        document.body.appendChild(a);
        a.click();
      })
      .catch((error) => console.error(error));
  };

  return (
    <>
      <br />
      <div className="meetings-header">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconButton size="large" onClick={() => window.history.back()}>
            <ChevronLeft />
          </IconButton>
          <h3>Attendees</h3>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <Button
              onClick={() => generateReport()}
              variant="contained"
              endIcon={<PieChart />}
              color="primary"
            >
              Generate Report
            </Button>
          </div>
        </div>
      </div>

      <br />
      <div>
        <h4>
          Meeting: <span className="text-muted">{meeting?.title}</span>
        </h4>
      </div>
      <div style={{ width: "100%", marginTop: "35px" }}>
        <DataGrid
          rows={attendees}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[5, 10]}
          // checkboxSelection
        />
      </div>
    </>
  );
};

export default Attendees;
