import {useEffect} from 'react';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {Campaign} from '../model/Campaign';
import {setUserCampaigns} from '../redux/slices/campaignSlice';

export const useOngoingCampaign = () => {
  const {uid} = useAppSelector(state => state.user);
  const {userCampaigns} = useAppSelector(state => state.campaign);
  const dispatch = useAppDispatch();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    if (uid) {
      console.log('hook:useOngoingCampaign');
      unsubscribe = Campaign.getUserCampaignsReactive(
        uid,
        (campaigns: Campaign[]) => {
          dispatch(
            setUserCampaigns(campaigns.map(campaign => campaign.toJSON())),
          );
        },
      );
    }
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [uid, dispatch]);
  return {campaigns: userCampaigns};
};
