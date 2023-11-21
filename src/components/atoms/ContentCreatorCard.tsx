import React from 'react';
import {View, Text, StyleSheet, Dimensions, Pressable} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ScaledImage from './ScaledImage';
import {
  AuthenticatedNavigation,
  NavigationStackProps,
} from '../../navigation/StackNavigation';
import {useNavigation} from '@react-navigation/native';
import {flex} from '../../styles/Flex';
import StarIcon from '../../assets/vectors/star-filled.svg';
import {FontWidth} from '@shopify/react-native-skia';
import {font, fontSize} from '../../styles/Font';

interface ContentCreatorCardProps {
  id: string;
  name: string;
  imageUrl: string;
  rating: number;
  categories?: string[];
}
const ContentCreatorCard: React.FC<ContentCreatorCardProps> = React.memo(
  ({id, name, imageUrl, rating, categories}) => {
    console.log(name, imageUrl);
    const navigation = useNavigation<NavigationStackProps>();

    const renderCategories = () => {
      const MAX_DISPLAY_CATEGORIES = 1;

      if (!categories || categories.length === 0) {
        return null;
      }

      const visibleCategories = categories.slice(0, MAX_DISPLAY_CATEGORIES);
      const remainingCategories = categories.slice(MAX_DISPLAY_CATEGORIES);

      return (
        <View style={styles.categoriesContainer}>
          {visibleCategories.map((category, idx) => (
            <View key={idx} style={styles.categoryContainer}>
              <Text style={styles.category}>{category}</Text>
            </View>
          ))}
          {remainingCategories.length > 0 && (
            <View style={styles.categoryContainer}>
              <Text style={styles.category}>+{remainingCategories.length}</Text>
            </View>
          )}
        </View>
      );
    };

    return (
      <View style={styles.cardContainer}>
        <Pressable
          onPress={() => {
            navigation.navigate(AuthenticatedNavigation.ContentCreatorDetail, {
              contentCreatorId: id,
            });
          }}>
          <View style={{width: Dimensions.get('window').width * 0.45}}>
            {rating && (
              <View style={styles.ratingContainer}>
                <View
                  style={flex.flexRow}
                  className="p-1 justify-end items-center rounded-md bg-black">
                  <StarIcon width={10} height={10} fill={'rgb(245, 208, 27)'} />
                  <Text style={styles.rating}>{rating}</Text>
                </View>
              </View>
            )}
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
          {renderCategories()}
        </Pressable>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  cardContainer: {
    width: Dimensions.get('window').width * 0.45,
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
  ratingContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 5,
    paddingTop: 5,
    zIndex: 1,
  },
  categoriesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 3,
    paddingTop: 5,
    zIndex: 1,
  },
  categoryContainer: {
    backgroundColor: 'rgba(37,136,66, 1)',
    paddingHorizontal: 5,
    borderRadius: 5,
    marginRight: 5,
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
  rating: {
    fontSize: 10,
    paddingLeft: 2,
    color: 'white',
  },
  location: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'normal',
    textAlign: 'left',
  },
});

export default ContentCreatorCard;
