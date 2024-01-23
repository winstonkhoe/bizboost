import {useEffect, useMemo} from 'react';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {Campaign, CampaignType} from '../model/Campaign';
import {
  setNonUserCampaigns,
  setUserCampaigns,
} from '../redux/slices/campaignSlice';

export const useOngoingCampaign = () => {
  const {uid, isAdmin} = useAppSelector(state => state.user);
  const now = useMemo(() => new Date(), []);
  const {userCampaigns, nonUserCampaigns} = useAppSelector(
    state => state.campaign,
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (uid) {
      return Campaign.getAll(campaigns => {
        Promise.all(
          campaigns.map(async campaign =>
            (await campaign.isRegisterable())
              ? campaign
              : isAdmin
              ? campaign
              : null,
          ),
        )
          .then(registerableCampaigns => {
            const filteredCampaigns = registerableCampaigns
              .filter((campaign): campaign is Campaign => campaign !== null)
              .filter(c => c.userId !== uid);
            const upcomingCampaigns = filteredCampaigns
              .filter(c => c.isUpcomingOrRegistration())
              .sort(Campaign.sortByTimelineStart);
            const pastCampaigns = filteredCampaigns
              .filter(c => !c.isUpcomingOrRegistration())
              .sort(Campaign.sortByTimelineStart)
              .reverse();
            dispatch(
              setNonUserCampaigns(
                [...upcomingCampaigns, ...pastCampaigns].map(c => c.toJSON()),
              ),
            );
          })
          .catch(() => {
            dispatch(setNonUserCampaigns([]));
          });
      }, CampaignType.Public);
    }
  }, [now, uid, isAdmin, dispatch]);

  useEffect(() => {
    if (uid) {
      console.log('hook:useOngoingCampaign');
      return Campaign.getUserCampaignsReactive(uid, (campaigns: Campaign[]) => {
        const upcomingCampaigns = campaigns
          .filter(c => c.isUpcomingOrRegistration())
          .sort(Campaign.sortByTimelineStart);
        const pastCampaigns = campaigns
          .filter(c => !c.isUpcomingOrRegistration())
          .sort(Campaign.sortByTimelineStart)
          .reverse();
        dispatch(
          setUserCampaigns(
            [...upcomingCampaigns, ...pastCampaigns].map(campaign =>
              campaign.toJSON(),
            ),
          ),
        );
      });
    }
  }, [uid, dispatch]);
  return {userCampaigns, nonUserCampaigns};
};
