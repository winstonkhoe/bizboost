import {Linking, Pressable, PressableProps, Text, View} from 'react-native';
import {SocialData, SocialPlatform} from '../../model/User';
import {flex, items, justify, self} from '../../styles/Flex';
import {PlatformIcon, SyncIcon} from './Icon';
import {padding} from '../../styles/Padding';
import {rounded} from '../../styles/BorderRadius';
import {border} from '../../styles/Border';
import {COLOR} from '../../styles/Color';
import {textColor} from '../../styles/Text';
import {font, text} from '../../styles/Font';
import {
  formatNumberWithSuffix,
  formatNumberWithThousandSeparator,
} from '../../utils/number';
import {background} from '../../styles/BackgroundColor';
import {dimension} from '../../styles/Dimension';
import {overflow} from '../../styles/Overflow';
import {size} from '../../styles/Size';
import {gap} from '../../styles/Gap';
import {position} from '../../styles/Position';
import {formatDateToDayMonthYearHourMinuteShort} from '../../utils/date';
import {useMemo} from 'react';

interface SocialCardProps {
  platform: SocialPlatform;
  data: SocialData;
  type?: 'summary' | 'detail';
  inverted?: boolean;
}

export const SocialCard = ({
  type = 'summary',
  platform,
  data,
  inverted = false,
}: SocialCardProps) => {
  const socialUrl = useMemo(() => {
    switch (platform) {
      case SocialPlatform.Tiktok:
        return `https://www.tiktok.com/@${data?.username}`;
      case SocialPlatform.Instagram:
        return `https://www.instagram.com/${data?.username}`;
      default:
        return '';
    }
  }, [platform, data]);

  const openSocialUrl = () => {
    if (socialUrl) {
      Linking.openURL(socialUrl).catch(error => {
        console.log('error open', socialUrl, error);
      });
    }
  };

  if (type === 'summary') {
    return (
      <Summary
        onPress={openSocialUrl}
        data={data}
        platform={platform}
        inverted={inverted}
      />
    );
  }

  if (type === 'detail') {
    return (
      <Detail
        onPress={openSocialUrl}
        data={data}
        platform={platform}
        inverted={inverted}
      />
    );
  }
  return null;
};

interface SummaryProps extends PressableProps {
  platform: SocialPlatform;
  data: SocialData;
  inverted?: boolean;
}

const Summary = ({
  platform,
  data,
  inverted,
  ...pressableProps
}: SummaryProps) => {
  const textColorCode = inverted
    ? COLOR.absoluteBlack[0]
    : COLOR.absoluteBlack[90];
  const borderColorCode = inverted
    ? COLOR.absoluteBlack[90]
    : COLOR.absoluteBlack[0];
  return (
    <Pressable
      style={[position.relative, data.isSynchronized && [padding.right.small]]}
      {...pressableProps}>
      <View
        style={[
          flex.flexRow,
          items.center,
          rounded.default,
          overflow.hidden,
          border({
            borderWidth: 1,
            color: borderColorCode,
          }),
        ]}>
        <View
          style={[
            flex.flexRow,
            gap.xsmall,
            justify.center,
            items.center,
            dimension.height.large,
            padding.horizontal.small,
            rounded.small,
            {
              minWidth: size.large,
            },
            background(borderColorCode),
          ]}>
          <PlatformIcon platform={platform} color={textColorCode} />
        </View>
        <View style={[flex.flexRow, items.center]}>
          <Text
            style={[
              font.size[10],
              font.weight.semibold,
              padding.horizontal.xsmall,
              textColor(borderColorCode),
              data.isSynchronized && [padding.right.small],
            ]}>
            {formatNumberWithSuffix(data?.followersCount || 0)}
          </Text>
        </View>
      </View>
      {data.isSynchronized && (
        <View
          style={[
            position.absolute,
            {
              top: -size.small,
              right: 0,
            },
            rounded.max,
            overflow.hidden,
            background(COLOR.absoluteBlack[0]),
          ]}>
          <View style={[padding.xsmall2, background(COLOR.green[50])]}>
            <SyncIcon
              size="default"
              strokeWidth={2}
              color={COLOR.absoluteBlack[0]}
            />
          </View>
        </View>
      )}
    </Pressable>
  );
};

interface DetailProps extends PressableProps {
  platform: SocialPlatform;
  data: SocialData;
  inverted?: boolean;
}

const Detail = ({data, platform, inverted, ...pressableProps}: DetailProps) => {
  return (
    <Pressable
      style={[
        flex.flex1,
        flex.flexCol,
        self.start,
        border({
          borderWidth: 1,
          color: COLOR.black[20],
        }),
        gap.small,
        rounded.default,
        padding.small,
      ]}
      {...pressableProps}>
      <View
        style={[
          flex.flexRow,
          gap.small,
          items.center,
          rounded.small,
          background(COLOR.black[20]),
          padding.small,
        ]}>
        <PlatformIcon platform={platform} size="default" />
        <View style={[flex.flex1]}>
          <Text
            style={[
              textColor(COLOR.text.neutral.high),
              font.weight.medium,
              font.size[10],
            ]}
            numberOfLines={1}>{`@${data.username}`}</Text>
        </View>
      </View>
      {data.followersCount && (
        <View style={[flex.flexCol, items.center]}>
          <Text
            style={[
              textColor(COLOR.text.neutral.high),
              font.weight.medium,
              font.size[20],
            ]}>
            {formatNumberWithThousandSeparator(data.followersCount)}
          </Text>
          <Text style={[textColor(COLOR.text.neutral.high), font.size[10]]}>
            Followers
          </Text>
        </View>
      )}
      {data.isSynchronized && (
        <View
          style={[
            flex.flexRow,
            justify.center,
            background(COLOR.background.neutral.med),
            padding.xsmall,
            gap.small,
            rounded.small,
          ]}>
          <SyncIcon size="medium" strokeWidth={2} color={COLOR.green[50]} />
          <Text
            style={[
              self.center,
              text.center,
              font.size[5],
              font.weight.medium,
              textColor(COLOR.text.neutral.med),
            ]}>
            {data.lastSyncAt ? (
              <Text>
                Last Update:{' '}
                {formatDateToDayMonthYearHourMinuteShort(
                  new Date(data.lastSyncAt || 0),
                )}
              </Text>
            ) : (
              <Text>Synced</Text>
            )}
          </Text>
        </View>
      )}
    </Pressable>
  );
};
