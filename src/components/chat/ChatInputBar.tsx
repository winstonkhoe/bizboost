import React, {useState} from 'react';
import {View, Text, TextInput, TouchableOpacity} from 'react-native';
import SendButton from '../../assets/vectors/send.svg';

const ChatInputBar = ({onSendPress, onOpenWidgetPress}) => {
  const [message, setMessage] = useState('');

  const handleSendPress = () => {
    onSendPress(message);
    setMessage(''); // Clear the input field after sending
  };

  return (
    <View className="flex flex-row items-center gap-3 px-2 py-3">
      <TouchableOpacity onPress={onOpenWidgetPress}>
        <Text className="text-3xl">+</Text>
      </TouchableOpacity>
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
