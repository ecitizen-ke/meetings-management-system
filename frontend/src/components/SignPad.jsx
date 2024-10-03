import { Button } from "@mui/material";
import React, { useRef } from "react";
import SignaturePad from "react-signature-pad-wrapper";

const SignPad = () => {
  const sigPadRef = useRef(null);

  // Clear the signature pad
  const clearSignature = () => {
    sigPadRef.current.clear();
  };

  // Save the signature as an image
  const saveSignature = () => {
    if (sigPadRef.current.isEmpty()) {
      alert("Please provide a signature.");
    } else {
      const dataURL = sigPadRef.current.toDataURL();
      console.log(dataURL); // This is the base64 string of the image
      // You can use this to upload the image to a server or display it in an <img> tag
    }
  };

  return (
    <div>
      <SignaturePad
        ref={sigPadRef}
        options={{ minWidth: 1, penColor: "rgb(66, 133, 244)" }}
      />
    </div>
  );
};

export default SignPad;
