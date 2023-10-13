import {Button, Text, View} from 'react-native';
import {User} from '../model/User';

const ProfileScreen = () => {
  return (
    <View className="h-full">
      <View className="container h-full justify-center items-center text-center">
        <Text>This is ProfileScreen</Text>
        <Button
          onPress={() => {
            User.signOut();
          }}
          title={'Sign Out'}
        />
      </View>
    </View>
  );
};

export default ProfileScreen;
