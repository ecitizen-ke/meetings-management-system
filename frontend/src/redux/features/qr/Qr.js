import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  qrlink: null,
  meeting: null,
};
export const qrSlice = createSlice({
  name: "qr",
  initialState,
  reducers: {
    setQrLink: (state, action) => {
      state.qrlink = action.payload.qrlink;
    },
    setMeetingDetail: (state, action) => {
      state.meeting = action.payload.meeting;
    },
  },
});
export const { setQrLink, setMeetingDetail } = qrSlice.actions;
export default qrSlice.reducer;
