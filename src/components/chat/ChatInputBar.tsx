import React, {useState} from 'react';
import {View, Text, TextInput, TouchableOpacity} from 'react-native';
import SendButton from '../../assets/vectors/send.svg';
import Keyboard from '../../assets/vectors/keyboard.svg';
import {gap} from '../../styles/Gap';

const ChatInputBar = ({onSendPress, onOpenWidgetPress, isWidgetVisible}) => {
  const [message, setMessage] = useState('');

  const handleSendPress = () => {
    onSendPress(message);
    setMessage(''); // Clear the input field after sending
  };

  const renderOpenWidgetButton = () => {
    if (isWidgetVisible) {
      // when the widget is open
      return (
        <TouchableOpacity onPress={onOpenWidgetPress}>
          <Keyboard width={20} height={20} />
        </TouchableOpacity>
      );
    } else {
      // when the widget is closed
      return (
        <TouchableOpacity onPress={onOpenWidgetPress}>
          <Text className="text-3xl">+</Text>
        </TouchableOpacity>
      );
    }
  };

  return (
    <View
      className="bg-white flex flex-row items-center px-2 py-4 border-t-[0.5px]"
      style={gap.small}>
      {renderOpenWidgetButton()}
      <TextInput
        style={{
          flex: 1,
          borderWidth: 1,
          borderColor: 'gray',
          borderRadius: 10,
          padding: 10,
        }}
        value={message}
        onChangeText={text => setMessage(text)}
        placeholder="Type a message"
      />
      <TouchableOpacity onPress={handleSendPress}>
        <View className="bg-gray-300 p-1 rounded-full">
          <SendButton className="text-white" width={30} height={30} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default ChatInputBar;
