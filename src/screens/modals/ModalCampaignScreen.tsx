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
import {useEffect, useState} from 'react';
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

type Props = StackScreenProps<
  AuthenticatedStack,
  AuthenticatedNavigation.CampaignModal
>;

const ModalCampaignScreen = ({route}: Props) => {
  const navigation = useNavigation<NavigationStackProps>();
  const {initialSelectedCampaign, eventType} = route.params;
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign>(
    initialSelectedCampaign,
  );
  const {uid} = useUser();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    Campaign.getUserCampaigns(uid).then(setCampaigns);
  }, [uid]);

  const toggleCampaignSelection = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
  };

  const emitChangesAndClose = () => {
    DeviceEventEmitter.emit(eventType, selectedCampaign);
    closeModal({
      navigation: navigation,
      triggerEventOnClose: 'close.campaign',
    });
  };

  const getFilteredCampaignsByParity = (parityType: 'odd' | 'even') => {
    return campaigns
      .filter((_, index) => index % 2 === (parityType === 'even' ? 0 : 1))
      .map((campaign: Campaign, index) => {
        const selectedIndex = selectedCampaign
          ? selectedCampaign.id === campaign.id
            ? index
            : -1
          : -1;
        return (
          <CampaignItem
            key={index}
            campaign={campaign}
            isReachLimit={selectedCampaign === null}
            isSelected={selectedIndex !== -1}
            selectedIndex={selectedIndex}
            onPress={() => {
              toggleCampaignSelection(campaign);
            }}
          />
        );
      });
  };

  return (
    <SafeAreaContainer enable>
      <View className="flex-1" style={[flex.flexCol, gap.small]}>
        <View className="items-center" style={[flex.flexRow, gap.default]}>
          <CloseModal closeEventType="campaign" />
          <Text className="text-lg font-bold">Campaigns</Text>
        </View>
        <ScrollView contentContainerStyle={{flexGrow: 1}}>
          <VerticalPadding paddingSize="xlarge">
            <HorizontalPadding paddingSize="medium">
              <View style={[flex.flexRow, gap.default]}>
                <View
                  className="flex-1 justify-start"
                  style={[flex.flexCol, gap.default]}>
                  {getFilteredCampaignsByParity('even')}
                </View>
                <View
                  className="flex-1 justify-start"
                  style={[flex.flexCol, gap.default]}>
                  {getFilteredCampaignsByParity('odd')}
                </View>
              </View>
            </HorizontalPadding>
          </VerticalPadding>
        </ScrollView>
        <View style={[flex.flexCol, gap.default, padding.bottom.default]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <HorizontalPadding>
              <View style={[flex.flexRow, gap.default]}>
                {selectedCampaign && (
                  <CampaignSelectedPreview campaign={selectedCampaign} />
                )}
              </View>
            </HorizontalPadding>
          </ScrollView>
          <HorizontalPadding>
            <CustomButton
              text="Choose"
              disabled={selectedCampaign === null}
              onPress={emitChangesAndClose}
            />
          </HorizontalPadding>
        </View>
      </View>
    </SafeAreaContainer>
  );
};

interface CampaignItemProps extends PressableProps {
  campaign: Campaign;
  isSelected: boolean;
  isReachLimit: boolean;
  selectedIndex: number;
}

const CampaignItem = ({
  campaign,
  isSelected,
  isReachLimit,
  selectedIndex,
  ...props
}: CampaignItemProps) => {
  return (
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
