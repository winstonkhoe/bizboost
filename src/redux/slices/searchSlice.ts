import {createSlice} from '@reduxjs/toolkit';

interface SearchState {
  isOnSearchPage: boolean;
  searchTerm: string;
}

const initialState = {isOnSearchPage: false, searchTerm: ''} as SearchState;

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    openSearchPage(state) {
      state.isOnSearchPage = true;
    },
    closeSearchPage(state) {
      state.isOnSearchPage = false;
    },
    updateSearchTerm(state, action) {
      state.searchTerm = action.payload;
    },
  },
});

export const {openSearchPage, closeSearchPage, updateSearchTerm} =
  searchSlice.actions;
export default searchSlice.reducer;
