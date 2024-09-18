import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Config } from "../Config";
import { DataGrid } from "@mui/x-data-grid";
import { Button, IconButton, Menu, MenuItem } from "@mui/material";
import { ChevronLeft, PieChart, Share } from "@mui/icons-material";
import { handleApiError } from "../utils/errorHandler";
import { useDispatch } from "react-redux";
import { getData } from "../utils/api";
import jsPDF from "jspdf";
import "jspdf-autotable";
import logo from "../assets/logo.jpg";

const Attendees = () => {
  const [attendees, setAttendees] = useState([]);
  const [meeting, setMeeting] = useState(null);
  const params = useParams();
  const dispatch = useDispatch();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  //   fetch attendees from the db
  const fetchAttendees = async () => {
    try {
      const result = await getData(
        `${Config.API_URL}/admin/attendees/${params.id}`
      );
      console.log(result);
      setAttendees(result);
    } catch (error) {
      handleApiError(error);
    }
  };

  //   fetch meeting
  const fetchMeeting = async () => {
    try {
      const result = await getData(`${Config.API_URL}/meeting/${params.id}`);
      setMeeting(result);
    } catch (error) {
      handleApiError(error, dispatch);
    }
  };

  useEffect(() => {
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

  const generatePdfReport = () => {
    const doc = new jsPDF({
      orientation: "l",
    });

    // Load the logo and convert to base64
    const img = new Image();
    img.src = logo;
    img.onload = function () {
      const aspectRatio = img.width / img.height;
      const width = 50; // Desired width
      const height = width / aspectRatio; // Adjust height based on aspect ratio

      doc.addImage(img, "jpg", 120, 10, width, height);

      // Set font size and center the title
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.setFontSize(14);
      doc.text("MINISTRY OF INTERIOR AND NATIONAL ADMNISTRATION", pageWidth / 2, 30, {
        align: "center",
      });
      doc.text("STATE DEPARTMENT OF IMMIGRATION AND CITIZEN SERVICES", pageWidth / 2, 35, {
        align: "center",
      });

      doc.text(`MEETING: ${meeting.title}`, 14, 45);
      doc.text(`VENUE: ${meeting.boardroom_name}`, 14, 55);
      doc.text(
        `DATE: ${new Date(meeting.meeting_date).toLocaleDateString()}`,
        14,
        65
      );
      doc.text(`TIME: ${meeting.start_time +' - '+meeting.end_time}`, 60, 65);
      // doc.text(`-: ${meeting.end_time}`, 90, 60);
      doc.text(`LIST OF ATTENDEES:`, 14, 78);
      doc.setFontSize(12);
      // doc.text(`${meeting.description}`, 14, 110, { maxWidth: 180 }); // Text wrapping

      // Add table
      const tableColumn = [
        "S/NO",
        "Names",
        "Phone",
        "Email",
        "Designation",
        "Department",
        "Organization",
      ];
      const tableRows = attendees.map((item, index) => [
        index + 1, // Row number (index)
        item.first_name + " " + item.last_name,
        item.phone,
        item.email, // Email
        item.designation, // Designation
        item.department, // Department
        item.organization,
      ]);

      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 80, // Start table below the title and logo
        headStyles: {
          fillColor: [17, 180, 73], // Set the background color of the header (RGB format)
          textColor: [255, 255, 255], // Set the text color to white
          fontSize: 12, // Optional: Set the font size
          fontStyle: "bold", // Optional: Set the font style
        },
        bodyStyles: {
          lineWidth: 0.1, // Line thickness for the border of the body cells
          lineColor: [0, 0, 0], // Border color for the body cells
        },
        styles: {
          cellPadding: 3, // Padding inside each cell
          valign: "middle", // Vertically align the text in the middle
        },
        columnStyles: {
          0: { cellWidth: 20 }, // First column (index) width
          1: { cellWidth: 40 }, // Name
          2: { cellWidth: 30 }, // phone number
          3: { cellWidth: 50 }, // email
          4: { cellWidth: 35 }, // designation
          5: { cellWidth: 40 }, // Department
          6: { cellWidth: 60 }, // Organization
        },
      });
      setAnchorEl(null);
      // Save the generated PDF
      doc.save(meeting.title + "-report.pdf");
    };
  };

  const generateXcel = async () => {
    try {
      const result = await fetch(
        `${Config.API_URL}/admin/generate_excel/${params.id}`
      );
      const blob = await result.blob();
      const file = new File([blob], meeting.title + "-attendees.xlsx", {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const fileURL = URL.createObjectURL(file);
      setAnchorEl(null);
      window.open(fileURL);
    } catch (error) {
      setAnchorEl(null);
      handleApiError(error);
    }
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
              id="basic-button"
              aria-controls={open ? "basic-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
              onClick={handleClick}
              variant="contained"
              endIcon={<Share />}
            >
              Generate Report
            </Button>

            <Menu
              id="basic-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                "aria-labelledby": "basic-button",
              }}
            >
              <MenuItem onClick={generatePdfReport}>PDF</MenuItem>
              <MenuItem onClick={generateXcel}>Excel</MenuItem>
            </Menu>
            {/* <Button
              onClick={() => generateReport()}
              variant="contained"
              endIcon={<PieChart />}
              color="primary"
            >
              Generate Report
            </Button> */}
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
