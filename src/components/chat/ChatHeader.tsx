import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import BackNav from '../../assets/vectors/chevron-left.svg';
import {gap} from '../../styles/Gap';
import {COLOR} from '../../styles/Color';
import {
  AuthenticatedNavigation,
  NavigationStackProps,
} from '../../navigation/StackNavigation';
import FastImage from 'react-native-fast-image';
import {font} from '../../styles/Font';
import {textColor} from '../../styles/Text';
import {BackButtonLabel} from '../atoms/Header';
import {rounded} from '../../styles/BorderRadius';
import {overflow} from '../../styles/Overflow';
import {dimension} from '../../styles/Dimension';
import {getSourceOrDefaultAvatar} from '../../utils/asset';
import {flex, items} from '../../styles/Flex';
import {padding} from '../../styles/Padding';

interface Props {
  recipientName: string;
  recipientPicture: string;
}

const ChatHeader = ({recipientName, recipientPicture}: Props) => {
  const navigation = useNavigation<NavigationStackProps>();

  const handleBackButtonPress = () => {
    navigation.navigate(AuthenticatedNavigation.Main);
  };

  return (
    <View
      style={[
        flex.flex1,
        flex.flexRow,
        items.center,
        gap.default,
        padding.default,
        {
          borderBottomColor: COLOR.black[20],
          borderBottomWidth: 1,
        },
      ]}>
      <TouchableOpacity onPress={handleBackButtonPress}>
        <BackNav width={30} height={20} color={COLOR.black[100]} />
      </TouchableOpacity>
      <View style={[rounded.max, overflow.hidden, dimension.square.xlarge]}>
        <FastImage
          source={getSourceOrDefaultAvatar({
            uri: recipientPicture,
          })}
          style={[dimension.full]}
        />
      </View>
      <BackButtonLabel text={recipientName} />
    </View>
  );
};

export default ChatHeader;
