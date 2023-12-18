import {createAction, createSlice} from '@reduxjs/toolkit';
import {PortfolioView} from '../../model/Portfolio';

interface ContentState {
  portfolios: PortfolioView[];
}

const initialState = {
  portfolios: [],
} as ContentState;

export const setPortfolios = createAction<PortfolioView[]>('setPortfolios');

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(setPortfolios, (state, action) => {
      state.portfolios = action.payload;
    });
  },
});

export default portfolioSlice.reducer;
