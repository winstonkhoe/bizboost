import {
  Pressable,
  StatusBar,
  Text,
  View,
  ViewToken,
  useWindowDimensions,
} from 'react-native';
import {FlashList} from '@shopify/flash-list';
import Video, {
  OnBufferData,
  OnVideoErrorData,
  ReactVideoProps,
  ReactVideoSource,
  ResizeMode,
} from 'react-native-video';
import {memo, useCallback, useMemo, useState} from 'react';
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
import {usePortfolio} from '../hooks/portfolio';
import {PortfolioView} from '../model/Portfolio';
import {shuffle} from '../utils/array';
import {
  AuthenticatedNavigation,
  NavigationStackProps,
} from '../navigation/StackNavigation';
import {LoadingScreen} from './LoadingScreen';
import {useAppFocus} from '../hooks/app';
import {getSourceOrDefaultAvatar} from '../utils/asset';

const ExploreScreen = () => {
  const [activeVideoIndex, setActiveVideoIndex] = useState<number>(0);
  const {portfolios} = usePortfolio();
  const shuffledContents = useMemo(() => shuffle(portfolios), [portfolios]);
  const isAppFocused = useAppFocus();
  const isFocused = useIsFocused();
  const bottomTabHeight = useBottomTabBarHeight();

  const keyExtractor = useCallback(
    (item: PortfolioView) => item.portfolio.id!!,
    [],
  );

  const viewabilityConfig = useMemo(() => {
    return {
      itemVisiblePercentThreshold: 90,
    };
  }, []);

  const onViewableItemsChanged = useCallback(
    (info: {viewableItems: ViewToken[]}) => {
      if (info.viewableItems.length > 0) {
        const index = info.viewableItems[0].index;
        if (index) {
          setActiveVideoIndex(index);
        }
      }
    },
    [],
  );

  if (!shuffledContents || shuffledContents.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <FlashList
      estimatedItemSize={shuffledContents.length}
      data={shuffledContents}
      keyExtractor={keyExtractor}
      renderItem={({item, index}) => (
        <ExploreItemMemo
          content={item}
          bottomTabHeight={bottomTabHeight}
          active={isAppFocused && isFocused && activeVideoIndex === index}
        />
      )}
      extraData={[activeVideoIndex, isFocused, isAppFocused]}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      pagingEnabled
    />
  );
};

interface ExploreItemProps {
  content: PortfolioView;
  active: boolean;
  bottomTabHeight?: number;
}

export const ExploreItem = ({
  content: contentView,
  active,
  bottomTabHeight = 0,
}: ExploreItemProps) => {
  const [isBuffering, setIsBuffering] = useState<boolean>(() => {
    return true;
  });

  const navigation = useNavigation<NavigationStackProps>();
  const windowDimension = useWindowDimensions();
  const statusBarHeight = StatusBar.currentHeight || 0;

  const handleBuffer = useCallback(
    (buff: OnBufferData) => {
      console.log(buff);
      if (buff.isBuffering !== isBuffering) {
        setIsBuffering(buff.isBuffering);
      }
    },
    [isBuffering],
  );

  const handleLoadStart = useCallback(() => {
    console.log('onload start');
    if (!isBuffering) {
      setIsBuffering(true);
    }
  }, [isBuffering]);

  const handleLoad = useCallback(() => {
    console.log('onload');
    if (isBuffering) {
      setIsBuffering(false);
    }
  }, [isBuffering]);

  const handleError = useCallback((err: OnVideoErrorData) => {
    console.log(err);
  }, []);

  return (
    <View
      style={[
        {
          width: windowDimension.width,
          height: windowDimension.height - bottomTabHeight - statusBarHeight,
        },
      ]}>
      {active && isBuffering && <LoadingScreen />}
      {isBuffering && contentView?.portfolio?.thumbnail && (
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
              uri: contentView.portfolio.thumbnail,
              priority: FastImage.priority.high,
            }}
            resizeMode={'cover'}
          />
        </View>
      )}
      {active && contentView?.portfolio?.uri && (
        <VideoMemo
          active={active}
          source={{
            uri: contentView.portfolio.uri,
          }}
          onBuffer={handleBuffer}
          onLoad={handleLoad}
          onLoadStart={handleLoadStart}
          onError={handleError}
        />
      )}
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
                contentView.user.id || contentView.portfolio.userId!!,
            });
          }}>
          <View
            className="overflow-hidden"
            style={[rounded.max, dimension.square.xlarge]}>
            <FastImage
              style={[dimension.full]}
              source={getSourceOrDefaultAvatar({
                uri: contentView?.user?.contentCreator?.profilePicture,
              })}
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
            {contentView?.portfolio?.description}
          </Text>
        </View>
      </View>
    </View>
  );
};

interface VideoMemoProps {
  source: ReactVideoSource;
  active: boolean;
  onBuffer?: (buff: OnBufferData) => void;
  onLoad?: ReactVideoProps['onLoad'];
  onLoadStart?: ReactVideoProps['onLoadStart'];
  onError?: (e: OnVideoErrorData) => void;
}

const VideoMemo = memo(
  ({
    source,
    active,
    onBuffer,
    onLoad,
    onLoadStart,
    onError,
  }: VideoMemoProps) => {
    return (
      <Video
        source={source} // Can be a URL or a local file.
        paused={!active}
        repeat
        resizeMode={ResizeMode.COVER}
        onBuffer={onBuffer}
        onLoad={onLoad}
        onLoadStart={onLoadStart}
        onError={onError}
        style={[flex.flex1]}
      />
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.source === nextProps.source &&
      prevProps.active === nextProps.active
    );
  },
);

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
      prevProps.content.portfolio.id === nextProps.content.portfolio.id &&
      prevProps.bottomTabHeight === nextProps.bottomTabHeight
    );
  },
);

export default ExploreScreen;
