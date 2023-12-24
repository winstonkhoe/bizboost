import {Text, View} from 'react-native';
import {SocialData, SocialPlatform} from '../../model/User';
import {flex, items, justify} from '../../styles/Flex';
import {PlatformIcon} from './Icon';
import {padding} from '../../styles/Padding';
import {rounded} from '../../styles/BorderRadius';
import {border} from '../../styles/Border';
import {COLOR} from '../../styles/Color';
import {textColor} from '../../styles/Text';
import {font} from '../../styles/Font';
import {formatNumberWithSuffix} from '../../utils/number';
import {background} from '../../styles/BackgroundColor';
import {dimension} from '../../styles/Dimension';
import {overflow} from '../../styles/Overflow';
import {size} from '../../styles/Size';
import {gap} from '../../styles/Gap';

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
  const textColorCode = inverted
    ? COLOR.absoluteBlack[0]
    : COLOR.absoluteBlack[90];
  const borderColorCode = inverted
    ? COLOR.absoluteBlack[90]
    : COLOR.absoluteBlack[0];
  return (
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
          {
            minWidth: size.large,
          },
          background(borderColorCode),
        ]}>
        <PlatformIcon platform={platform} color={textColorCode} />
        {type === 'detail' && (
          <Text
            style={[
              font.size[20],
              textColor(textColorCode),
              {
                maxWidth: size.xlarge8,
              },
            ]}
            numberOfLines={1}>
            {`@${data?.username}`}
          </Text>
        )}
      </View>
      <View style={[flex.flexRow, items.center]}>
        <Text
          style={[
            font.size[10],
            font.weight.semibold,
            padding.horizontal.small,
            textColor(borderColorCode),
          ]}>
          {formatNumberWithSuffix(data?.followersCount || 0)}
        </Text>
      </View>
    </View>
  );
};
