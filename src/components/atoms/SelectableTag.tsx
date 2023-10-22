import React from 'react';
import {Pressable, PressableProps, Text} from 'react-native';

interface Props extends PressableProps {
  text: string;
  isSelected?: boolean;
}
const SelectableTag = ({text, isSelected = false, ...props}: Props) => {
  return (
    <Pressable
      {...props}
      className={`border ${
        isSelected ? 'border-green-700 bg-green-100' : 'border-gray-500'
      } py-1 px-2 rounded-lg`}>
      <Text
        className={`${
          isSelected ? 'text-green-700' : 'text-gray-500'
        } font-semibold`}>
        {text}
      </Text>
    </Pressable>
  );
};

export default SelectableTag;
