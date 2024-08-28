import { Email, Lock, LoginRounded } from "@mui/icons-material";
import {
  Button,
  Card,
  InputAdornment,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect } from "react";
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

  const auth = useSelector((state) => state.auth);
  useEffect(() => {
    const isLoggedIn = auth.isLoggedIn;
    if (isLoggedIn) {
      // Redirect to dashboard or home page
      navigate("/");
    }
  });

  const onSubmit = async (e) => {
    // auth simulation
    console.log(e);
    const result = await new Promise((resolve, reject) => {
      setTimeout(() => {
        if (e.email === "admin@tests.co.ke" && e.password === "linspace") {
          dispatch(
            login({
              auth: {
                username: "admin",
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
        <Card
          style={{
            padding: 15,
          }}
          sx={{ minWidth: 275 }}
          variant="outlined"
        >
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
          <Typography gutterBottom variant="h4" component="div">
            Login
          </Typography>

          <form noValidate onSubmit={handleSubmit(onSubmit)} method="post">
            <div className="form-control">
              <TextField
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="primary" />
                    </InputAdornment>
                  ),
                }}
                fullWidth={true}
                id="outlined-basic"
                label="Email Address"
                variant="outlined"
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
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="primary" />
                    </InputAdornment>
                  ),
                }}
                fullWidth={true}
                id="outlined"
                label="Password"
                variant="outlined"
                type="password"
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
              endIcon={isSubmitting ? "" : <LoginRounded />}
              size="large"
            >
              {isSubmitting ? "Signing you in" : "Login"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
