import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  created_venue: null,
  venueOther: false,
};

const venueSlice = createSlice({
  name: 'venue',
  initialState,
  reducers: {
    setCreatedVenue: (state, action) => {
      state.created_venue = action.payload.venue;
    },
    resetCreatedVenue: (state) => {
      state.created_venue = null;
    },
    toggleVenueOther: (state) => {
      state.venueOther = true;
    },
    resetVenueOther: (state) => {
      state.venueOther = false;
    },
  },
});

export const {
  setCreatedVenue,
  toggleVenueOther,
  resetVenueOther,
  resetCreatedVenue,
} = venueSlice.actions;
export default venueSlice.reducer;
