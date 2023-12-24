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

interface SocialCardProps {
  platform: SocialPlatform;
  data: SocialData;
}

export const SocialCard = ({platform, data}: SocialCardProps) => {
  return (
    <View
      style={[
        flex.flexRow,
        items.center,
        rounded.default,
        overflow.hidden,
        border({
          borderWidth: 1,
          color: COLOR.absoluteBlack[0],
        }),
      ]}>
      <View
        style={[
          flex.flexRow,
          justify.center,
          items.center,
          dimension.width.large,
          dimension.height.medium,
          background(COLOR.background.neutral.default),
        ]}>
        <PlatformIcon platform={platform} />
      </View>
      <Text
        style={[
          font.size[10],
          font.weight.semibold,
          textColor(COLOR.absoluteBlack[0]),
          padding.horizontal.small,
        ]}>
        {formatNumberWithSuffix(data?.followersCount || 0)}
      </Text>
    </View>
  );
};
