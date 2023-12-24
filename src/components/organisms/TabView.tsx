import {ReactNode, useEffect, useRef, useState} from 'react';
import {Pressable, StyleSheet, View, useWindowDimensions} from 'react-native';
import {flex, self} from '../../styles/Flex';
import {ScrollView} from 'react-native-gesture-handler';
import PagerView from 'react-native-pager-view';
import {Text} from 'react-native';
import {font, text} from '../../styles/Font';
import {textColor} from '../../styles/Text';
import {COLOR} from '../../styles/Color';
import {padding} from '../../styles/Padding';
import {dimension} from '../../styles/Dimension';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {gap} from '../../styles/Gap';
import {SizeType, size} from '../../styles/Size';
import {background} from '../../styles/BackgroundColor';

interface TabViewProps {
  labels: string[];
  children: ReactNode[];
}

export const TabView = ({labels, children}: TabViewProps) => {
  const pagerViewRef = useRef<PagerView>(null);
  const windowDimension = useWindowDimensions();
  const [activeIndexTab, setActiveIndexTab] = useState(0);
  const indicatorPosition = useSharedValue(0); // Add this line
  const paddingSizeType: SizeType = 'default';
  const labelGapSizeType: SizeType = 'small';
  const tabWidth =
    (windowDimension.width -
      size[paddingSizeType] * 2 -
      size[labelGapSizeType] * (children.length - 1)) /
    Math.max(children.length, 1);
  const tabWidthStyle = StyleSheet.create({
    tabWidth: {
      width: tabWidth,
    },
  }).tabWidth;

  useEffect(() => {
    pagerViewRef.current?.setPage(activeIndexTab);
    indicatorPosition.value = withTiming(
      activeIndexTab * (tabWidth + size[labelGapSizeType]),
    ); // Add this line
  }, [activeIndexTab, pagerViewRef, indicatorPosition, tabWidth]);

  const animatedStyle = useAnimatedStyle(() => {
    // Add this block
    return {
      transform: [{translateX: indicatorPosition.value}],
    };
  });

  return (
    <View style={[flex.flex1, flex.flexCol, gap.default]}>
      <View
        style={[
          {
            borderBottomColor: COLOR.black[20],
            borderBottomWidth: 1,
          },
        ]}>
        <ScrollView
          style={[flex.flex1, padding.top.default]}
          contentContainerStyle={[
            flex.flexRow,
            gap[labelGapSizeType],
            padding.horizontal[paddingSizeType],
            {
              position: 'relative',
            },
          ]}>
          {children.map((child, childIndex) => (
            <Pressable
              key={childIndex}
              style={[tabWidthStyle, padding.vertical.default]}
              onPress={() => {
                setActiveIndexTab(childIndex);
              }}>
              <Text
                style={[
                  self.center,
                  text.center,
                  font.size[20],
                  textColor(COLOR.text.neutral.high),
                  font.weight.medium,
                ]}>
                {labels?.[childIndex]}
              </Text>
            </Pressable>
          ))}
          <Animated.View
            style={[
              animatedStyle,
              {
                position: 'absolute',
                bottom: 0,
                left: size[paddingSizeType],
                borderTopLeftRadius: size.medium,
                borderTopRightRadius: size.medium,
              },
              background(COLOR.green[50]),
              dimension.height.xsmall2,
              tabWidthStyle,
            ]}
          />
        </ScrollView>
      </View>
      <PagerView
        style={[flex.flex1]}
        ref={pagerViewRef}
        onPageSelected={e => {
          setActiveIndexTab(e.nativeEvent.position);
        }}>
        {children.map((child, childIndex) => (
          <View key={childIndex} style={[flex.flex1]}>
            {child}
          </View>
        ))}
      </PagerView>
    </View>
  );
};
