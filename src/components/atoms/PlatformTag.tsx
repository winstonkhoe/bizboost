import React from 'react';
import {Text} from 'react-native';
import {View} from 'react-native';
type Props = {
  text: string;
};
const PlatformTag = ({text}: Props) => {
  return (
    <View
      className={
        'border border-green-700 bg-green-100 py-[2px] px-2 rounded-lg'
      }>
      <Text className={'text-green-700 font-semibold text-xs'}>
        {text.toUpperCase()}
      </Text>
    </View>
  );
};

export default PlatformTag;
