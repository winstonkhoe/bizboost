import {createAction, createSlice} from '@reduxjs/toolkit';
import {PortfolioView} from '../../model/Portfolio';

interface ContentState {
  portfolios: PortfolioView[];
  userPortfolios: PortfolioView[];
}

const initialState = {
  portfolios: [],
  userPortfolios: [],
} as ContentState;

// export const setPortfolios = createAction<PortfolioView[]>('setPortfolios');

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    setPortfolios(state, action) {
      state.portfolios = action.payload;
    },
    setUserPortfolios(state, action) {
      state.userPortfolios = action.payload;
    },
  },
  // extraReducers(builder) {
  //   builder.addCase(setPortfolios, (state, action) => {
  //     state.portfolios = action.payload;
  //   });
  // },
});

export const {setPortfolios, setUserPortfolios} = portfolioSlice.actions;
export default portfolioSlice.reducer;
