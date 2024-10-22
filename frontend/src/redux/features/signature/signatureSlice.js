import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  signatureImage: null,
};

const signatureSlice = createSlice({
  name: "signature",
  initialState,
  reducers: {
    setSignature: (state, action) => {
      state.signatureImage = action.payload.signature;
    },
    resetSignature: (state) => {
      state.signatureImage = null;
    },
  },
});

export const { setSignature, resetSignature } = signatureSlice.actions;
export default signatureSlice.reducer;
