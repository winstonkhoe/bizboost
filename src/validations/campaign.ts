import {Campaign} from '../model/Campaign';

export const getSimilarCampaigns = (
  campaigns: Campaign[],
  searchTerm: string,
) => {
  return campaigns.filter((campaign: Campaign) => {
    return campaign.title?.toLowerCase().includes(searchTerm.toLowerCase());
  });
};
