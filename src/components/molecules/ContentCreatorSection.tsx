import {StyleSheet, View} from 'react-native';
import {SocialPlatform, User} from '../../model/User';
import {Seperator} from '../atoms/Separator';
import {Text} from 'react-native';
import {flex, items, justify} from '../../styles/Flex';
import {padding} from '../../styles/Padding';
import {gap} from '../../styles/Gap';
import {COLOR} from '../../styles/Color';
import {textColor} from '../../styles/Text';
import {font} from '../../styles/Font';
import FastImage from 'react-native-fast-image';
import {dimension} from '../../styles/Dimension';
import {rounded} from '../../styles/BorderRadius';
import {ChevronRight, PlatformIcon} from '../atoms/Icon';
import {border} from '../../styles/Border';
import {Label} from '../atoms/Label';
import {formatDateToHourMinute} from '../../utils/date';
import {PlatformData} from '../../screens/signup/RegisterSocialPlatform';
import {background} from '../../styles/BackgroundColor';
import {formatNumberWithThousandSeparator} from '../../utils/number';

interface ContentCreatorSectionProps {
  title?: string;
  contentCreator?: User | null;
}

export const ContentCreatorSection = ({
  title = 'Content Creator Detail',
  ...props
}: ContentCreatorSectionProps) => {
  return (
    <>
      <Seperator />
      <View style={[flex.flexCol, padding.default, gap.default]}>
        <View style={[flex.flexRow, gap.xlarge, justify.between]}>
          <Text
            className="font-bold"
            style={[font.size[30], textColor(COLOR.text.neutral.high)]}>
            {title}
          </Text>
          <View
            style={[
              flex.flex1,
              flex.flexRow,
              justify.end,
              items.center,
              gap.xsmall,
            ]}>
            <View
              className="overflow-hidden"
              style={[dimension.square.large, rounded.default]}>
              <FastImage
                source={{
                  uri: props.contentCreator?.contentCreator?.profilePicture,
                }}
                style={[dimension.full]}
              />
            </View>
            <Text
              className="font-medium"
              style={[font.size[20], textColor(COLOR.text.neutral.high)]}
              numberOfLines={1}>
              {props.contentCreator?.contentCreator?.fullname}
            </Text>
            <ChevronRight size="large" color={COLOR.text.neutral.med} />
          </View>
        </View>
        <ContentCreatorCard contentCreator={props.contentCreator} />
      </View>
    </>
  );
};

interface ContentCreatorCardProps {
  contentCreator?: User | null;
}

export const ContentCreatorCard = ({...props}: ContentCreatorCardProps) => {
  return (
    <View
      style={[
        flex.flexCol,
        gap.default,
        padding.default,
        rounded.default,
        border({
          borderWidth: 1,
          color: COLOR.black[20],
        }),
      ]}>
      <View style={[flex.flexCol, gap.default]}>
        <View style={[flex.flexCol, gap.xsmall]}>
          <Text
            className="font-medium"
            style={[font.size[20], textColor(COLOR.text.neutral.high)]}>
            Specialized categories
          </Text>
          <View style={[flex.flexRow, flex.wrap, gap.xsmall]}>
            {props.contentCreator?.contentCreator?.specializedCategoryIds
              ?.slice(0, 3)
              .map(categoryId => (
                <Label radius="small" key={categoryId} text={categoryId} />
              ))}
          </View>
        </View>
        <View style={[flex.flexCol, gap.xsmall]}>
          <Text
            className="font-medium"
            style={[font.size[20], textColor(COLOR.text.neutral.high)]}>
            Usual posting schedules
          </Text>
          <View style={[flex.flexRow, flex.wrap, gap.xsmall]}>
            {props.contentCreator?.contentCreator?.postingSchedules
              ?.slice(0, 3)
              .map(postingSchedule => (
                <Label
                  radius="small"
                  key={postingSchedule}
                  text={formatDateToHourMinute(new Date(postingSchedule))}
                />
              ))}
          </View>
        </View>
      </View>
      {(props.contentCreator?.instagram || props.contentCreator?.tiktok) && (
        <>
          <View style={[styles.bottomBorder]} />
          <View style={[flex.flexRow, flex.wrap, gap.small, justify.around]}>
            {props.contentCreator?.instagram && (
              <SocialDetail
                platformData={{
                  platform: SocialPlatform.Instagram,
                  data: props.contentCreator?.instagram,
                }}
              />
            )}
            {props.contentCreator?.tiktok && (
              <SocialDetail
                platformData={{
                  platform: SocialPlatform.Tiktok,
                  data: props.contentCreator?.tiktok,
                }}
              />
            )}
          </View>
        </>
      )}
    </View>
  );
};

interface SocialDetailProps {
  platformData: PlatformData;
}

const SocialDetail = ({platformData}: SocialDetailProps) => {
  return (
    <View
      style={[
        flex.flex1,
        flex.flexCol,
        items.center,
        border({
          borderWidth: 1,
          color: COLOR.black[20],
        }),
        gap.small,
        rounded.default,
        padding.small,
      ]}>
      <View
        style={[
          flex.flex1,
          flex.flexRow,
          gap.small,
          items.center,
          rounded.small,
          background(COLOR.black[20]),
          padding.small,
        ]}>
        <PlatformIcon platform={platformData.platform} size="default" />
        <View style={[flex.flex1]}>
          <Text
            className="font-medium"
            style={[textColor(COLOR.text.neutral.high), font.size[10]]}
            numberOfLines={1}>{`@${platformData.data.username}`}</Text>
        </View>
      </View>
      {platformData.data.followersCount && (
        <View style={[flex.flexCol, items.center]}>
          <Text
            className="font-medium"
            style={[textColor(COLOR.text.neutral.high), font.size[20]]}>
            {formatNumberWithThousandSeparator(
              platformData.data.followersCount,
            )}
          </Text>
          <Text style={[textColor(COLOR.text.neutral.high), font.size[10]]}>
            Followers
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLOR.black[10],
  },
});
