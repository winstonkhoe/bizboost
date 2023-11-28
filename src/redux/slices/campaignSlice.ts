import {createSlice} from '@reduxjs/toolkit';
import {Campaign} from '../../model/Campaign';

interface CampaignState {
  userCampaigns: Campaign[];
  nonUserCampaigns: Campaign[];
}

const initialState = {
  userCampaigns: [],
  nonUserCampaigns: [],
} as CampaignState;

const campaignSlice = createSlice({
  name: 'campaign',
  initialState,
  reducers: {
    setUserCampaigns(state, action) {
      state.userCampaigns = action.payload;
    },
    setNonUserCampaigns(state, action) {
      state.nonUserCampaigns = action.payload;
    },
  },
});

export const {setUserCampaigns, setNonUserCampaigns} = campaignSlice.actions;
export default campaignSlice.reducer;
