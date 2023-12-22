import React, {ReactNode} from 'react';
import {View, Text, Pressable} from 'react-native';
import PhotosIcon from '../../assets/vectors/photos.svg';
import MakeOfferIcon from '../../assets/vectors/make-offer.svg';
import {gap} from '../../styles/Gap';
import {MediaUploader} from '../atoms/Input';
import {flex, items, justify, self} from '../../styles/Flex';
import {Options} from 'react-native-image-crop-picker';

import {UserRole} from '../../model/User';
import {useUser} from '../../hooks/user';
import {COLOR} from '../../styles/Color';
import {dimension} from '../../styles/Dimension';
import {background} from '../../styles/BackgroundColor';
import {rounded} from '../../styles/BorderRadius';
import {font, text} from '../../styles/Font';
import {textColor} from '../../styles/Text';
import {padding} from '../../styles/Padding';

interface Props {
  options: Options;
  handleImageUpload: (downloadURL: string) => void;
  handleMakeOffer: () => void;
}

const ChatWidget = ({options, handleImageUpload, handleMakeOffer}: Props) => {
  const {activeRole} = useUser();

  return (
    <View style={[flex.flexRow, gap.medium, padding.medium]}>
      {/* Send Photo Button */}
      <WidgetItem text="Photos">
        <MediaUploader
          targetFolder="chats"
          options={options}
          onUploadSuccess={handleImageUpload}>
          <View
            style={[flex.flex1, flex.flexRow, justify.center, items.center]}>
            <PhotosIcon
              width={30}
              height={30}
              color={COLOR.text.neutral.high}
            />
          </View>
        </MediaUploader>
      </WidgetItem>

      {/* Make Offer Button */}
      {activeRole === UserRole.BusinessPeople && (
        <Pressable onPress={handleMakeOffer}>
          <WidgetItem text="Make Offer">
            <MakeOfferIcon width={30} height={30} />
          </WidgetItem>
        </Pressable>
      )}
    </View>
  );
};

interface WidgetItemProps {
  text: string;
  children: ReactNode;
}

const WidgetItem = ({...props}: WidgetItemProps) => {
  return (
    <View style={[flex.flexCol, gap.small]}>
      <View
        style={[
          dimension.square.xlarge3,
          flex.flexRow,
          justify.center,
          items.center,
          background(COLOR.black[15], 0.5),
          rounded.max,
        ]}>
        {props.children}
      </View>
      <Text
        style={[
          self.center,
          text.center,
          font.size[20],
          textColor(COLOR.text.neutral.high),
        ]}>
        {props.text}
      </Text>
    </View>
  );
};

export default ChatWidget;
