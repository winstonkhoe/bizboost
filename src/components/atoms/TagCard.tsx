import React from 'react';
import {Text} from 'react-native';
import {View} from 'react-native';

type Props = {
  text: string;
};
const TagCard = ({text}: Props) => {
  return (
    <View className="border border-green-700 bg-green-50 py-1 px-2 rounded-md">
      <Text className="text-green-700">{text}</Text>
    </View>
  );
};

export default TagCard;
