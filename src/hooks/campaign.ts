import {useEffect, useMemo} from 'react';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {Campaign} from '../model/Campaign';
import {
  setNonUserCampaigns,
  setUserCampaigns,
} from '../redux/slices/campaignSlice';

export const fetchNonUserCampaigns = async (currentUserId: string) => {
  const campaigns = await Campaign.getAll();
  return campaigns
    .filter(c => c.userId !== currentUserId)
    .filter(c => c.isPublic() && c.isRegisterable())
    .sort(Campaign.sortByTimelineStart)
    .map(c => c.toJSON());
};

export const useOngoingCampaign = () => {
  const {uid} = useAppSelector(state => state.user);
  const now = useMemo(() => new Date(), []);
  const {userCampaigns, nonUserCampaigns} = useAppSelector(
    state => state.campaign,
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (uid) {
      fetchNonUserCampaigns(uid).then(cs => dispatch(setNonUserCampaigns(cs)));
    }
  }, [now, uid, dispatch]);

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

      return unsubscribe;
    }
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [uid, dispatch]);
  return {userCampaigns, nonUserCampaigns};
};
