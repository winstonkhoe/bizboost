import {createSlice} from '@reduxjs/toolkit';
import {Campaign} from '../../model/Campaign';

interface CampaignState {
  userCampaigns: Campaign[];
}

const initialState = {
  userCampaigns: [],
} as CampaignState;

const campaignSlice = createSlice({
  name: 'campaign',
  initialState,
  reducers: {
    setUserCampaigns(state, action) {
      state.userCampaigns = action.payload;
    },
  },
});

export const {setUserCampaigns} = campaignSlice.actions;
export default campaignSlice.reducer;
