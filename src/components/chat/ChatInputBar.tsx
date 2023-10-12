import React, {useState} from 'react';
import {View, Text, TextInput, TouchableOpacity} from 'react-native';
import SendButton from '../../assets/vectors/send.svg';
import Keyboard from '../../assets/vectors/keyboard.svg';
import {gap} from '../../styles/Gap';
import {flex} from '../../styles/Flex';

const ChatInputBar = ({onSendPress, onOpenWidgetPress, isWidgetVisible}) => {
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
      className="bg-white flex flex-row items-center px-3"
      style={gap.default}>
      {isWidgetVisible ? (
        <TouchableOpacity onPress={onOpenWidgetPress}>
          <Keyboard width={20} height={20} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={onOpenWidgetPress}>
          <Text className="text-3xl">+</Text>
        </TouchableOpacity>
      )}
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
        <View style={sendButtonStyle} className="bg-gray-300 p-2 rounded-full">
          <SendButton className="text-white" width={20} height={20} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default ChatInputBar;
