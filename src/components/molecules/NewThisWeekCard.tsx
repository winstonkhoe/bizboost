import {useNavigation} from '@react-navigation/native';
import {Campaign} from '../../model/Campaign';
import {AnimatedPressable} from '../atoms/AnimatedPressable';
import {
  AuthenticatedNavigation,
  NavigationStackProps,
} from '../../navigation/StackNavigation';
import {flex, justify} from '../../styles/Flex';
import {StyleSheet, Text, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import {dimension} from '../../styles/Dimension';
import {rounded} from '../../styles/BorderRadius';
import {SkeletonPlaceholder} from './SkeletonPlaceholder';
import {background} from '../../styles/BackgroundColor';
import {COLOR} from '../../styles/Color';
import {padding} from '../../styles/Padding';
import {font} from '../../styles/Font';
import {textColor} from '../../styles/Text';
import {size} from '../../styles/Size';
import {Label} from '../atoms/Label';
import {formatDateToDayMonthYear} from '../../utils/date';
import {useEffect, useState} from 'react';
import {User} from '../../model/User';
import {gap} from '../../styles/Gap';
import {getSourceOrDefaultAvatar} from '../../utils/asset';
import LinearGradient from 'react-native-linear-gradient';
import {shadow} from '../../styles/Shadow';

interface NewThisWeekCardProps {
  campaign?: Campaign | null;
}

export const NewThisWeekCard = ({campaign}: NewThisWeekCardProps) => {
  const navigation = useNavigation<NavigationStackProps>();
  const cardDimension = dimension.square.xlarge9;
  const cardRoundedSize = rounded.large;
  const [user, setUser] = useState<User | null>();

  useEffect(() => {
    if (campaign?.userId) {
      User.getById(campaign?.userId)
        .then(setUser)
        .catch(() => setUser(null));
    }
  }, [campaign]);

  if (!campaign || !user) {
    return (
      <SkeletonPlaceholder style={[cardDimension, cardRoundedSize]} isLoading />
    );
  }

  return (
    <AnimatedPressable
      scale={0.9}
      onPress={() => {
        if (campaign?.id) {
          navigation.navigate(AuthenticatedNavigation.CampaignDetail, {
            campaignId: campaign.id,
          });
        }
      }}
      style={[flex.flexCol, cardDimension, shadow.small, cardRoundedSize]}>
      <View
        className="overflow-hidden"
        style={[StyleSheet.absoluteFill, cardRoundedSize]}>
        <FastImage
          style={[dimension.full]}
          source={{
            uri: campaign.image,
          }}
        />
      </View>
      <View
        className="overflow-hidden"
        style={[
          StyleSheet.absoluteFill,
          cardRoundedSize,
          background(COLOR.absoluteBlack[100], 0.4),
        ]}
      />
      <View
        className="overflow-hidden"
        style={[StyleSheet.absoluteFill, flex.flexCol, justify.end]}>
        <LinearGradient
          className=""
          colors={['transparent', `${COLOR.absoluteBlack[100]}`]}
          style={[
            dimension.width.xlarge9,
            flex.flexCol,
            gap.xsmall2,
            cardRoundedSize,
            padding.default,
          ]}>
          <View style={[flex.flexRow, gap.xsmall]}>
            <View
              className="overflow-hidden"
              style={[
                dimension.square.default,
                rounded.max,
                background(COLOR.absoluteBlack[0]),
              ]}>
              <FastImage
                style={[dimension.full]}
                source={getSourceOrDefaultAvatar({
                  uri: user?.businessPeople?.profilePicture,
                })}
              />
            </View>
            <Text
              className="font-bold"
              style={[
                flex.flex1,
                font.size[5],
                textColor(COLOR.absoluteBlack[0]),
              ]}
              numberOfLines={1}>
              {user?.businessPeople?.fullname}
            </Text>
          </View>
          <View style={[flex.flexCol]}>
            <Text
              className="font-black"
              style={[font.size[20], textColor(COLOR.absoluteBlack[0])]}
              numberOfLines={1}>
              {campaign?.title}
            </Text>
            <Text
              style={[font.size[10], textColor(COLOR.absoluteBlack[0])]}
              numberOfLines={2}>
              {campaign?.description}
            </Text>
          </View>
        </LinearGradient>
      </View>
      <View
        className="overflow-hidden"
        style={[
          padding.default,
          {
            position: 'absolute',
            top: size.xsmall2,
            right: size.xsmall2,
          },
        ]}>
        <Label
          radius="default"
          fontSize={10}
          text={`Until ${formatDateToDayMonthYear(
            new Date(new Campaign(campaign).getTimelineStart().end),
          )}`}
        />
      </View>
    </AnimatedPressable>
  );
};
