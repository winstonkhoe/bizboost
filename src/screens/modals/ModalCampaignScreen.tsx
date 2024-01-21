import {
  Pressable,
  PressableProps,
  Text,
  DeviceEventEmitter,
} from 'react-native';
import {CloseModal} from '../../components/atoms/Close';
import SafeAreaContainer from '../../containers/SafeAreaContainer';
import {
  HorizontalPadding,
  VerticalPadding,
} from '../../components/atoms/ViewPadding';
import {useEffect, useMemo, useState} from 'react';
import {Campaign} from '../../model/Campaign';
import {flex} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import {View} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {
  AuthenticatedNavigation,
  AuthenticatedStack,
  NavigationStackProps,
} from '../../navigation/StackNavigation';
import {ScrollView} from 'react-native-gesture-handler';
import {rounded} from '../../styles/BorderRadius';
import Animated from 'react-native-reanimated';
import {padding} from '../../styles/Padding';
import {CustomButton} from '../../components/atoms/Button';
import {dimension} from '../../styles/Dimension';
import {useNavigation} from '@react-navigation/native';
import {closeModal} from '../../utils/modal';
import {SimpleImageCard} from '../../components/molecules/ImageCard';
import {ImageCounterChip} from '../../components/atoms/Chip';
import FastImage from 'react-native-fast-image';
import {useUser} from '../../hooks/user';
import {Offer} from '../../model/Offer';
import {showToast} from '../../helpers/toast';
import {ToastType} from '../../providers/ToastProvider';
import MasonryLayout from '../../components/layouts/MasonryLayout';
import {useOngoingCampaign} from '../../hooks/campaign';
import {EmptyPlaceholder} from '../../components/templates/EmptyPlaceholder';

type Props = StackScreenProps<
  AuthenticatedStack,
  AuthenticatedNavigation.CampaignModal
>;

const ModalCampaignScreen = ({route}: Props) => {
  const navigation = useNavigation<NavigationStackProps>();
  const {initialSelectedCampaign, eventType, contentCreatorToOfferId} =
    route.params;
  const [selectedCampaign, setSelectedCampaign] = useState<
    Campaign | undefined
  >(initialSelectedCampaign);
  const {userCampaigns} = useOngoingCampaign();
  const campaigns = useMemo(
    () =>
      userCampaigns
        .map(c => new Campaign(c))
        .filter(c => c.isPrivate() && c.isUpcomingOrRegistration()) || [],
    [userCampaigns],
  );

  const toggleCampaignSelection = (campaign: Campaign) => {
    if (selectedCampaign && selectedCampaign.id === campaign.id) {
      setSelectedCampaign(undefined);
    }
    setSelectedCampaign(campaign);
  };

  const emitChangesAndClose = () => {
    DeviceEventEmitter.emit(eventType, selectedCampaign);
    closeModal({
      navigation: navigation,
      triggerEventOnClose: 'close.campaign',
    });
  };

  const navigateToCreateCampaign = () => {
    // closeModal({
    //   navigation: navigation,
    //   triggerEventOnClose: 'close.campaign',
    // });
    navigation.navigate(AuthenticatedNavigation.CreateCampaign);
  };

  return (
    <SafeAreaContainer enable>
      <View className="flex-1" style={[flex.flexCol, gap.small]}>
        <View className="items-center" style={[flex.flexRow, gap.default]}>
          <CloseModal closeEventType="campaign" />
          <Text className="text-lg font-bold">Campaigns</Text>
        </View>
        {campaigns.length > 0 ? (
          <ScrollView contentContainerStyle={[padding.medium]}>
            <MasonryLayout
              data={campaigns}
              renderItem={(item, itemIndex) => {
                return (
                  <CampaignItem
                    key={itemIndex}
                    campaign={item}
                    isReachLimit={selectedCampaign === null}
                    isSelected={
                      selectedCampaign ? item.id === selectedCampaign.id : false
                    }
                    contentCreatorToOfferId={contentCreatorToOfferId}
                    onPress={() => {
                      toggleCampaignSelection(item);
                    }}
                  />
                );
              }}
            />
          </ScrollView>
        ) : (
          <EmptyPlaceholder title="No Private Campaigns To Offer Yet">
            <CustomButton
              text="Create Now"
              rounded="max"
              onPress={navigateToCreateCampaign}
            />
          </EmptyPlaceholder>
        )}
        <View style={[flex.flexCol, gap.default, padding.bottom.default]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[
              padding.horizontal.default,
              flex.flexRow,
              gap.default,
            ]}>
            {selectedCampaign && (
              <CampaignSelectedPreview campaign={selectedCampaign} />
            )}
          </ScrollView>
          {campaigns.length > 0 && (
            <View style={[padding.horizontal.default]}>
              <CustomButton
                text="Choose"
                disabled={selectedCampaign === null}
                onPress={emitChangesAndClose}
              />
            </View>
          )}
        </View>
      </View>
    </SafeAreaContainer>
  );
};

interface CampaignItemProps extends PressableProps {
  campaign: Campaign;
  isSelected: boolean;
  isReachLimit: boolean;
  contentCreatorToOfferId: string;
}

const CampaignItem = ({
  campaign,
  isSelected,
  isReachLimit,
  contentCreatorToOfferId,
  ...props
}: CampaignItemProps) => {
  const [isOffered, setIsOffered] = useState(false);

  useEffect(() => {
    const fetchOfferStatus = () => {
      try {
        if (!campaign.id) {
          showToast({
            type: ToastType.info,
            message: "There's an error, please try again",
          });
          return;
        }
        Offer.hasOfferForContentCreatorAndCampaign(
          contentCreatorToOfferId,
          campaign.id,
        )
          .then(setIsOffered)
          .catch(() => {
            setIsOffered(false);
          });
      } catch (error) {
        console.error('Error fetching offer:', error);
        setIsOffered(false);
      }
    };

    fetchOfferStatus();
  }, [contentCreatorToOfferId, campaign.id]);

  console.log(isSelected);

  return !isOffered ? (
    <Pressable {...props}>
      <Animated.View
        className="relative overflow-hidden"
        style={[
          flex.flexCol,
          gap.small,
          rounded.default,
          !isSelected &&
            isReachLimit && {
              opacity: 0.5,
            },
        ]}>
        <View className="absolute z-20 top-2 right-2">
          <ImageCounterChip selected={isSelected} size="large" />
        </View>
        <SimpleImageCard
          width="full"
          height="xlarge6"
          image={campaign.image || ''}
          text={campaign.title || ''}
          dim={isSelected ? 66 : 0}
        />
      </Animated.View>
    </Pressable>
  ) : (
    <Animated.View
      className="relative overflow-hidden"
      style={[flex.flexCol, gap.small, rounded.default]}>
      <View className="absolute flex justify-center items-center z-50 top-0 right-0 left-0 bottom-0 bg-black opacity-50"></View>
      <View className="absolute flex justify-center items-center z-50 top-0 right-0 left-0 bottom-0">
        <Text className="z-50 text-white opacity-100 font-bold">Offered</Text>
      </View>
      <SimpleImageCard
        width="full"
        height="xlarge6"
        image={campaign.image || ''}
        text={campaign.title || ''}
        dim={isSelected ? 66 : 0}
      />
    </Animated.View>
  );
};

interface CampaignSelectedPreviewProps {
  campaign: Campaign;
}

const CampaignSelectedPreview = ({campaign}: CampaignSelectedPreviewProps) => {
  return (
    <View
      className="overflow-hidden"
      style={[dimension.square.xlarge3, rounded.small]}>
      <FastImage
        style={[dimension.full]}
        source={{
          uri: campaign?.image,
          priority: FastImage.priority.normal,
        }}
        resizeMode={FastImage.resizeMode.cover}
      />
    </View>
  );
};

export default ModalCampaignScreen;
