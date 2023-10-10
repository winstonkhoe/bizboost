import {createSlice} from '@reduxjs/toolkit';

interface ModalState {
  isOpen: boolean;
}

const initialState = {isOpen: false} as ModalState;

const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    openModal(state) {
      state.isOpen = true;
    },
    closeModal(state) {
      state.isOpen = false;
    },
  },
});

export const {openModal, closeModal} = modalSlice.actions;
export default modalSlice.reducer;
