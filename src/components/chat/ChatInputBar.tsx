import React, {useState} from 'react';
import {View, Text, TextInput, TouchableOpacity, Platform} from 'react-native';
import SendButton from '../../assets/vectors/send.svg';
import Keyboard from '../../assets/vectors/keyboard.svg';
import {gap} from '../../styles/Gap';
import {background} from '../../styles/BackgroundColor';
import {COLOR} from '../../styles/Color';
import {flex, items} from '../../styles/Flex';
import {padding} from '../../styles/Padding';
import {font} from '../../styles/Font';
import {textColor} from '../../styles/Text';
import {border} from '../../styles/Border';
import {rounded} from '../../styles/BorderRadius';

interface Props {
  onSendPress: (message: string) => void;
  onOpenWidgetPress: () => void;
  isWidgetVisible: boolean;
}

const ChatInputBar = ({
  onSendPress,
  onOpenWidgetPress,
  isWidgetVisible,
}: Props) => {
  const [message, setMessage] = useState('');

  const handleSendPress = () => {
    onSendPress(message);
    setMessage(''); // Clear the input field after sending
  };

  // Define a dynamic style for the send button view
  const sendButtonStyle = {
    backgroundColor: message ? '#2EA72B' : 'rgb(209 213 219)',
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
      <TouchableOpacity onPress={onOpenWidgetPress}>
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
          border({
            borderWidth: 1,
            color: COLOR.black[25],
            opacity: 0.7,
          }),
          rounded.medium,
          padding.horizontal.default,
          padding.vertical.default,
          font.size[20],
          font.lineHeight[20],
          Platform.OS === 'android' && [padding.vertical.small],
        ]}
        value={message}
        onChangeText={text => setMessage(text)}
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
