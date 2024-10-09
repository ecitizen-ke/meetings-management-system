import { Button } from "@mui/material";
import React, { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import SignaturePad from "react-signature-pad-wrapper";
import { setSignature } from "../redux/features/signature/signatureSlice";
import Swal from "sweetalert2";

const SignPad = () => {
  const sigPadRef = useRef(null);
  const dispatch = useDispatch();
  const [isSaved, setSaved] = useState(false);

  // Clear the signature pad
  const clearSignature = () => {
    sigPadRef.current.clear();
    dispatch(
      setSignature({
        signature: null,
      })
    );
    setSaved(false);
  };

  // Save the signature as an image
  const saveSignature = () => {
    if (sigPadRef.current.isEmpty()) {
      Swal.fire({
        // title: "Logout",
        text: "Please provide a signature.",
        icon: "warning",
        // showCancelButton: true,
        confirmButtonColor: "#398e3d",
        // cancelButtonColor: "#d33",
        confirmButtonText: "ok",
      }).then((result) => {
        if (result.isConfirmed) {
        }
      });
      return;
    } else {
      const dataURL = sigPadRef.current.toDataURL("image/png"); // This is the base64 string of the image
      dispatch(
        setSignature({
          signature: dataURL,
        })
      );
      setSaved(true);
    }
  };

  return (
    <div>
      <SignaturePad
        ref={sigPadRef}
        options={{ minWidth: 1, penColor: "rgb(66, 133, 244)" }}
      />
      <div className="d-flex justify-content-end">
        <button
          onClick={clearSignature}
          className="btn btn-danger rounded-0"
          type="button"
        >
          Clear
        </button>
        <button
          onClick={saveSignature}
          className={
            isSaved ? "btn btn-success rounded-0" : "btn rounded-0 btn-info"
          }
          type="button"
        >
          {isSaved ? "Saved!!" : "Save"}
        </button>
      </div>
    </div>
  );
};

export default SignPad;
