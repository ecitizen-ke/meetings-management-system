import { Card, CardContent, Grid, Typography } from "@mui/material";
import { green, red } from "@mui/material/colors";
import React from "react";

const Main = () => {
  return (
    <div>
      <Grid container spacing={2}>
        <Grid item md={4} xs={12}>
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
                0
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item md={4} xs={12}>
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
                Pending
              </Typography>
              <Typography color={`white`} variant="h5">
                0
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item md={4} xs={12}>
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
                0
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default Main;
