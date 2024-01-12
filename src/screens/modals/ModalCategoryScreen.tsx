import {Pressable, PressableProps, DeviceEventEmitter} from 'react-native';
import {CloseModal} from '../../components/atoms/Close';
import SafeAreaContainer from '../../containers/SafeAreaContainer';
import {useEffect, useState} from 'react';
import {Category} from '../../model/Category';
import {flex, items} from '../../styles/Flex';
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
import MasonryLayout from '../../components/layouts/MasonryLayout';
import {BackButtonLabel} from '../../components/atoms/Header';
import {overflow} from '../../styles/Overflow';
import {size} from '../../styles/Size';

type Props = StackScreenProps<GeneralStack, GeneralNavigation.CategoryModal>;

const ModalCategoryScreen = ({route}: Props) => {
  const navigation = useNavigation<NavigationStackProps>();
  const {initialSelectedCategories, eventType, maxSelection} = route.params;
  const [selectedCategories, setSelectedCategories] = useState<Category[]>(
    initialSelectedCategories,
  );
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    Category.getAll()
      .then(setCategories)
      .catch(() => setCategories([]));
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

  return (
    <SafeAreaContainer enable>
      <View style={[flex.flex1, flex.flexCol, gap.small]}>
        <View style={[flex.flexRow, gap.small, items.center]}>
          <CloseModal closeEventType="category" />
          <BackButtonLabel text="Categories" />
        </View>
        <ScrollView contentContainerStyle={[padding.horizontal.default]}>
          <MasonryLayout
            data={categories}
            renderItem={(item, itemIndex) => {
              const selectedIndex = selectedCategories.findIndex(
                c => c.id === item.id,
              );
              return (
                <CategoryItem
                  key={itemIndex}
                  category={item}
                  isReachLimit={
                    maxSelection !== undefined &&
                    selectedCategories.length >= maxSelection
                  }
                  isSelected={selectedIndex !== -1}
                  selectedIndex={selectedIndex}
                  onPress={() => {
                    toggleCategorySelection(item);
                  }}
                />
              );
            }}
          />
        </ScrollView>
        <View style={[flex.flexCol, gap.default, padding.bottom.default]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[padding.horizontal.default]}>
            <View style={[flex.flexRow, gap.default]}>
              {selectedCategories.map((category, index) => (
                <CategorySelectedPreview key={index} category={category} />
              ))}
            </View>
          </ScrollView>
          <View style={[padding.horizontal.default]}>
            <CustomButton
              text="Choose"
              disabled={selectedCategories.length === 0}
              onPress={emitChangesAndClose}
            />
          </View>
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
        style={[
          {
            position: 'relative',
          },
          flex.flexCol,
          gap.small,
          rounded.default,
          overflow.hidden,
          !isSelected &&
            isReachLimit && {
              opacity: 0.5,
            },
        ]}>
        <View
          style={[
            {
              position: 'absolute',
              zIndex: 20,
              top: size.small,
              right: size.small,
            },
          ]}>
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
    <View style={[dimension.square.xlarge3, rounded.small, overflow.hidden]}>
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
