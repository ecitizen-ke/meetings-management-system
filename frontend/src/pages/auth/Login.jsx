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
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../redux/features/auth/authSlice";
import logo from "../../assets/logo.svg";
import { useNavigate } from "react-router";

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
    if (isLoggedIn) {
      // Redirect to dashboard or home page
      navigate("/dashboard");
    }
  });

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (e) => {
    // auth simulation
    console.log(e);
    const result = await new Promise((resolve, reject) => {
      setTimeout(() => {
        if (e.email === "admin@tests.co.ke" && e.password === "linspace") {
          dispatch(
            login({
              auth: {
                email: e.email,
                name: "Admin User",
              },
              isLoggedIn: true,
            })
          );
          resolve("user logged in successfully");
        } else {
          reject("Auth failed");
        }
      }, 3000);
    });

    console.log(result);
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
          </div>

          <div className="login-area">
            <form noValidate onSubmit={handleSubmit(onSubmit)} method="post">
              <div className="form-control">
                <TextField
                  fullWidth={true}
                  id="outlined-basic"
                  label="Email Address"
                  variant="outlined"
                  defaultValue={`admin@tests.co.ke`}
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
                  // value={`linspace`}
                  defaultValue={`linspace`}
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
              <Link variant="secondary" underline="none" href="">
                Forgot Password ?
              </Link>
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
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
