import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  created_venue: null,
  venueOther: false,
  venueModal: false,
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
    openModal: (state, action) => {
      state.venueModal = true;
    },
    closeModal: (state, action) => {
      state.venueModal = false;
    },
  },
});

export const {
  setCreatedVenue,
  toggleVenueOther,
  resetVenueOther,
  resetCreatedVenue,
  openModal,
  closeModal,
} = venueSlice.actions;
export default venueSlice.reducer;
