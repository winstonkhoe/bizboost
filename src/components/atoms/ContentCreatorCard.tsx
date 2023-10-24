import React from 'react';
import {View, Image, Text} from 'react-native';
import FirebaseStorageImage from '../molecules/FirebaseStorageImage';

interface ContentCreatorCardProps {
  name: string;
  imageUrl: string;
}

const ContentCreatorCard: React.FC<ContentCreatorCardProps> = ({
  name,
  imageUrl,
}) => {
  return (
    <View className="w-1/2 p-2">
      <View className="p-4 bg-white rounded-lg shadow">
        <FirebaseStorageImage
          imageUrl={imageUrl}
          // className="w-24 h-24 mb-2 rounded-full"
        />
        <Text className="text-lg font-bold">{name}</Text>
      </View>
    </View>
  );
};

export default ContentCreatorCard;
