import React, {useState} from 'react';
import {View, Text, TextInput, TouchableOpacity, Platform} from 'react-native';
import SendButton from '../../assets/vectors/send.svg';
import Keyboard from '../../assets/vectors/keyboard.svg';
import {gap} from '../../styles/Gap';
import {background} from '../../styles/BackgroundColor';
import {COLOR} from '../../styles/Color';
import {flex, items, self} from '../../styles/Flex';
import {padding} from '../../styles/Padding';
import {font, lineHeight} from '../../styles/Font';
import {textColor} from '../../styles/Text';
import {border} from '../../styles/Border';
import {rounded} from '../../styles/BorderRadius';
import {size} from '../../styles/Size';

interface Props {
  onSendPress: (message: string) => void;
  onWidgetVisibilityChange: (visibility: boolean) => void;
  isWidgetVisible: boolean;
}

const ChatInputBar = ({
  onSendPress,
  onWidgetVisibilityChange,
  isWidgetVisible,
}: Props) => {
  const [message, setMessage] = useState('');

  const handleSendPress = () => {
    onSendPress(message);
    setMessage(''); // Clear the input field after sending
  };

  const dismissWidgetVisibility = () => {
    onWidgetVisibilityChange(false);
  };

  return (
    <View
      style={[
        flex.flexRow,
        items.center,
        padding.horizontal.default,
        gap.default,
        background(COLOR.background.neutral.default),
      ]}>
      <TouchableOpacity
        onPress={() => {
          console.log('widgetVisibilityChange', !isWidgetVisible);
          onWidgetVisibilityChange(!isWidgetVisible);
        }}>
        {isWidgetVisible ? (
          <Keyboard width={20} height={20} color={COLOR.text.neutral.high} />
        ) : (
          <Text style={[font.size[80], textColor(COLOR.text.neutral.med)]}>
            +
          </Text>
        )}
      </TouchableOpacity>
      <TextInput
        style={[
          flex.flex1,
          {
            maxHeight: lineHeight[20] * 5,
          },
          rounded.medium,
          border({
            borderWidth: 1,
            color: COLOR.black[25],
            opacity: 0.7,
          }),
          padding.default,
          font.size[20],
          font.lineHeight[20],
          Platform.OS === 'android' && [padding.vertical.small],
        ]}
        multiline
        textAlignVertical="center"
        value={message}
        onChangeText={setMessage}
        onFocus={dismissWidgetVisibility}
        placeholder="Type a message"
      />
      <TouchableOpacity onPress={handleSendPress}>
        <View
          style={[
            !!message && [background(COLOR.green[50])],
            !message && [background(COLOR.black[20])],
            rounded.max,
            padding.small,
          ]}>
          <SendButton width={20} height={20} color={COLOR.absoluteBlack[0]} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default ChatInputBar;
