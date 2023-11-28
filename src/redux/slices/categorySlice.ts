import {createSlice} from '@reduxjs/toolkit';
import {Category} from '../../model/Category';

interface CampaignState {
  categories: Category[];
}

const initialState = {
  categories: [],
} as CampaignState;

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    setCategories(state, action) {
      state.categories = action.payload;
    },
  },
});

export const {setCategories} = categorySlice.actions;
export default categorySlice.reducer;
