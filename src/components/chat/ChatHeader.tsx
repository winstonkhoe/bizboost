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
import {flex, items, justify} from '../../styles/Flex';
import {padding} from '../../styles/Padding';
import {Recipient} from '../../model/Chat';
import {SkeletonPlaceholder} from '../molecules/SkeletonPlaceholder';
import {BackButtonPlaceholder} from '../molecules/BackButtonPlaceholder';

interface ChatHeaderProps {
  recipient: Recipient | null;
}

const ChatHeader = ({recipient}: ChatHeaderProps) => {
  const navigation = useNavigation<NavigationStackProps>();

  const handleBackButtonPress = () => {
    navigation.navigate(AuthenticatedNavigation.Main);
  };

  return (
    <View
      style={[
        flex.flexRow,
        items.center,
        gap.default,
        padding.default,
        {
          borderBottomColor: COLOR.black[20],
          borderBottomWidth: 1,
        },
      ]}>
      <View style={[dimension.square.xlarge]}>
        <BackButtonPlaceholder icon="back" onPress={handleBackButtonPress} />
      </View>
      <SkeletonPlaceholder isLoading={recipient === null}>
        <View style={[rounded.max, overflow.hidden, dimension.square.xlarge]}>
          <FastImage
            source={getSourceOrDefaultAvatar({
              uri: recipient?.profilePicture,
            })}
            style={[dimension.full]}
          />
        </View>
      </SkeletonPlaceholder>
      <SkeletonPlaceholder isLoading={!recipient?.fullname}>
        <BackButtonLabel text={recipient?.fullname || ''} />
      </SkeletonPlaceholder>
    </View>
  );
};

export default ChatHeader;
