import React, {useState} from 'react';

import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  Pressable,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ScaledImage from './ScaledImage';
import {flex} from '../../styles/Flex';
import {
  AuthenticatedNavigation,
  NavigationStackProps,
} from '../../navigation/StackNavigation';
import {useNavigation} from '@react-navigation/native';

interface ContentCreatorCardProps {
  id: string;
  name: string;
  imageUrl: string;
  categories?: string[];
}

const ContentCreatorCard: React.FC<ContentCreatorCardProps> = ({
  id,
  name,
  imageUrl,
  categories,
}) => {
  const navigation = useNavigation<NavigationStackProps>();

  return (
    <View style={[styles.cardContainer]}>
      <Pressable
        onPress={() => {
          navigation.navigate(AuthenticatedNavigation.ContentCreatorDetail, {
            contentCreatorId: id,
          });
        }}>
        <View style={{width: Dimensions.get('window').width * 0.45}}>
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
      </Pressable>
      <ScrollView horizontal style={styles.categoriesContainer}>
        <View style={flex.flexRow} className="pt-1 gap-x-1">
          {categories &&
            categories.map((category, idx) => (
              <View key={idx} style={styles.categoryContainer}>
                <Text style={styles.category}>{category}</Text>
              </View>
            ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: Dimensions.get('window').width * 0.45,
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
    width: Dimensions.get('window').width * 0.45,
    padding: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  categoriesContainer: {
    width: Dimensions.get('window').width * 0.45,
    paddingVertical: 5,
  },
  categoryContainer: {
    backgroundColor: 'rgba(37,136,66, 1)',
    // backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 5,
    borderRadius: 5,
  },
  category: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'normal',
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
