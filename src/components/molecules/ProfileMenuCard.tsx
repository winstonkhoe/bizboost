import {Text, View} from 'react-native';
import {shadow} from '../../styles/Shadow';
import {rounded} from '../../styles/BorderRadius';
import {ReactNode} from 'react';
import {AnimatedPressable} from '../atoms/AnimatedPressable';
import {background} from '../../styles/BackgroundColor';
import {COLOR} from '../../styles/Color';
import {border} from '../../styles/Border';
import {flex, justify} from '../../styles/Flex';
import {padding} from '../../styles/Padding';
import {font} from '../../styles/Font';
import {gap} from '../../styles/Gap';
import {textColor} from '../../styles/Text';

type Props = {
  title: string;
  subtitle: string;
  icon?: ReactNode;
  handleOnClick: () => void;
};
const ProfileMenuCard = ({title, subtitle, icon, handleOnClick}: Props) => {
  return (
    <View className="w-[45%] my-2 mx-1">
      <AnimatedPressable
        scale={0.95}
        onPress={handleOnClick}
        style={[rounded.medium]}>
        <View
          className="h-48 overflow-hidden"
          style={[
            flex.flexCol,
            gap.default,
            padding.top.medium,
            padding.bottom.default,
            padding.horizontal.default,
            justify.end,
            rounded.medium,
            background(COLOR.background.neutral.default),
            border({
              borderWidth: 1,
              color: COLOR.black[20],
            }),
          ]}>
          {icon}
          <View style={[flex.flexCol, gap.xsmall2]}>
            <Text
              className="font-semibold"
              style={[font.size[30], textColor(COLOR.text.neutral.high)]}>
              {title}
            </Text>
            <Text
              style={[font.size[20], textColor(COLOR.text.neutral.med)]}
              numberOfLines={2}>
              {subtitle}
            </Text>
          </View>
        </View>
      </AnimatedPressable>
    </View>
  );
};

export default ProfileMenuCard;
