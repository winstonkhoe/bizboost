import {
  FlatList,
  Platform,
  Pressable,
  StatusBar,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Video, {ResizeMode} from 'react-native-video';
import {memo, useMemo, useState} from 'react';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import {flex, items} from '../styles/Flex';
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
import {shuffle} from '../utils/array';
import {
  AuthenticatedNavigation,
  NavigationStackProps,
} from '../navigation/StackNavigation';
import {LoadingScreen} from './LoadingScreen';

const ExploreScreen = () => {
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const {contents} = useContent();
  const shuffledContents = useMemo(() => shuffle(contents), [contents]);
  const isFocused = useIsFocused();
  const bottomTabHeight = useBottomTabBarHeight();
  const windowDimension = useWindowDimensions();
  const statusBarHeight = StatusBar.currentHeight || 0;
  return (
    <FlatList
      initialNumToRender={1}
      maxToRenderPerBatch={2}
      updateCellsBatchingPeriod={2}
      data={shuffledContents}
      pagingEnabled
      getItemLayout={(data, index) => {
        return {
          length: windowDimension.height - bottomTabHeight - statusBarHeight,
          offset:
            (windowDimension.height - bottomTabHeight - statusBarHeight) *
            index,
          index,
        };
      }}
      showsVerticalScrollIndicator={false}
      renderItem={({item, index}) => (
        <ExploreItemMemo
          content={item}
          bottomTabHeight={bottomTabHeight}
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
  bottomTabHeight?: number;
}

export const ExploreItem = ({
  content: contentView,
  active,
  bottomTabHeight = 0,
}: ExploreItemProps) => {
  const navigation = useNavigation<NavigationStackProps>();
  const windowDimension = useWindowDimensions();
  const [isBuffering, setIsBuffering] = useState<boolean>(true);
  const statusBarHeight = StatusBar.currentHeight || 0;
  return (
    <View
      style={[
        {
          width: windowDimension.width,
          height: windowDimension.height - bottomTabHeight - statusBarHeight,
        },
      ]}>
      {isBuffering && <LoadingScreen />}
      {isBuffering && contentView?.content?.thumbnail && (
        <View
          style={[
            {
              position: 'absolute',
              zIndex: 10,
            },
            dimension.full,
          ]}>
          <FastImage
            style={[dimension.full]}
            source={{
              uri: contentView.content.thumbnail,
              priority: FastImage.priority.high,
            }}
            resizeMode={'cover'}
          />
        </View>
      )}
      <Video
        source={{
          uri: contentView.content.uri,
        }} // Can be a URL or a local file.
        paused={!active}
        repeat
        resizeMode={ResizeMode.COVER}
        onBuffer={buff => {
          console.log(buff);
          // if (Platform.OS !== 'android') {
          setIsBuffering(buff.isBuffering);
          // }
        }}
        onLoad={() => {
          console.log('onload')
          if (Platform.OS === 'android') {
            setIsBuffering(false);
          }
        }}
        onLoadStart={() => {
          console.log('onload start')
          if (Platform.OS === 'android') {
            setIsBuffering(true);
          }
        }}
        onError={err => console.log('error', err)}
        style={{
          position: 'absolute',
          zIndex: 5,
          width: '100%',
          height: '100%',
        }}
      />
      <View
        className="bottom-4 left-4 w-72"
        style={[
          flex.flexCol,
          gap.xsmall,
          {
            position: 'absolute',
            zIndex: 20,
          },
        ]}>
        <Pressable
          className="self-start"
          style={[
            rounded.small,
            padding.small,
            flex.flexRow,
            gap.default,
            items.center,
            background(`${COLOR.black[100]}77`),
          ]}
          onPress={() => {
            navigation.navigate(AuthenticatedNavigation.ContentCreatorDetail, {
              contentCreatorId:
                contentView.user.id || contentView.content.userId!!,
            });
          }}>
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
        </Pressable>
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
      </View>
    </View>
  );
};

const ExploreItemMemo = memo(
  ({content, active, bottomTabHeight}: ExploreItemProps) => {
    return (
      <ExploreItem
        active={active}
        content={content}
        bottomTabHeight={bottomTabHeight}
      />
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.active === nextProps.active &&
      prevProps.content === nextProps.content &&
      prevProps.bottomTabHeight === nextProps.bottomTabHeight
    );
  },
);

export default ExploreScreen;
