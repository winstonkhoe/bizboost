import {useEffect, useMemo} from 'react';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {Campaign, CampaignType} from '../model/Campaign';
import {
  setNonUserCampaigns,
  setUserCampaigns,
} from '../redux/slices/campaignSlice';

export const useOngoingCampaign = () => {
  const {uid} = useAppSelector(state => state.user);
  const now = useMemo(() => new Date(), []);
  const {userCampaigns, nonUserCampaigns} = useAppSelector(
    state => state.campaign,
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (uid) {
      Campaign.getAll().then(cs => {
        dispatch(
          setNonUserCampaigns(
            cs
              .filter(c => c.userId !== uid)
              .filter(c => c.type === CampaignType.Public)
              .filter(c => c.getTimelineStart().end >= now.getTime())
              .sort(
                (a, b) => a.getTimelineStart().end - b.getTimelineStart().end,
              )
              .map(c => c.toJSON()),
          ),
        );
      });
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
