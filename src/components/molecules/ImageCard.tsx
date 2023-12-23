import {Text, View} from 'react-native';
import {SizeType} from '../../styles/Size';
import {dimension} from '../../styles/Dimension';
import {textColor} from '../../styles/Text';
import {COLOR} from '../../styles/Color';
import {padding} from '../../styles/Padding';
import LinearGradient from 'react-native-linear-gradient';
import {background} from '../../styles/BackgroundColor';
import FastImage from 'react-native-fast-image';

interface SimpleImageCardProps {
  image: string;
  width?: SizeType | 'full';
  height?: SizeType | 'full';
  dim?: 0 | 11 | 22 | 33 | 44 | 55 | 66 | 77 | 88;
  text?: string;
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
      <FastImage
        style={[dimension.full]}
        source={{
          uri: image,
          priority: FastImage.priority.high,
        }}
        resizeMode={FastImage.resizeMode.cover}
      />
      <View
        className="absolute z-10 top-0 left-0"
        style={[
          dimension.full,
          background(COLOR.background.neutral.high),
          {
            opacity: dim / 100,
          },
        ]}
      />
      {text && (
        <LinearGradient
          className="absolute z-20 bottom-0 left-0"
          colors={[
            'transparent',
            `${COLOR.absoluteBlack[100]}`,
          ]}
          style={[dimension.width.full, padding.small, padding.top.large]}>
          <Text
            className="font-bold"
            style={[textColor(COLOR.absoluteBlack[0])]}>
            {text}
          </Text>
        </LinearGradient>
      )}
    </View>
  );
};
