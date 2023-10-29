import {Image, Text, View} from 'react-native';
import {SizeType} from '../../styles/Size';
import {dimension} from '../../styles/Dimension';
import {textColor} from '../../styles/Text';
import {COLOR} from '../../styles/Color';
import {padding} from '../../styles/Padding';
import LinearGradient from 'react-native-linear-gradient';

interface SimpleImageCardProps {
  image: string;
  width?: SizeType | 'full';
  height?: SizeType | 'full';
  text: string;
}

export const SimpleImageCard = ({
  image,
  text,
  width = 'xlarge6',
  height = 'xlarge3',
}: SimpleImageCardProps) => {
  return (
    <View style={[dimension.width[width], dimension.height[height]]}>
      <Image
        style={[dimension.full]}
        source={{
          uri: image,
        }}
      />
      <LinearGradient
        className="absolute bottom-0 left-0"
        colors={[`${COLOR.black[60]}11`, `${COLOR.black[100]}`]}
        style={[dimension.width.full, padding.small, padding.top.large]}>
        <Text className="font-bold" style={[textColor(COLOR.black[0])]}>
          {text}
        </Text>
      </LinearGradient>
    </View>
  );
};
