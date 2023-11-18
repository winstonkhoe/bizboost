import {FlatList} from 'react-native';
import {PageWithBackButton} from '../../components/templates/PageWithBackButton';
import {ExploreItem} from '../ExploreScreen';
import {useEffect, useRef, useState} from 'react';
import {useIsFocused} from '@react-navigation/native';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import {useWindowDimensions} from 'react-native';
import {User} from '../../model/User';
import {Content, ContentView} from '../../model/Content';
import {StackScreenProps} from '@react-navigation/stack';
import {
  AuthenticatedNavigation,
  AuthenticatedStack,
} from '../../navigation/StackNavigation';

type Props = StackScreenProps<
  AuthenticatedStack,
  AuthenticatedNavigation.SpecificExploreModal
>;

export const ModalSpecificExploreScreen = ({route}: Props) => {
  const {contentCreatorId, targetContentId} = route.params;
  const flatListRef = useRef<FlatList>(null);
  const [contentViews, setContentViews] = useState<ContentView[]>([]);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const isFocused = useIsFocused();
  const windowDimension = useWindowDimensions();

  useEffect(() => {
    User.getById(contentCreatorId).then(user => {
      if (user) {
        Content.getByUserId(contentCreatorId).then(contents => {
          setContentViews(
            contents?.map(content => {
              return {
                content: content,
                user: user,
              };
            }) || [],
          );
        });
      }
    });
  }, [contentCreatorId]);

  useEffect(() => {
    if (contentViews.length > 0 && targetContentId && flatListRef.current) {
      const targetIndex = contentViews.findIndex(
        contentView => contentView.content.id === targetContentId,
      );
      if (targetIndex !== -1) {
        flatListRef.current?.scrollToIndex({
          animated: true,
          index: targetIndex,
        });
      }
    }
  }, [contentViews, targetContentId]);

  return (
    <PageWithBackButton withoutScrollView>
      <FlatList
        ref={flatListRef}
        data={contentViews}
        getItemLayout={(data, index) => {
          return {
            length: windowDimension.height,
            offset: windowDimension.height * index,
            index,
          };
        }}
        onScrollToIndexFailed={info => {
          const wait = new Promise(resolve => setTimeout(resolve, 500));
          wait.then(() => {
            flatListRef.current?.scrollToIndex({
              index: info.index,
              animated: true,
            });
          });
        }}
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
            e.nativeEvent.contentOffset.y / windowDimension.height,
          );
          setActiveVideoIndex(index);
        }}
      />
    </PageWithBackButton>
  );
};
