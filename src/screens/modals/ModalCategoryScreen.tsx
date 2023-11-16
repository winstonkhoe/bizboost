import {
  Pressable,
  PressableProps,
  Text,
  DeviceEventEmitter,
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
  NavigationStackProps,
} from '../../navigation/StackNavigation';
import {ScrollView} from 'react-native-gesture-handler';
import {rounded} from '../../styles/BorderRadius';
import Animated from 'react-native-reanimated';
import {padding} from '../../styles/Padding';
import {CustomButton} from '../../components/atoms/Button';
import {dimension} from '../../styles/Dimension';
import {useNavigation} from '@react-navigation/native';
import {closeModal} from '../../utils/modal';
import {SimpleImageCard} from '../../components/molecules/ImageCard';
import {ImageCounterChip} from '../../components/atoms/Chip';
import FastImage from 'react-native-fast-image';

type Props = StackScreenProps<GeneralStack, GeneralNavigation.CategoryModal>;

const ModalCategoryScreen = ({route}: Props) => {
  const navigation = useNavigation<NavigationStackProps>();
  const {initialSelectedCategories, eventType, maxSelection} = route.params;
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
      if (maxSelection && selectedCategories.length >= maxSelection) {
        return;
      }
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const emitChangesAndClose = () => {
    DeviceEventEmitter.emit(eventType, selectedCategories);
    closeModal({
      navigation: navigation,
      triggerEventOnClose: 'close.category',
    });
  };

  const getFilteredCategoriesByParity = (parityType: 'odd' | 'even') => {
    return categories
      .filter((_, index) => index % 2 === (parityType === 'even' ? 0 : 1))
      .map((category: Category, index) => {
        const selectedIndex = selectedCategories.findIndex(
          c => c.id === category.id,
        );
        return (
          <CategoryItem
            key={index}
            category={category}
            isReachLimit={
              maxSelection !== undefined &&
              selectedCategories.length >= maxSelection
            }
            isSelected={selectedIndex !== -1}
            selectedIndex={selectedIndex}
            onPress={() => {
              toggleCategorySelection(category);
            }}
          />
        );
      });
  };

  return (
    <SafeAreaContainer enable>
      <View className="flex-1" style={[flex.flexCol, gap.small]}>
        <View className="items-center" style={[flex.flexRow, gap.default]}>
          <CloseModal closeEventType="category" />
          <Text className="text-lg font-bold">Categories</Text>
        </View>
        <ScrollView contentContainerStyle={{flexGrow: 1}}>
          <VerticalPadding paddingSize="xlarge">
            <HorizontalPadding paddingSize="medium">
              <View style={[flex.flexRow, gap.default]}>
                <View
                  className="flex-1 justify-start"
                  style={[flex.flexCol, gap.default]}>
                  {getFilteredCategoriesByParity('odd')}
                </View>
                <View
                  className="flex-1 justify-start"
                  style={[flex.flexCol, gap.default]}>
                  {getFilteredCategoriesByParity('even')}
                </View>
              </View>
            </HorizontalPadding>
          </VerticalPadding>
        </ScrollView>
        <View style={[flex.flexCol, gap.default, padding.bottom.default]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <HorizontalPadding>
              <View style={[flex.flexRow, gap.default]}>
                {selectedCategories.map((category, index) => (
                  <CategorySelectedPreview key={index} category={category} />
                ))}
              </View>
            </HorizontalPadding>
          </ScrollView>
          <HorizontalPadding>
            <CustomButton
              text="Choose"
              disabled={selectedCategories.length === 0}
              onPress={emitChangesAndClose}
            />
          </HorizontalPadding>
        </View>
      </View>
    </SafeAreaContainer>
  );
};

interface CategoryItemProps extends PressableProps {
  category: Category;
  isSelected: boolean;
  isReachLimit: boolean;
  selectedIndex: number;
}

const CategoryItem = ({
  category,
  isSelected,
  isReachLimit,
  selectedIndex,
  ...props
}: CategoryItemProps) => {
  return (
    <Pressable {...props}>
      <Animated.View
        className="relative overflow-hidden"
        style={[
          flex.flexCol,
          gap.small,
          rounded.default,
          !isSelected &&
            isReachLimit && {
              opacity: 0.5,
            },
        ]}>
        <View className="absolute z-20 top-2 right-2">
          <ImageCounterChip
            selected={isSelected}
            text={selectedIndex + 1}
            size="large"
          />
        </View>
        <SimpleImageCard
          width="full"
          height="xlarge6"
          image={category.image || ''}
          text={category.id || ''}
          dim={isSelected ? 66 : 0}
        />
      </Animated.View>
    </Pressable>
  );
};

interface CategorySelectedPreviewProps {
  category: Category;
}

const CategorySelectedPreview = ({category}: CategorySelectedPreviewProps) => {
  return (
    <View
      className="overflow-hidden"
      style={[dimension.square.xlarge3, rounded.small]}>
      <FastImage
        style={[dimension.full]}
        source={{
          uri: category?.image,
          priority: FastImage.priority.normal,
        }}
        resizeMode={FastImage.resizeMode.cover}
      />
    </View>
  );
};

export default ModalCategoryScreen;
