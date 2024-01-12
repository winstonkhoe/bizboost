import {FlashList} from '@shopify/flash-list';
import {PageWithBackButton} from '../../components/templates/PageWithBackButton';
import {ExploreItem} from '../ExploreScreen';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useIsFocused} from '@react-navigation/native';
import {useWindowDimensions} from 'react-native';
import {User} from '../../model/User';
import {Portfolio, PortfolioView} from '../../model/Portfolio';
import {StackScreenProps} from '@react-navigation/stack';
import {
  AuthenticatedNavigation,
  AuthenticatedStack,
} from '../../navigation/StackNavigation';
import {useAppFocus} from '../../hooks/app';
import {LoadingScreen} from '../LoadingScreen';

type Props = StackScreenProps<
  AuthenticatedStack,
  AuthenticatedNavigation.SpecificExploreModal
>;

export const ModalSpecificExploreScreen = ({route}: Props) => {
  const {contentCreatorId, targetContentId} = route.params;
  const flashlistRef = useRef<FlashList<PortfolioView>>(null);
  const [contentViews, setContentViews] = useState<PortfolioView[]>([]);
  const targetContentIndex = useMemo(
    () =>
      contentViews.findIndex(
        contentView => contentView.portfolio?.id === targetContentId,
      ),
    [contentViews, targetContentId],
  );
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const isFocused = useIsFocused();
  const isAppFocused = useAppFocus();
  const windowDimension = useWindowDimensions();

  useEffect(() => {
    User.getById(contentCreatorId).then(user => {
      if (user) {
        Portfolio.getByUserId(contentCreatorId).then(contents => {
          setContentViews(
            contents?.map(content => {
              return {
                portfolio: content,
                user: user,
              };
            }) || [],
          );
        });
      }
    });
  }, [contentCreatorId]);

  const keyExtractor = useCallback(
    (item: PortfolioView) => item.portfolio.id!!,
    [],
  );

  if (!contentViews || contentViews.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <PageWithBackButton withoutScrollView>
      {contentViews.length > 0 && (
        <FlashList
          ref={flashlistRef}
          data={contentViews}
          onLoad={_ => {
            setTimeout(() => {
              console.log('scroll to index', targetContentIndex);
              flashlistRef.current?.scrollToIndex({
                animated: true,
                index: targetContentIndex,
              });
              console.log('scroll to index ', targetContentIndex, 'done');
            }, 100);
            console.log('LOADED', _);
          }}
          pagingEnabled
          initialScrollIndex={targetContentIndex}
          estimatedItemSize={contentViews.length || 5}
          showsVerticalScrollIndicator={false}
          extraData={[
            activeVideoIndex,
            isFocused,
            isAppFocused,
            targetContentIndex,
          ]}
          keyExtractor={keyExtractor}
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
      )}
    </PageWithBackButton>
  );
};
