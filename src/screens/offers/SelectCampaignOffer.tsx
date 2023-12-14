import {useEffect, useState} from 'react';
import {Pressable, View} from 'react-native';
import {flex, items, justify} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import {COLOR} from '../../styles/Color';
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
import {FormFieldHelper} from '../../components/atoms/FormLabel';

interface SelectCampaignOfferProps {
  onCampaignChange: (campaign: Campaign) => void;
  contentCreatorToOfferId: string;
}

export const SelectCampaignOffer = ({
  onCampaignChange,
  contentCreatorToOfferId,
}: SelectCampaignOfferProps) => {
  const navigation = useNavigation<NavigationStackProps>();
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign>();
  const openModalCampaign = () => {
    openCampaignModal({
      selectedCampaign: selectedCampaign,
      setSelectedCampaign: setSelectedCampaign,
      navigation: navigation,
      contentCreatorToOfferId: contentCreatorToOfferId,
    });
  };

  useEffect(() => {
    if (selectedCampaign) {
      onCampaignChange(selectedCampaign);
    }
  }, [selectedCampaign, onCampaignChange]);

  return (
    <View style={[flex.flexCol, gap.large]}>
      <View style={[flex.flexRow, items.center, justify.between, gap.xlarge]}>
        <View style={flex.flex1}>
          <FormFieldHelper
            title="Campaign"
            titleSize={40}
            description="Please select the campaign in which you want the creator to participate."
          />
        </View>
        <InternalLink text="Add" onPress={openModalCampaign} />
      </View>
      {selectedCampaign && (
        <View style={[flex.flexRow, flex.wrap, justify.start, gap.default]}>
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
  );
};
