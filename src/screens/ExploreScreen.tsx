import {
  FlatList,
  Pressable,
  StatusBar,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Video from 'react-native-video';
import {useState} from 'react';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import {flex, items, justify} from '../styles/Flex';
import {rounded} from '../styles/BorderRadius';
import {dimension} from '../styles/Dimension';
import FastImage from 'react-native-fast-image';
import {font} from '../styles/Font';
import {textColor} from '../styles/Text';
import {COLOR} from '../styles/Color';
import {gap} from '../styles/Gap';
import {background} from '../styles/BackgroundColor';
import {padding} from '../styles/Padding';
import {useIsFocused, useNavigation} from '@react-navigation/core';
import {useContent} from '../hooks/content';
import {ContentView} from '../model/Content';

const ExploreScreen = () => {
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const {contents} = useContent();
  const isFocused = useIsFocused();
  const bottomTabHeight = useBottomTabBarHeight();
  const windowDimension = useWindowDimensions();

  return (
    <FlatList
      data={contents}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      renderItem={({item, index}) => (
        <ExploreItem
          content={item}
          active={isFocused && activeVideoIndex === index}
        />
      )}
      onScroll={e => {
        const index = Math.round(
          e.nativeEvent.contentOffset.y /
            (windowDimension.height - bottomTabHeight),
        );
        setActiveVideoIndex(index);
      }}
    />
  );
};

interface ExploreItemProps {
  content: ContentView;
  active: boolean;
}

const ExploreItem = ({content: contentView, active}: ExploreItemProps) => {
  const bottomTabHeight = useBottomTabBarHeight();
  const windowDimension = useWindowDimensions();
  const statusBarHeight = StatusBar.currentHeight || 0;
  return (
    <View
      style={[
        {
          width: windowDimension.width,
          height: windowDimension.height - bottomTabHeight - statusBarHeight,
        },
      ]}>
      <Video
        source={{
          uri: contentView.content.uri,
        }} // Can be a URL or a local file.
        paused={!active}
        repeat
        resizeMode="cover"
        onBuffer={buff => console.log('buffer', buff)}
        onError={err => console.log('error', err)}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
        }}
      />
      <Pressable
        className="absolute z-10 bottom-4 left-4 w-72"
        style={[flex.flexCol, gap.xsmall]}>
        <View
          className="self-start"
          style={[
            rounded.small,
            padding.small,
            flex.flexRow,
            gap.default,
            items.center,
            background(`${COLOR.black[100]}77`),
          ]}>
          <View
            className="overflow-hidden"
            style={[rounded.max, dimension.square.xlarge]}>
            <FastImage
              style={[dimension.full]}
              source={{
                uri: contentView?.user?.contentCreator?.profilePicture,
              }}
            />
          </View>
          <Text
            numberOfLines={1}
            className="font-bold"
            style={[font.size[40], textColor(COLOR.black[0])]}>
            {contentView?.user?.contentCreator?.fullname}
          </Text>
        </View>
        <View style={[dimension.width.full]}>
          <Text
            numberOfLines={2}
            className="font-medium"
            style={[
              font.size[30],
              textColor(COLOR.black[0]),
              dimension.width.full,
            ]}>
            {contentView?.content?.description}
          </Text>
        </View>
      </Pressable>
    </View>
  );
};

export default ExploreScreen;
