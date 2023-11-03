import {useNavigation} from '@react-navigation/native';
import {Category} from '../model/Category';
import {Location} from '../model/Location';
import {
  GeneralNavigation,
  NavigationStackProps,
} from '../navigation/StackNavigation';
import {DeviceEventEmitter} from 'react-native';

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
  navigation: NavigationStackProps;
}
export const openCategoryModal = ({
  favoriteCategories,
  setFavoriteCategories,
  navigation,
}: CategoryModalProps) => {
  const eventType = 'callback.category';
  navigation.navigate(GeneralNavigation.CategoryModal, {
    initialSelectedCategories: favoriteCategories,
    eventType: eventType,
  });

  const listener = DeviceEventEmitter.addListener(eventType, categories => {
    setFavoriteCategories(categories);
  });

  const closeListener = DeviceEventEmitter.addListener('close.category', () => {
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
