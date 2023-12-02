import {useNavigation} from '@react-navigation/native';
import {Category} from '../model/Category';
import {Location} from '../model/Location';
import {
  AuthenticatedNavigation,
  GeneralNavigation,
  NavigationStackProps,
} from '../navigation/StackNavigation';
import {DeviceEventEmitter} from 'react-native';
import {Campaign} from '../model/Campaign';
import {Offer} from '../model/Offer';

interface LocationModalProps {
  preferredLocations: Location[];
  setPreferredLocations: (locations: Location[]) => void;
  navigation: NavigationStackProps;
}
export const openLocationModal = ({
  preferredLocations,
  setPreferredLocations,
  navigation,
}: LocationModalProps) => {
  const eventType = 'callback.location';
  navigation.navigate(GeneralNavigation.LocationModal, {
    initialSelectedLocations: preferredLocations,
    eventType: eventType,
  });

  const listener = DeviceEventEmitter.addListener(eventType, locations => {
    setPreferredLocations(locations);
  });

  const closeListener = DeviceEventEmitter.addListener('close.location', () => {
    listener.remove();
    closeListener.remove();
  });
};

interface CategoryModalProps {
  favoriteCategories: Category[];
  setFavoriteCategories: (categories: Category[]) => void;
  maxSelection?: number;
  navigation: NavigationStackProps;
}
export const openCategoryModal = ({
  favoriteCategories,
  setFavoriteCategories,
  maxSelection,
  navigation,
}: CategoryModalProps) => {
  const eventType = 'callback.category';
  navigation.navigate(GeneralNavigation.CategoryModal, {
    initialSelectedCategories: favoriteCategories,
    eventType: eventType,
    maxSelection: maxSelection,
  });

  const listener = DeviceEventEmitter.addListener(eventType, categories => {
    setFavoriteCategories(categories);
  });

  const closeListener = DeviceEventEmitter.addListener('close.category', () => {
    listener.remove();
    closeListener.remove();
  });
};

interface NegotiateModalProps {
  selectedOffer: Offer;
  campaign: Campaign;
  navigation: NavigationStackProps;
  onNegotiationComplete: () => void;
}
export const openNegotiateModal = ({
  selectedOffer,
  campaign,
  navigation,
  onNegotiationComplete,
}: NegotiateModalProps) => {
  const eventType = 'callback.negotiate';
  navigation.navigate(AuthenticatedNavigation.NegotiateModal, {
    offer: selectedOffer,
    eventType: eventType,
    campaign: campaign,
  });

  const listener = DeviceEventEmitter.addListener(eventType, stat => {
    console.log(stat);
    onNegotiationComplete();
  });

  const closeListener = DeviceEventEmitter.addListener(
    'close.negotiate',
    () => {
      listener.remove();
      closeListener.remove();
    },
  );
};

interface CampaignModalProps {
  selectedCampaign: Campaign;
  setSelectedCampaign: (campaign: Campaign) => void;
  navigation: NavigationStackProps;
}
export const openCampaignModal = ({
  selectedCampaign,
  setSelectedCampaign,
  navigation,
}: CampaignModalProps) => {
  const eventType = 'callback.campaign';
  navigation.navigate(AuthenticatedNavigation.CampaignModal, {
    initialSelectedCampaign: selectedCampaign,
    eventType: eventType,
  });

  const listener = DeviceEventEmitter.addListener(eventType, campaign => {
    setSelectedCampaign(campaign);
  });

  const closeListener = DeviceEventEmitter.addListener('close.campaign', () => {
    listener.remove();
    closeListener.remove();
  });
};

interface CloseModalProps {
  triggerEventOnClose: string;
  navigation: NavigationStackProps;
}

export const closeModal = ({
  triggerEventOnClose,
  navigation,
}: CloseModalProps) => {
  triggerEventOnClose && DeviceEventEmitter.emit(triggerEventOnClose);
  navigation.goBack();
};
