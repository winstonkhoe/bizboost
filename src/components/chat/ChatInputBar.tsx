import React, {useState} from 'react';
import {View, Text, TextInput, TouchableOpacity} from 'react-native';

const ChatInputBar = ({onSendPress, onOpenWidgetPress}) => {
  const [message, setMessage] = useState('');

  const handleSendPress = () => {
    onSendPress(message);
    setMessage(''); // Clear the input field after sending
  };

  return (
    <View className="flex flex-row items-center bg-green-500">
      <TouchableOpacity onPress={onOpenWidgetPress}>
        {/* + Button */}
        <Text>+</Text>
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
        {/* Send Button */}
        <Text>Send</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ChatInputBar;
