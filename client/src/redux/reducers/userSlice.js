import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null, // Store user details here
  role: null, // ('editor' or 'creator')
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload.user;
      state.role = action.payload.role;
    },
    logout: (state) => {
      state.user = null;
      state.role = null;
    },
    updateUserDetails:(state, action) => {
        state.user = {...action.payload}
    },
    updateUserRole: (state, action) => {
      state.role = action.payload;
    },
  },
});

export const { login, logout, updateUserRole } = userSlice.actions;
export default userSlice.reducer;
