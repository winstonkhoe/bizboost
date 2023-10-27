import React, {useState} from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ScaledImage from './ScaledImage';

interface ContentCreatorCardProps {
  name: string;
  imageUrl: string;
}

const ContentCreatorCard: React.FC<ContentCreatorCardProps> = ({
  name,
  imageUrl,
}) => {
  return (
    <View style={[styles.cardContainer]}>
      <ScaledImage
        uri={imageUrl}
        style={styles.image}
        width={Dimensions.get('window').width * 0.45}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0, 0, 0, 0.8)']}
        style={styles.nameContainer}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.location}>Tangerang, Indonesia</Text>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    borderRadius: 10,
    resizeMode: 'contain',
  },
  nameContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  name: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  location: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'normal',
    textAlign: 'left',
  },
});

export default ContentCreatorCard;
