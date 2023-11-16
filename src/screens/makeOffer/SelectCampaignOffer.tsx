import {useEffect, useState} from 'react';
import {
  HorizontalPadding,
  VerticalPadding,
} from '../../components/atoms/ViewPadding';
import {Pressable, Text, View} from 'react-native';
import {flex, items, justify} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import {textColor} from '../../styles/Text';
import {COLOR} from '../../styles/Color';
import {font} from '../../styles/Font';
import {InternalLink} from '../../components/atoms/Link';
import {dimension} from '../../styles/Dimension';
import {rounded} from '../../styles/BorderRadius';
import {padding} from '../../styles/Padding';
import {background} from '../../styles/BackgroundColor';
import {AddIcon} from '../../components/atoms/Icon';
import {openCampaignModal} from '../../utils/modal';
import {useNavigation} from '@react-navigation/native';
import {NavigationStackProps} from '../../navigation/StackNavigation';
import FastImage from 'react-native-fast-image';
import {Campaign} from '../../model/Campaign';

interface SelectCampaignOfferProps {
  onCampaignChange: (campaign: Campaign) => void;
}

export const SelectCampaignOffer = ({
  onCampaignChange,
}: SelectCampaignOfferProps) => {
  const navigation = useNavigation<NavigationStackProps>();
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign>();
  const openModalCategory = () => {
    openCampaignModal({
      selectedCampaign: selectedCampaign,
      setSelectedCampaign: setSelectedCampaign,
      navigation: navigation,
    });
  };

  useEffect(() => {
    onCampaignChange(selectedCampaign);
  }, [selectedCampaign, onCampaignChange]);

  return (
    <VerticalPadding paddingSize="large">
      <View style={[flex.flexCol, gap.xlarge2]}>
        <View style={[flex.flexRow, items.center]}>
          <View style={[flex.flexCol, flex.growShrink, gap.small]}>
            <Text
              className="font-bold"
              style={[textColor(COLOR.text.neutral.high), font.size[50]]}>
              Campaign
            </Text>
            <Text
              className="font-semibold"
              style={[textColor(COLOR.text.neutral.med), font.size[20]]}>
              Please select the campaign in which you want the creator to
              participate.
            </Text>
          </View>
          <InternalLink text="Add" onPress={openModalCategory} />
        </View>
        {selectedCampaign && (
          <View style={[flex.flexRow, flex.wrap, justify.around, gap.default]}>
            <View className="relative" style={[dimension.square.xlarge5]}>
              <Pressable
                onPress={() => {
                  setSelectedCampaign(undefined);
                }}
                className="absolute z-10 top-0 right-0 -translate-x-1/2 -translate-y-1/2 overflow-hidden"
                style={[
                  dimension.square.xlarge,
                  rounded.max,
                  padding.xsmall2,
                  background(COLOR.black[0]),
                  {
                    transform: [
                      {
                        translateX: 10,
                      },
                      {
                        translateY: -10,
                      },
                    ],
                  },
                ]}>
                <View
                  className="rotate-45"
                  style={[
                    flex.flexRow,
                    justify.center,
                    items.center,
                    dimension.full,
                    rounded.max,
                    background(COLOR.background.danger.high),
                  ]}>
                  <AddIcon color={COLOR.black[0]} />
                </View>
              </Pressable>

              <View
                className="overflow-hidden"
                style={[dimension.full, rounded.default]}>
                {selectedCampaign?.image && (
                  <FastImage
                    style={[dimension.full]}
                    source={{
                      uri: selectedCampaign.image,
                      priority: FastImage.priority.high,
                    }}
                    resizeMode={'cover'}
                  />
                )}
              </View>
            </View>
          </View>
        )}
      </View>
    </VerticalPadding>
  );
};
