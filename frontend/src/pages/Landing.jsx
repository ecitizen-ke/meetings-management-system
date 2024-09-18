import React, { useEffect, useState } from "react";
import "../assets/landing.css";
import { Config } from "../Config";
import { useParams } from "react-router";
import moment from "moment";
import logo from "../assets/logo.svg";
import { useForm } from "react-hook-form";
import { Snackbar } from "@mui/material";

const Landing = () => {
  const { id } = useParams();
  const [meeting, setMeeting] = useState(null);
  const [openToast, setOpenToast] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const fetchMeetingDetail = async () => {
    try {
      // Fetch meeting details
      const resp = await fetch(`${Config.API_URL}/meeting/${id}`);

      // Check if the response is OK (status code 200-299)
      if (resp.ok) {
        const data = await resp.json(); // Parse the response as JSON
        console.log(data);
        setMeeting(data); // Set meeting details
      } else {
        console.error(
          "Error fetching meeting details:",
          resp.status,
          resp.statusText
        );
        // Handle non-OK response status
        throw new Error("Failed to fetch meeting details");
      }
    } catch (error) {
      console.error("An error occurred:", error.message);
      // Handle network errors or other exceptions
      throw error;
    }
  };

  useEffect(() => {
    console.log(id);
    fetchMeetingDetail().then((data) => console.log(data));
  }, []);

  const onSubmit = (data) => {
    if (!id) throw new Error("Meeting don't exist");

    // add meeting id to user data

    data["meeting_id"] = id;
    fetch(`${Config.API_URL}/attendees`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((resp) => resp.json())
      .then((data) => {
        setOpenToast(true);
        setIsRegistered(true);
      })
      .catch((error) => console.log(error));
  };

  const handleToastClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenToast(false);
  };

  return (
    <div
      style={{
        backgroundColor: "#efefef",
      }}
    >
      <nav className="navbar fixed-top navbar-expand-lg shadow-sm bg-body-tertiary">
        <div className="container">
          <a className="navbar-brand" href="#">
            <img src={logo} alt="logo" height="55" />
          </a>
          <button className="navbar-toggler" type="button">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav">
              {/* <li className="nav-item">
                <a className="nav-link active" aria-current="page" href="#">
                  Home
                </a>
              </li> */}
            </ul>
          </div>
        </div>
      </nav>
      <div className="landing-page-outer container-fluid">
        <div className="landing-page-inner row p-3  borderd-0">
          <div className="col-lg-3 m-2"></div>
          <div className="registration-form card col-lg-6 m-2">
            <div className="card-body">
              <h3 className="text-muted">{meeting && meeting.title}</h3>
              <br />
              <table className="table table-striped">
                <tbody>
                  <tr>
                    <th scope="row">Venue</th>
                    <td></td>
                    <td></td>
                    <td>{meeting && meeting.boardroom_name}</td>
                  </tr>
                  <tr>
                    <th scope="row">Date</th>
                    <td></td>
                    <td></td>
                    <td>
                      {meeting &&
                        moment(meeting.meeting_date).format("MMMM D, YYYY")}
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Time</th>
                    <td></td>
                    <td></td>
                    <td>
                      {meeting &&
                        moment(meeting.start_time, "HH:mm").format(
                          "hh:mm A"
                        )}{" "}
                      to{" "}
                      {meeting &&
                        moment(meeting.end_time, "HH:mm").format("hh:mm A")}
                    </td>
                  </tr>
                </tbody>
              </table>
              {isRegistered && (
                <div className="alert alert-success" role="alert">
                  You have successfully registered for the meeting.
                </div>
              )}
              {!isRegistered && (
                <div>
                  <br />
                  <br />
                  <h3 className="text-muted">Registration</h3>

                  {/* Registration form */}
                  <form
                    noValidate
                    onSubmit={handleSubmit(onSubmit)}
                    action=""
                    method="post"
                  >
                    <div className="row">
                      <div className="col-lg-6">
                        <div className="my-3">
                          <label htmlFor="name" className="form-label">
                            First Name
                          </label>
                          <input
                            type="text"
                            className="form-control rounded-0"
                            id="first_name"
                            {...register("first_name", {
                              required: "This field is required",
                            })}
                            name="first_name"
                            required
                          />
                          {errors.first_name && (
                            <span
                              style={{
                                color: "crimson",
                              }}
                            >
                              {errors.first_name.message}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <div className="my-3">
                          <label htmlFor="l_name" className="form-label">
                            Last Name
                          </label>
                          <input
                            type="text"
                            className="form-control rounded-0"
                            id="l_name"
                            name="l_name"
                            {...register("last_name", {
                              required: "This field is required",
                            })}
                            required
                          />
                          {errors.last_name && (
                            <span
                              style={{
                                color: "crimson",
                              }}
                            >
                              {errors.last_name.message}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="my-3">
                      <label htmlFor="email" className="form-label">
                        Email Address
                      </label>
                      <input
                        type="email"
                        className="form-control rounded-0"
                        id="email"
                        {...register("email", {
                          required: "This field is required",
                          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Please enter a valid email address",
                        })}
                        name="email"
                        required
                      />
                    </div>
                    {errors.email && (
                      <span
                        style={{
                          color: "crimson",
                        }}
                      >
                        {errors.email.message}
                      </span>
                    )}
                    <div className="my-3">
                      <label htmlFor="phone" className="form-label">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        className="form-control rounded-0"
                        id="phone"
                        name="phone"
                        {...register("phone", {
                          required: "This field is required",
                        })}
                        required
                      />
                    </div>
                    {errors.phone && (
                      <span
                        style={{
                          color: "crimson",
                        }}
                      >
                        {errors.phone.message}
                      </span>
                    )}
                    <div className="my-3">
                      <label htmlFor="department" className="form-label">
                        Department
                      </label>
                      <input
                        type="text"
                        className="form-control rounded-0"
                        id="department"
                        {...register("department", {
                          required: "This field is required",
                        })}
                        name="department"
                        required
                      />
                    </div>
                    {errors.department && (
                      <span
                        style={{
                          color: "crimson",
                        }}
                      >
                        {errors.department.message}
                      </span>
                    )}
                    <div className="my-3">
                      <label htmlFor="designation" className="form-label">
                        Designation
                      </label>
                      <input
                        type="text"
                        className="form-control rounded-0"
                        id="designation"
                        {...register("designation", {
                          required: "This field is required",
                        })}
                        name="designation"
                        required
                      />
                    </div>
                    {errors.designation && (
                      <span
                        style={{
                          color: "crimson",
                        }}
                      >
                        {errors.designation.message}
                      </span>
                    )}
                    <div className="my-3">
                      <label htmlFor="organization" className="form-label">
                        Organization
                      </label>
                      <input
                        type="text"
                        className="form-control rounded-0"
                        id="organization"
                        name="organization"
                        required
                      />
                    </div>
                    <div className="my-3">
                      <button
                        disabled={isSubmitting}
                        className="btn btn-success w-100 rounded-0 btn-large"
                      >
                        {isSubmitting ? "Please wait ..." : "Register"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
          <div className="col-lg-3"></div>
        </div>
      </div>

      <Snackbar
        open={openToast}
        autoHideDuration={6000}
        onClose={handleToastClose}
        message="Attendance recorded successfully"
      />
    </div>
  );
};

export default Landing;
