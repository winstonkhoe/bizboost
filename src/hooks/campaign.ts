import {useEffect} from 'react';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {Campaign} from '../model/Campaign';
import {setUserCampaigns} from '../redux/slices/campaignSlice';

export const useOngoingCampaign = () => {
  const {uid} = useAppSelector(state => state.user);
  const {userCampaigns} = useAppSelector(state => state.campaign);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (uid) {
      Campaign.getUserCampaignsReactive(
        uid,
        (campaigns: Campaign[], unsubscribe: () => void) => {
          dispatch(setUserCampaigns(campaigns));
          return unsubscribe;
        },
      );
    }
  }, [uid, dispatch]);
  return {campaigns: userCampaigns};
};
