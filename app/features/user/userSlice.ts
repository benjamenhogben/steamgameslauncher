import { createSlice, createRe } from '@reduxjs/toolkit';
// eslint-disable-next-line import/no-cycle
import { AppThunk, RootState } from '../../store';

const userSlice = createSlice({
  name: 'users',
  initialState: {
    loading: 'idle',
    users: [],
  },
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
  },
});

// Destructure and export the plain action creators
export const { usersLoading, usersReceived } = userSlice.actions;

// Define a thunk that dispatches those action creators
export const incrementAsync = (delay = 1000): AppThunk => (dispatch) => {
  setTimeout(() => {
    dispatch(increment());
  }, delay);
};

export default userSlice.reducer;

export const selectCount = (state: RootState) => state.counter.value;
