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
      return Campaign.getAll(campaigns => {
        Promise.all(
          campaigns.map(async campaign =>
            (await campaign.isRegisterable()) ? campaign : null,
          ),
        )
          .then(registerableCampaigns => {
            dispatch(
              setNonUserCampaigns(
                registerableCampaigns
                  .filter((campaign): campaign is Campaign => campaign !== null)
                  .filter(c => c.userId !== uid)
                  .sort(Campaign.sortByTimelineStart)
                  .map(c => c.toJSON()),
              ),
            );
          })
          .catch(() => {
            dispatch(setNonUserCampaigns([]));
          });
      }, CampaignType.Public);
    }
  }, [now, uid, dispatch]);

  useEffect(() => {
    if (uid) {
      console.log('hook:useOngoingCampaign');
      return Campaign.getUserCampaignsReactive(uid, (campaigns: Campaign[]) => {
        dispatch(
          setUserCampaigns(campaigns.map(campaign => campaign.toJSON())),
        );
      });
    }
  }, [uid, dispatch]);
  return {userCampaigns, nonUserCampaigns};
};
