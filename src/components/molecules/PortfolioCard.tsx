import {Pressable} from 'react-native';
import {PortfolioView} from '../../model/Portfolio';
import {useNavigation} from '@react-navigation/native';
import {
  AuthenticatedNavigation,
  NavigationStackProps,
} from '../../navigation/StackNavigation';
import FastImage from 'react-native-fast-image';
import {getSourceOrDefaultAvatar} from '../../utils/asset';
import {size} from '../../styles/Size';

interface PortfolioCardProps {
  portfolio: PortfolioView;
}

export const PortfolioCard = ({portfolio}: PortfolioCardProps) => {
  const navigation = useNavigation<NavigationStackProps>();

  return (
    <Pressable
      onPress={() => {
        if (!portfolio.user.id) {
          return;
        }
        navigation.navigate(AuthenticatedNavigation.SpecificExploreModal, {
          contentCreatorId: portfolio.user.id,
          targetContentId: portfolio.portfolio.id,
        });
      }}>
      <FastImage
        source={getSourceOrDefaultAvatar({uri: portfolio.portfolio.thumbnail})}
        style={{
          height: 200,
          borderRadius: size.medium,
        }}
      />
    </Pressable>
  );
};
