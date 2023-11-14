import {Pressable, Text, View} from 'react-native';
import {flex, items, justify} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import {borderRadius, radiusSize, rounded} from '../../styles/BorderRadius';
import {shadow} from '../../styles/Shadow';
import {Campaign, CampaignStep, CampaignTimeline} from '../../model/Campaign';
import {formatDateToDayMonthYear, getDate} from '../../utils/date';
import {useNavigation} from '@react-navigation/native';
import {
  AuthenticatedNavigation,
  NavigationStackProps,
} from '../../navigation/StackNavigation';
import FastImage from 'react-native-fast-image';
import {padding} from '../../styles/Padding';
import {Label} from '../atoms/Label';
import {useEffect, useMemo, useState} from 'react';
import {COLOR} from '../../styles/Color';
import {User} from '../../model/User';
import {font} from '../../styles/Font';
import {textColor} from '../../styles/Text';
import {AnimatedPressable} from '../atoms/AnimatedPressable';
import {dimension} from '../../styles/Dimension';
import {formatNumberWithThousandSeparator} from '../../utils/number';
type Props = {
  campaign: Campaign;
};

const OngoingCampaignCard = ({campaign}: Props) => {
  const navigation = useNavigation<NavigationStackProps>();
  const [user, setUser] = useState<User>();

  useEffect(() => {
    if (campaign.userId) {
      User.getById(campaign.userId).then(setUser);
    }
  }, [campaign]);

  const onViewCampaignDetailButtonClicked = () => {
    navigation.navigate(AuthenticatedNavigation.CampaignDetail, {
      campaignId: campaign.id || '',
    });
  };
  const firstTimeline: CampaignTimeline | undefined = useMemo(() => {
    return campaign.timeline?.find(
      timeline => CampaignStep.Registration === timeline.step,
    );
  }, [campaign]);

  return (
    <AnimatedPressable
      scale={0.95}
      className="bg-white"
      style={[flex.flex1, shadow.default, rounded.medium]}
      onPress={onViewCampaignDetailButtonClicked}>
      <View
        style={[flex.flexCol, rounded.medium, padding.default, gap.default]}>
        <View
          style={[
            flex.flexRow,
            justify.between,
            items.end,
            {
              borderBottomWidth: 1,
              borderBottomColor: COLOR.black[20],
            },
            padding.bottom.default,
          ]}>
          <View style={[flex.flexRow, gap.small, justify.start]}>
            <Text
              className="font-medium"
              style={[font.size[40], textColor(COLOR.text.neutral.med)]}>
              {user?.businessPeople?.fullname}
            </Text>
          </View>
          {firstTimeline && (
            <Label
              radius="default"
              text={`${formatDateToDayMonthYear(
                new Date(firstTimeline.start),
              )} - ${formatDateToDayMonthYear(new Date(firstTimeline.end))}`}
            />
          )}
        </View>
        <View style={[flex.flexCol]}>
          <View style={[flex.flexRow, gap.medium]}>
            <View
              className="w-24 h-24 overflow-hidden"
              style={[rounded.medium]}>
              <FastImage
                style={[dimension.full]}
                source={{uri: campaign.image}}
              />
            </View>
            <View style={[flex.flexCol, gap.small]}>
              <Text
                className="font-bold"
                style={[font.size[40]]}
                numberOfLines={2}>
                {campaign.title}
              </Text>
              <View style={[flex.flexRow, gap.small]}>
                {campaign?.platforms?.map(platform => (
                  <Label type="danger" radius="default" text={platform.name} />
                ))}
              </View>
              <View style={[flex.flexCol, gap.small]}>
                {campaign.fee && (
                  <Text
                    className="font-semibold"
                    style={[font.size[40], textColor(COLOR.text.neutral.high)]}>
                    {`Rp${formatNumberWithThousandSeparator(campaign.fee)}`}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>
      </View>
    </AnimatedPressable>
  );
};

export {OngoingCampaignCard};
