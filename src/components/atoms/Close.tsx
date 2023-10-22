import CrossMarkThin from '../../assets/vectors/cross-mark-thin.svg';
import ChevronLeft from '../../assets/vectors/chevron-left.svg';
import {flex} from '../../styles/Flex';
import {rounded} from '../../styles/BorderRadius';
import {background} from '../../styles/BackgroundColor';
import {COLOR} from '../../styles/Color';
import {border} from '../../styles/Border';
import {useNavigation} from '@react-navigation/native';
import {Pressable} from 'react-native';

interface CloseStackProps {
  showBorder?: boolean;
}

export const CloseModal = ({showBorder}: CloseStackProps) => {
  const navigation = useNavigation();
  return (
    <Pressable
      onPress={() => navigation.goBack()}
      className="w-11 h-11 justify-center items-center"
      style={[
        flex.flexRow,
        rounded.max,
        background(COLOR.white),
        showBorder &&
          border({
            borderWidth: 0.6,
            color: COLOR.black[100],
            opacity: 0.6,
          }),
      ]}>
      <CrossMarkThin width={30} height={30} color={COLOR.black[100]} />
    </Pressable>
  );
};

export const BackButton = ({showBorder}: CloseStackProps) => {
  const navigation = useNavigation();
  return (
    <Pressable
      onPress={() => navigation.goBack()}
      className="w-11 h-11 justify-center items-center"
      style={[
        flex.flexRow,
        rounded.max,
        background(COLOR.white),
        showBorder &&
          border({
            borderWidth: 0.6,
            color: COLOR.black[100],
            opacity: 0.6,
          }),
      ]}>
      <ChevronLeft width={30} height={30} color={COLOR.black[100]} />
    </Pressable>
  );
};
