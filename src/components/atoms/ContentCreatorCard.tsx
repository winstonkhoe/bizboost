import React from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  AuthenticatedNavigation,
  NavigationStackProps,
} from '../../navigation/StackNavigation';
import {useNavigation} from '@react-navigation/native';
import {flex, items} from '../../styles/Flex';
import {font} from '../../styles/Font';
import {RatingStarIcon} from './Icon';
import {textColor} from '../../styles/Text';
import {COLOR} from '../../styles/Color';
import {gap} from '../../styles/Gap';
import {SocialPlatform, User} from '../../model/User';
import {getSourceOrDefaultAvatar} from '../../utils/asset';
import FastImage from 'react-native-fast-image';
import {dimension} from '../../styles/Dimension';
import {rounded} from '../../styles/BorderRadius';
import {overflow} from '../../styles/Overflow';
import {padding} from '../../styles/Padding';
import {SizeType, size} from '../../styles/Size';
import {SocialCard} from './SocialCard';

interface ContentCreatorCardProps {
  data: User;
}
const ContentCreatorCard = ({data}: ContentCreatorCardProps) => {
  const navigation = useNavigation<NavigationStackProps>();

  const concatenatedCategories =
    data.contentCreator?.specializedCategoryIds?.join(', ');
  const socialSizeType: SizeType = 'large';
  const ratingCategoriesSizeType: SizeType = 'medium';
  const showRatingCategories =
    (data?.contentCreator && data?.contentCreator?.ratedCount > 0) ||
    !!concatenatedCategories;

  const showSocials = !!data?.instagram?.username || !!data?.tiktok?.username;

  const containerHeight =
    170 +
    (showRatingCategories ? size[ratingCategoriesSizeType] : 0) +
    (showSocials ? size[socialSizeType] : 0);

  return (
    <Pressable
      style={[
        rounded.medium,
        overflow.hidden,
        {
          height: containerHeight,
        },
      ]}
      onPress={() => {
        if (!data?.id) {
          return;
        }
        navigation.navigate(AuthenticatedNavigation.ContentCreatorDetail, {
          contentCreatorId: data?.id,
        });
      }}>
      <FastImage
        source={getSourceOrDefaultAvatar({
          uri: data?.contentCreator?.profilePicture,
        })}
        style={[dimension.full]}
      />
      <LinearGradient
        colors={[
          'rgba(0, 0, 0, 0)',
          'rgba(0, 0, 0, 0.1)',
          'rgba(0, 0, 0, 0.3)',
          'rgba(0, 0, 0, 0.65)',
          'rgba(0, 0, 0, 1)',
        ]}
        style={[
          {
            position: 'absolute',
            bottom: 0,
            padding: 10,
          },
          flex.flexCol,
          dimension.width.full,
          padding.top.xlarge3,
        ]}>
        <Text
          style={[
            font.size[30],
            textColor(COLOR.absoluteBlack[0]),
            font.weight.semibold,
          ]}>
          {data?.contentCreator?.fullname}
        </Text>
        {showRatingCategories && (
          <View
            style={[
              flex.flexRow,
              items.center,
              dimension.height[ratingCategoriesSizeType],
            ]}>
            {data?.contentCreator && data?.contentCreator?.ratedCount > 0 && (
              <View style={[flex.flexRow, gap.xsmall, items.center]}>
                <RatingStarIcon
                  width={8}
                  height={8}
                  fill={'rgb(245, 208, 27)'}
                />
                <Text
                  style={[
                    font.size[10],
                    font.weight.medium,
                    textColor(COLOR.absoluteBlack[0]),
                  ]}>
                  {`${data?.contentCreator?.rating} · `}
                </Text>
              </View>
            )}
            {concatenatedCategories && (
              <Text
                numberOfLines={1}
                style={[
                  flex.flex1,
                  font.weight.medium,
                  font.size[10],
                  textColor(COLOR.absoluteBlack[0]),
                ]}>
                {concatenatedCategories}
              </Text>
            )}
          </View>
        )}
        {showSocials && (
          <View
            style={[
              flex.flexRow,
              items.center,
              gap.small,
              dimension.height[socialSizeType],
            ]}>
            {data?.instagram && (
              <SocialCard
                platform={SocialPlatform.Instagram}
                data={data?.instagram}
              />
            )}
            {data?.tiktok && (
              <SocialCard
                platform={SocialPlatform.Tiktok}
                data={data?.tiktok}
              />
            )}
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
};

export default ContentCreatorCard;
