import {Pressable, Text, View} from 'react-native';
import {flex} from '../../styles/Flex';
import DiagonalArrow from '../../assets/vectors/diagonal-arrow.svg';
import {gap} from '../../styles/Gap';
import {background} from '../../styles/BackgroundColor';
import {COLOR} from '../../styles/Color';
import {rounded} from '../../styles/BorderRadius';
import {useAppDispatch, useAppSelector} from '../../redux/hooks';
import {
  closeSearchPage,
  updateSearchTerm,
} from '../../redux/slices/searchSlice';
import {textColor} from '../../styles/Text';
import {useNavigation} from '@react-navigation/native';
import {
  TabNavigation,
  TabNavigationProps,
} from '../../navigation/TabNavigation';
import React from 'react';
import {useUser} from '../../hooks/user';
import {UserRole} from '../../model/User';
import {SearchIcon} from '../atoms/Icon';

interface Props {
  itemValue: string;
}

const AutoCompleteSearchItem = ({itemValue}: Props) => {
  const navigation = useNavigation<TabNavigationProps>();
  const dispatch = useAppDispatch();
  const {activeRole} = useUser();
  const isContentCreator = activeRole === UserRole.ContentCreator;
  const isBusinessPeople = activeRole === UserRole.BusinessPeople;
  const {searchTerm} = useAppSelector(state => state.search);
  const loweredItemValue = itemValue.toLocaleLowerCase();
  const loweredSearchTerm = searchTerm.toLocaleLowerCase();
  const regEscape = (v: string) =>
    v.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  const splittedItemValues = loweredItemValue.split(
    new RegExp(regEscape(loweredSearchTerm), 'ig'),
  );

  const pressItem = () => {
    dispatch(updateSearchTerm(loweredItemValue));
    dispatch(closeSearchPage());
    if (isContentCreator) {
      navigation.navigate(TabNavigation.Campaigns);
    }
    if (isBusinessPeople) {
      navigation.navigate(TabNavigation.ContentCreators);
    }
  };

  return (
    <View
      className="w-full h-10 items-center"
      style={[flex.flexRow, gap.medium]}>
      <Pressable
        className="flex-1"
        style={[flex.flexRow, gap.medium]}
        onPress={pressItem}>
        <View
          className="items-center p-2"
          style={[
            flex.flexRow,
            background(COLOR.black[100], 0.1),
            rounded.max,
          ]}>
          <SearchIcon width={14} height={14} color={COLOR.text.neutral.high} />
        </View>
        <View className="flex-1" style={[flex.flexRow]}>
          {splittedItemValues?.map((splitItemValue: string, index: number) => {
            return (
              <React.Fragment key={index}>
                <Text
                  className="text-base tracking-wide font-bold"
                  style={[textColor(COLOR.text.neutral.high)]}>
                  {splitItemValue}
                </Text>
                {index !== splittedItemValues.length - 1 && (
                  <Text
                    className="text-base tracking-wide"
                    style={[textColor(COLOR.text.neutral.med)]}>
                    {loweredSearchTerm}
                  </Text>
                )}
              </React.Fragment>
            );
          })}
        </View>
      </Pressable>
      <Pressable
        className="rotate-180"
        onPress={() => dispatch(updateSearchTerm(loweredItemValue))}>
        <DiagonalArrow width={14} height={14} color={COLOR.black[100]} />
      </Pressable>
    </View>
  );
};

export {AutoCompleteSearchItem};
