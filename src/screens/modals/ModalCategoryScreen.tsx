import {
  Pressable,
  PressableProps,
  Text,
  DeviceEventEmitter,
  Image,
} from 'react-native';
import {CloseModal} from '../../components/atoms/Close';
import SafeAreaContainer from '../../containers/SafeAreaContainer';
import {
  HorizontalPadding,
  VerticalPadding,
} from '../../components/atoms/ViewPadding';
import {useEffect, useState} from 'react';
import {Category} from '../../model/Category';
import {flex} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import {View} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {
  GeneralNavigation,
  GeneralStack,
} from '../../navigation/StackNavigation';
import {Checkbox} from '../../components/atoms/Checkbox';
import {ScrollView} from 'react-native-gesture-handler';
import {textColor} from '../../styles/Text';
import {COLOR} from '../../styles/Color';
import {rounded} from '../../styles/BorderRadius';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  horizontalPadding,
  padding,
  verticalPadding,
} from '../../styles/Padding';
import {background} from '../../styles/BackgroundColor';
import {shadow} from '../../styles/Shadow';

type Props = StackScreenProps<GeneralStack, GeneralNavigation.CategoryModal>;

const ModalCategoryScreen = ({route}: Props) => {
  const {initialSelectedCategories, eventType} = route.params;
  const [selectedCategories, setSelectedCategories] = useState<Category[]>(
    initialSelectedCategories,
  );
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    Category.getAll().then(setCategories);
  }, []);

  const toggleCategorySelection = (category: Category) => {
    if (selectedCategories.find(cat => cat.id === category.id)) {
      setSelectedCategories(
        selectedCategories.filter(cat => cat.id !== category.id),
      );
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  useEffect(() => {
    DeviceEventEmitter.emit(eventType, selectedCategories);
  }, [selectedCategories, eventType]);

  return (
    <SafeAreaContainer>
      <View className="flex-1" style={[flex.flexCol, gap.small]}>
        <View className="items-center" style={[flex.flexRow, gap.default]}>
          <CloseModal closeEventType="category" />
          <Text className="text-lg font-bold">Categories</Text>
        </View>
        <ScrollView className="flex-1" contentContainerStyle={{flexGrow: 1}}>
          <VerticalPadding paddingSize="xlarge">
            <HorizontalPadding paddingSize="medium">
              <View style={[flex.flexRow, gap.default]}>
                <View
                  className="flex-1 justify-start"
                  style={[flex.flexCol, gap.default]}>
                  {categories
                    .filter((_, index) => index % 2 === 0)
                    .map((category: Category, index) => (
                      <CategoryItem
                        key={index}
                        category={category}
                        isSelected={
                          !!selectedCategories.find(
                            cat => cat.id === category.id,
                          )
                        }
                        onPress={() => {
                          toggleCategorySelection(category);
                        }}
                      />
                    ))}
                </View>
                <View
                  className="flex-1 justify-start"
                  style={[flex.flexCol, gap.default]}>
                  {categories
                    .filter((_, index) => index % 2 !== 0)
                    .map((category: Category, index) => (
                      <CategoryItem
                        key={index}
                        category={category}
                        isSelected={
                          !!selectedCategories.find(
                            cat => cat.id === category.id,
                          )
                        }
                        onPress={() => {
                          toggleCategorySelection(category);
                        }}
                      />
                    ))}
                </View>
              </View>
            </HorizontalPadding>
          </VerticalPadding>
        </ScrollView>
      </View>
    </SafeAreaContainer>
  );
};

interface CategoryItemProps extends PressableProps {
  category: Category;
  isSelected: boolean;
}

const CategoryItem = ({category, isSelected, ...props}: CategoryItemProps) => {
  const selectedProgress = useSharedValue(isSelected ? 1 : 0);
  useEffect(() => {
    selectedProgress.value = withTiming(isSelected ? 1 : 0, {
      duration: 300,
    });
  }, [isSelected, selectedProgress]);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      borderColor: interpolateColor(
        selectedProgress.value,
        [0, 1],
        [COLOR.black[25], COLOR.green[50]],
      ),
    };
  });
  return (
    <Pressable {...props}>
      <Animated.View
        className="relative overflow-hidden"
        style={[
          flex.flexCol,
          gap.small,
          rounded.default,
          animatedStyle,
          {
            borderWidth: 1.5,
          },
        ]}>
        <View className="absolute z-20 top-2 left-2">
          <Checkbox checked={isSelected} />
        </View>
        <View className="relative w-full h-24">
          <View
            className="absolute z-10 top-0 left-0 w-full h-full"
            style={[
              !isSelected && background(COLOR.background.neutral.med, 0.5),
            ]}
          />
          <Image
            className="w-full h-full"
            source={{
              uri: category.image,
            }}
          />
        </View>
        <View style={[verticalPadding.xsmall2, horizontalPadding.default]}>
          <Text
            className="text-sm font-semibold"
            style={[
              isSelected
                ? textColor(COLOR.text.neutral.high)
                : textColor(COLOR.text.neutral.med),
            ]}>
            {category.id}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
};

export default ModalCategoryScreen;
