import {useEffect, useState} from 'react';
import {Category} from '../../model/Category';
import {Pressable, View} from 'react-native';
import {flex, items, justify} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import {COLOR} from '../../styles/Color';
import {InternalLink} from '../../components/atoms/Link';
import {dimension} from '../../styles/Dimension';
import {rounded} from '../../styles/BorderRadius';
import {padding} from '../../styles/Padding';
import {background} from '../../styles/BackgroundColor';
import {AddIcon} from '../../components/atoms/Icon';
import {openCategoryModal} from '../../utils/modal';
import {useNavigation} from '@react-navigation/native';
import {NavigationStackProps} from '../../navigation/StackNavigation';
import FastImage from 'react-native-fast-image';
import {FormFieldHelper} from '../../components/atoms/FormLabel';

interface RegisterFocusCategoryProps {
  onCategoriesChange: (categories: Category[]) => void;
}

export const RegisterFocusCategory = ({
  onCategoriesChange,
}: RegisterFocusCategoryProps) => {
  const navigation = useNavigation<NavigationStackProps>();
  const [focusCategories, setFocusCategories] = useState<Category[]>([]);
  const openModalCategory = () => {
    openCategoryModal({
      favoriteCategories: focusCategories,
      setFavoriteCategories: setFocusCategories,
      navigation: navigation,
    });
  };

  const removeFromFocusCategory = (category: Category) => {
    setFocusCategories(prev => {
      return prev.filter(item => item.id !== category.id);
    });
  };

  useEffect(() => {
    onCategoriesChange(focusCategories);
  }, [focusCategories, onCategoriesChange]);

  return (
    <View style={[flex.flex1, flex.flexCol, gap.xlarge2, padding.large]}>
      <View style={[flex.flex1, flex.flexRow, items.center]}>
        <View style={[flex.flex1]}>
          <FormFieldHelper
            title="Category"
            description="Category that you are focusing on"
            type="optional"
          />
        </View>
        <InternalLink text="Add" onPress={openModalCategory} />
      </View>
      <View style={[flex.flexRow, flex.wrap, justify.around, gap.default]}>
        {focusCategories.map((category: Category, index: number) => {
          return (
            <View
              key={index}
              className="relative"
              style={[dimension.square.xlarge5]}>
              <Pressable
                onPress={() => {
                  removeFromFocusCategory(category);
                }}
                className="absolute z-10 top-0 right-0 -translate-x-1/2 -translate-y-1/2 overflow-hidden"
                style={[
                  dimension.square.xlarge,
                  rounded.max,
                  padding.xsmall2,
                  background(COLOR.black[0]),
                  {
                    transform: [
                      {
                        translateX: 10,
                      },
                      {
                        translateY: -10,
                      },
                    ],
                  },
                ]}>
                <View
                  className="rotate-45"
                  style={[
                    flex.flexRow,
                    justify.center,
                    items.center,
                    dimension.full,
                    rounded.max,
                    background(COLOR.background.danger.high),
                  ]}>
                  <AddIcon color={COLOR.black[0]} />
                </View>
              </Pressable>
              <View
                className="overflow-hidden"
                style={[dimension.full, rounded.default]}>
                <FastImage
                  style={[dimension.full]}
                  source={{
                    uri: category.image,
                    priority: FastImage.priority.high,
                  }}
                  resizeMode={'cover'}
                />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};
