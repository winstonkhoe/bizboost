import {firebase} from '@react-native-firebase/storage';
import React, {useEffect, useState} from 'react';
import {Image, StyleSheet, View} from 'react-native';

interface FirebaseStorageImageProps {
  imageUrl: string;
}

const FirebaseStorageImage: React.FC<FirebaseStorageImageProps> = ({
  imageUrl,
}) => {
  const [imageUri, setImageUri] = useState('');

  useEffect(() => {
    const storageRef = firebase.storage().refFromURL(imageUrl);

    storageRef
      .getDownloadURL()
      .then(url => {
        setImageUri(url);
      })
      .catch(error => {
        console.error('Error fetching image from Firebase Storage:', error);
      });
  }, [imageUrl]);

  return (
    <View style={styles.container}>
      {imageUri && <Image source={{uri: imageUri}} style={styles.image} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 200,
  },
});

export default FirebaseStorageImage;
