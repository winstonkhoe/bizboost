import {Image, Text, View} from 'react-native';
import {SizeType} from '../../styles/Size';
import {dimension} from '../../styles/Dimension';
import {textColor} from '../../styles/Text';
import {COLOR} from '../../styles/Color';
import {padding} from '../../styles/Padding';
import LinearGradient from 'react-native-linear-gradient';
import {background} from '../../styles/BackgroundColor';

interface SimpleImageCardProps {
  image: string;
  width?: SizeType | 'full';
  height?: SizeType | 'full';
  dim?: 0 | 11 | 22 | 33 | 44 | 55 | 66 | 77 | 88;
  text: string;
}

export const SimpleImageCard = ({
  image,
  text,
  width = 'xlarge6',
  height = 'xlarge3',
  dim = 0,
}: SimpleImageCardProps) => {
  return (
    <View
      className="relative"
      style={[dimension.width[width], dimension.height[height]]}>
      <Image
        style={[dimension.full]}
        source={{
          uri: image,
        }}
      />
      <View
        className="absolute z-10 top-0 left-0"
        style={[
          dimension.full,
          background(`${COLOR.background.neutral.high}${dim}`),
        ]}
      />
      <LinearGradient
        className="absolute z-20 bottom-0 left-0"
        colors={[`${COLOR.black[60]}11`, `${COLOR.black[100]}`]}
        style={[dimension.width.full, padding.small, padding.top.large]}>
        <Text className="font-bold" style={[textColor(COLOR.black[0])]}>
          {text}
        </Text>
      </LinearGradient>
    </View>
  );
};