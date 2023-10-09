import React, {useState} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';

const ChatWidget = ({onSendPhotoPress, onMakeOfferPress}) => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleWidgetVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <View>
      <TouchableOpacity onPress={toggleWidgetVisibility}>
        {/* + Button */}
        <Text>+</Text>
      </TouchableOpacity>
      {isVisible && (
        <View>
          <TouchableOpacity onPress={onSendPhotoPress}>
            {/* Send Photo Button */}
            <Text>Send Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onMakeOfferPress}>
            {/* Make Offer Button */}
            <Text>Make Offer</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default ChatWidget;
