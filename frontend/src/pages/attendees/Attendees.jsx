import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Config } from '../../Config';
import { DataGrid } from '@mui/x-data-grid';
import { Badge, Button, IconButton, Menu, MenuItem } from '@mui/material';
import {
  ChevronLeft,
  DocumentScannerSharp,
  FileOpen,
  PictureAsPdfSharp,
  PieChart,
  Share,
  TableBarSharp,
} from '@mui/icons-material';
import { handleApiError } from '../../utils/errorHandler';
import { useDispatch } from 'react-redux';
import { getData } from '../../utils/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logo from '../../assets/logo.jpg';
import moment from 'moment';
import { getToken } from '../../utils/helpers';

const Attendees = () => {
  const customHeaders = {
    Authorization: 'Bearer ' + getToken(),
    'Content-Type': 'application/json',
  };
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
      const { data } = await getData(
        `${Config.API_URL}/attendees/${params.id}`,
        customHeaders
      );
      setAttendees(data);
    } catch (error) {
      handleApiError(error, dispatch);
    }
  };

  //   fetch meeting
  const fetchMeeting = async () => {
    try {
      const { data } = await getData(
        `${Config.API_URL}/meetings/${params.id}`,
        customHeaders
      );
      setMeeting(data);
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
      field: 'uid',
      headerName: '#',
      width: 70,
      renderCell: (params) => {
        return params.id;
      },
    },
    { field: 'first_name', headerName: 'First Name', width: 150 },
    { field: 'last_name', headerName: 'Last Name', width: 150 },
    { field: 'organization', headerName: 'Organization', width: 220 },
    { field: 'designation', headerName: 'Designation', width: 220 },
    { field: 'email', headerName: 'Email', width: 240 },
    { field: 'phone', headerName: 'Phone Number', width: 220 },
    {
      field: 'signature',
      headerName: 'Signature',
      width: 200,
      renderCell: (params) => {
        return params.row.signature ? (
          <img src={params.row.signature} alt='signature' width='100' />
        ) : (
          'No Signature'
        );
      },
    },
  ];

  const generatePdfReport = async () => {
    const doc = new jsPDF({
      orientation: 'l',
    });

    // Load the logo
    const img = new Image();
    img.src = logo;

    await new Promise((resolve) => {
      img.onload = resolve;
    });

    const aspectRatio = img.width / img.height;
    const width = 50;
    const height = width / aspectRatio;
    doc.addImage(img, 'jpg', 120, 10, width, height);

    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFontSize(14);
    doc.text(
      'MINISTRY OF INTERIOR AND NATIONAL ADMINISTRATION',
      pageWidth / 2,
      30,
      {
        align: 'center',
      }
    );
    doc.text(
      'STATE DEPARTMENT FOR IMMIGRATION AND CITIZEN SERVICES',
      pageWidth / 2,
      35,
      {
        align: 'center',
      }
    );

    doc.text(`MEETING: ${meeting.title}`, 14, 45);
    doc.text(`VENUE: ${meeting.venue.building}`, 14, 50);
    doc.text(
      `DATE:  ${new Date(meeting.meeting_date).toLocaleDateString()}`,
      14,
      60
    );
    doc.text(
      `TIME: ${moment(meeting.start_time, 'HH:mm:ss').format(
        'HH:mm A'
      )} - ${moment(meeting.end_time, 'HH:mm:ss').format('HH:mm A')}`,
      14,
      65
    );
    doc.text(`LIST OF ATTENDEES:`, 14, 72);
    doc.setFontSize(10);

    const tableColumn = [
      'NO',
      'Names',
      'Organization',
      'Designation',
      'Phone',
      'Email',
      'Signature',
    ];

    const tableRows = attendees.map((item, index) => [
      index + 1,
      `${item.first_name} ${item.last_name}`,
      item.organization,
      item.designation,
      item.phone,
      item.email,
      '', // Placeholder for the signature column
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 75,
      headStyles: {
        fillColor: [17, 180, 73],
        textColor: [255, 255, 255],
        fontSize: 12,
        fontStyle: 'bold',
      },
      bodyStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
      },
      styles: {
        cellPadding: 3,
        valign: 'middle',
      },
      columnStyles: {
        0: { cellWidth: 12 },
        1: { cellWidth: 40 },
        2: { cellWidth: 55 },
        3: { cellWidth: 40 },
        4: { cellWidth: 30 },
        5: { cellWidth: 50 },
        6: { cellWidth: 35 },
      },
      didDrawCell: (data) => {
        // Check if the cell is in the body (not the header) and in the "Signature" column
        if (
          data.section === 'body' &&
          data.column.index === 6 &&
          attendees[data.row.index].signature
        ) {
          const signatureImg = attendees[data.row.index].signature;

          doc.addImage(
            signatureImg,
            'JPEG',
            data.cell.x + 1,
            data.cell.y + 1,
            30, // Adjust width
            10 // Adjust height
          );
        }
      },
    });

    setAnchorEl(null);
    const time = Math.floor(Date.now() / 1000);
    doc.save(`${meeting.title}-${time}-report.pdf`);
  };

  const generateXcel = async () => {
    try {
      const result = await fetch(
        `${Config.API_URL}/reports/excel/${params.id}`
      );
      const blob = await result.blob();
      const file = new File([blob], meeting.title + '-attendees.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
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
      <div className='meetings-header'>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconButton size='large' onClick={() => window.history.back()}>
            <ChevronLeft />
          </IconButton>
          <h3>
            Attendees &nbsp;
            <Badge
              max={10}
              badgeContent={attendees.length}
              color='secondary'
            ></Badge>
          </h3>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <Button
              id='basic-button'
              aria-controls={open ? 'basic-menu' : undefined}
              aria-haspopup='true'
              aria-expanded={open ? 'true' : undefined}
              onClick={handleClick}
              variant='contained'
              endIcon={<Share />}
            >
              Generate Report
            </Button>

            <Menu
              id='basic-menu'
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                'aria-labelledby': 'basic-button',
              }}
            >
              <MenuItem onClick={generatePdfReport}>
                <PictureAsPdfSharp color='primary' />
                &nbsp; PDF
              </MenuItem>
              <MenuItem onClick={generateXcel}>
                <FileOpen color='primary' />
                &nbsp; Excel
              </MenuItem>
              <MenuItem onClick={generateXcel}>
                <DocumentScannerSharp color='primary' />
                &nbsp; Word
              </MenuItem>
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
          Meeting: <span className='text-muted'>{meeting?.title}</span>
        </h4>
      </div>
      <div style={{ width: '100%', marginTop: '35px' }}>
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
