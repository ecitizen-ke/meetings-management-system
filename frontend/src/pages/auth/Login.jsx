import {
  Email,
  Lock,
  LoginRounded,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import {
  Button,
  Card,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../redux/features/auth/authSlice";
import logo from "../../assets/logo.svg";
import { useNavigate } from "react-router";
import Notification from "../../components/Notification";
import { handleApiError } from "../../utils/errorHandler";
import { postData } from "../../utils/api";
import { Config } from "../../Config";

const Login = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const auth = useSelector((state) => state.auth);
  useEffect(() => {
    const isLoggedIn = auth.isLoggedIn;
    const authData = localStorage.getItem("user");
    if (isLoggedIn || authData) {
      // Redirect to dashboard or home page
      navigate("/dashboard");
    }
  });

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (e) => {
    try {
      const user = {
        email: e.email,
        password: e.password,
      };
      const result = await postData(`${Config.API_URL}/auth/login`, user);
      const authData = {
        auth: {
          email: result.user.email,
          name: `${result.user.first_name} ${result.user.last_name}`,
        },
        isLoggedIn: true,
      };
      localStorage.setItem("user", JSON.stringify(authData));
      dispatch(login(authData));
    } catch (error) {
      handleApiError(error, dispatch);
    }
  };
  return (
    <div className="login-page">
      <div className="login-form">
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <img
              style={{
                maxHeight: 55,
              }}
              className="logo"
              src={logo}
              alt="Logo"
            />
          </div>
          <br />
          <div
            style={{
              textAlign: "center",
            }}
            className="login-title"
          >
            <h4>Login</h4>

            <h3 className="login-subtitle"> Meetings Management System</h3>
            <br />
            <Notification />
          </div>

          <div className="login-area">
            <form noValidate onSubmit={handleSubmit(onSubmit)} method="post">
              <div className="form-control">
                <TextField
                  fullWidth={true}
                  id="outlined-basic"
                  label="Email Address"
                  variant="outlined"
                  placeholder="Enter your email address"
                  type="email"
                  {...register("email", {
                    required: "This field is required",
                    pattern: {
                      value: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
                      message: "Please enter a valid email address",
                    },
                  })}
                  error={errors.email && true}
                />
                {errors.email && (
                  <span
                    style={{
                      color: "crimson",
                    }}
                  >
                    {errors.email.message}
                  </span>
                )}
              </div>
              <div className="form-control">
                <TextField
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleClickShowPassword}
                          aria-label="Show Password"
                        >
                          <Typography
                            style={{
                              fontSize: 14,
                            }}
                            variant="h6"
                          >
                            {!showPassword ? "Show Password" : "Hide Password"}
                          </Typography>
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  fullWidth={true}
                  id="outlined"
                  label="Password"
                  variant="outlined"
                  placeholder="Password"
                  type={!showPassword ? "password" : "text"}
                  {...register("password", {
                    required: "This field is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters long",
                    },
                  })}
                  error={errors.password && true}
                />
                {errors.password && (
                  <span
                    style={{
                      color: "crimson",
                    }}
                  >
                    {errors.password.message}
                  </span>
                )}
              </div>
              <br />
              <div className="d-flex justify-content-between">
                <div>
                  <Link
                    variant="secondary"
                    component={RouterLink}
                    underline="none"
                    to={`/forgot-password`}
                  >
                    Forgot Password ?
                  </Link>
                </div>
                <div></div>
              </div>
              <br />
              <br />
              <Button
                disabled={isSubmitting}
                fullWidth={true}
                variant="contained"
                color="primary"
                type="submit"
                size="large"
                style={{
                  borderRadius: "9999px",
                }}
              >
                {isSubmitting ? "Signing you in" : "Sign In"}
              </Button>
              <br />
              <br />
              <div className="text-center">
                <Link
                  variant="secondary"
                  component={RouterLink}
                  underline="none"
                  to={`/register`}
                >
                  Signup
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
