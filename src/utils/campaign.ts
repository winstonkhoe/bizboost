import {CampaignTask} from '../model/Campaign';

export const campaignTaskToString = (task: CampaignTask) => {
  return `${task.quantity} x ${task.name}${task.type ? ` (${task.type})` : ''}`;
};
