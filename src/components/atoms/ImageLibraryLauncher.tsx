import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {
  ImageLibraryOptions,
  launchImageLibrary,
} from 'react-native-image-picker';
import {flex} from '../../styles/Flex';

interface ImageLibraryLauncherProps {
  icon: React.ReactNode;
  options: ImageLibraryOptions;
}

const ImageLibraryLauncher: React.FC<ImageLibraryLauncherProps> = ({
  icon,
  options,
}) => {
  const handleImageUpload = () => {
    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('Image picker was canceled');
      } else if (response.errorCode) {
        console.log('Image picker error: ', response.errorMessage);
      }
    });
  };

  return (
    <TouchableOpacity onPress={handleImageUpload}>
      <View style={[flex.flexRow]} className="items-center">
        {icon}
      </View>
    </TouchableOpacity>
  );
};

export default ImageLibraryLauncher;
