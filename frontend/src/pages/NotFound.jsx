import { ArrowLeft } from "@mui/icons-material";
import { Button } from "@mui/material";
import React from "react";

const NotFound = () => {
  return (
    <div className="page-not-found">
      <div className="page-not-found-inner">
        <h1>404 - Page Not Found</h1>
        <br />
        <br />

        <Button
          onClick={() => window.history.back()}
          variant="contained"
          startIcon={<ArrowLeft />}
        >
          Go Back
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
