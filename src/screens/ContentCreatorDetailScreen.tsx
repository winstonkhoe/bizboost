import React, {useState, useEffect, useRef} from 'react';
import SafeAreaContainer from '../containers/SafeAreaContainer';

import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  AuthenticatedNavigation,
  AuthenticatedStack,
  NavigationStackProps,
} from '../navigation/StackNavigation';
import {User} from '../model/User';
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {PageWithBackButton} from '../components/templates/PageWithBackButton';
import {font} from '../styles/Font';
import {flex, justify} from '../styles/Flex';
import StarIcon from '../assets/vectors/star.svg';
import InstagramLogo from '../assets/vectors/instagram.svg';
import TiktokLogo from '../assets/vectors/tiktok.svg';
import {CustomButton} from '../components/atoms/Button';
import {gap} from '../styles/Gap';
import PagerView from 'react-native-pager-view';
import {Content} from '../model/Content';
import Video from 'react-native-video';
import {ActivityIndicator} from 'react-native';
import ScaledImage from '../components/atoms/ScaledImage';
import {formatDateToDayMonthYear, getDate} from '../utils/date';
import FastImage from 'react-native-fast-image';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {padding} from '../styles/Padding';
import {size} from '../styles/Size';
import {useNavigation} from '@react-navigation/native';

type Props = NativeStackScreenProps<
  AuthenticatedStack,
  AuthenticatedNavigation.ContentCreatorDetail
>;

const ContentCreatorDetailScreen = ({route}: Props) => {
  const param = route.params;
  const safeAreaInsets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationStackProps>();
  const [contentCreator, setContentCreator] = useState<User | null>();
  const [contents, setContents] = useState<Content[]>();
  const [index, setIndex] = useState(0);
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    User.getById(param.contentCreatorId).then(user => setContentCreator(user));
    Content.getByUserId(param.contentCreatorId).then(content => {
      setContents(content);
    });
  }, [param]);

  const profilePictureSource = require('../assets/images/sample-influencer.jpeg');

  const pagerViewRef = useRef<PagerView>(null);

  const goToInfoTab = () => {
    pagerViewRef.current?.setPage(0);
    setIndex(0);
    setSelectedTab(0);
  };

  const goToPortfolioTab = () => {
    pagerViewRef.current?.setPage(1);
    setIndex(1);
    setSelectedTab(1);
  };

  return (
    <PageWithBackButton fullHeight={true}>
      <View
        style={[
          flex.flex1,
          flex.grow,
          flex.flexCol,
          {
            paddingTop: Math.max(safeAreaInsets.top, size.default),
            paddingBottom: Math.max(safeAreaInsets.bottom, size.large),
          },
          padding.horizontal.large,
        ]}>
        <View
          style={[flex.grow, flex.flexCol]}
          className="justify-center items-center">
          <View
            style={{
              width: Dimensions.get('window').width * 0.3,
              height: Dimensions.get('window').width * 0.3,
            }}
            className="rounded-full overflow-hidden object-cover">
            <Image
              width={Dimensions.get('window').width * 0.3}
              height={Dimensions.get('window').width * 0.3}
              source={
                contentCreator?.contentCreator?.profilePicture
                  ? {
                      uri: contentCreator?.contentCreator?.profilePicture,
                    }
                  : profilePictureSource
              }
            />
          </View>
          <Text style={font.size[60]} className="pt-1 font-bold text-black">
            {contentCreator?.contentCreator?.fullname}
          </Text>
          <Text style={font.size[30]}>Content Creator</Text>
          <View
            style={flex.flexRow}
            className="w-full items-center justify-center gap-x-2">
            {contentCreator?.instagram && (
              <View
                style={flex.flexRow}
                className="justify-center items-center">
                <InstagramLogo width={10} height={10} />
                <Text>
                  {contentCreator.instagram.followersCount?.toString()}
                </Text>
              </View>
            )}
            {contentCreator?.tiktok && (
              <View
                style={flex.flexRow}
                className="justify-center items-center">
                <TiktokLogo width={10} height={10} />
                <Text>{contentCreator.tiktok.followersCount?.toString()}</Text>
              </View>
            )}
            <View style={flex.flexRow} className="justify-center items-center">
              <StarIcon width={10} height={10} />
              <Text>
                {contentCreator?.contentCreator?.rating ?? 'Not rated'}
              </Text>
            </View>
          </View>
          <View style={flex.flexRow} className="py-3">
            <Pressable
              style={(flex.flexRow, styles.button)}
              className={`${
                selectedTab === 0 ? 'bg-primary' : 'border border-zinc-200'
              } rounded-l-md p-2 justify-center items-center text-center`}
              onPress={goToInfoTab}>
              <Text
                className={`${
                  selectedTab === 0 ? 'text-white' : 'text-black'
                }`}>
                Info
              </Text>
            </Pressable>
            <Pressable
              style={(flex.flexRow, styles.button)}
              className={`${
                selectedTab === 1 ? 'bg-primary' : 'border border-zinc-200'
              } rounded-r-md p-2 justify-center items-center text-center`}
              onPress={goToPortfolioTab}>
              <Text
                className={`${
                  selectedTab === 1 ? 'text-white' : 'text-black'
                }`}>
                Portfolio
              </Text>
            </Pressable>
          </View>
          <PagerView
            ref={pagerViewRef}
            style={(flex.flexCol, styles.pagerView)}
            initialPage={index}
            onPageSelected={e => {
              setIndex(e.nativeEvent.position);
              setSelectedTab(e.nativeEvent.position);
            }}>
            <View key="1">
              <ScrollView
                bounces={false}
                contentContainerStyle={[flex.flexCol, gap.medium]}>
                <View style={[flex.flexCol]}>
                  <Text className="text-black font-bold">About Me</Text>
                  <Text>
                    Hi there! I'm Emily, a content creator weaving stories and
                    visuals in the digital realm. From crafting eye-catching
                    Instagram feeds to whipping up engaging TikTok moments, I
                    thrive on transforming ideas into captivating digital
                    experiences. Beyond just creating content, it's about
                    fostering connections and sparking meaningful conversations.
                    With a knack for staying on top of trends and a commitment
                    to authenticity, I love navigating the dynamic world of
                    content creation, where each post is a brushstroke in my
                    canvas of digital expression.
                  </Text>
                </View>
                {contentCreator?.contentCreator?.preferences &&
                  contentCreator.contentCreator.preferences.length > 0 && (
                    <View>
                      <Text className="text-black font-bold">Preferences</Text>
                      {contentCreator.contentCreator.preferences.map(
                        (preference, idx) => (
                          <Text key={idx}>• {preference}</Text>
                        ),
                      )}
                    </View>
                  )}

                {contentCreator?.contentCreator?.preferredLocationIds &&
                  contentCreator?.contentCreator?.preferredLocationIds.length >
                    0 && (
                    <View>
                      <Text className="text-black font-bold">
                        Preferred Locations
                      </Text>
                      {contentCreator.contentCreator.preferredLocationIds.map(
                        (loc, idx) => (
                          <Text key={idx}>• {loc}</Text>
                        ),
                      )}
                    </View>
                  )}
                {contentCreator?.contentCreator?.postingSchedules &&
                  contentCreator?.contentCreator?.postingSchedules.length >
                    0 && (
                    <View>
                      <Text className="text-black font-bold">
                        Posting Schedules
                      </Text>
                      {contentCreator?.contentCreator?.postingSchedules?.map(
                        (sched, idx) => (
                          <Text key={idx}>
                            • {formatDateToDayMonthYear(new Date(sched))}
                          </Text>
                        ),
                      )}
                    </View>
                  )}
              </ScrollView>
            </View>
            <View key="2">
              <ScrollView className="flex-1" bounces={false}>
                <View style={[flex.flexRow, gap.default]}>
                  <View
                    style={[
                      flex.flex1,
                      flex.growShrink,
                      flex.flexCol,
                      gap.default,
                    ]}>
                    {contents?.map(
                      (content, idx) =>
                        idx % 2 === 0 && (
                          <Pressable
                            key={content.id}
                            onPress={() => {
                              navigation.navigate(
                                AuthenticatedNavigation.SpecificExploreModal,
                                {
                                  contentCreatorId: contentCreator?.id!!,
                                  targetContentId: content.id,
                                },
                              );
                            }}>
                            <FastImage
                              source={{uri: content.thumbnail}}
                              style={styles.video}
                            />
                          </Pressable>
                        ),
                    )}
                  </View>
                  <View
                    style={[
                      flex.flex1,
                      flex.growShrink,
                      flex.flexCol,
                      gap.default,
                    ]}>
                    {contents?.map(
                      (content, idx) =>
                        idx % 2 !== 0 && (
                          <Pressable
                            key={content.id}
                            onPress={() => {
                              navigation.navigate(
                                AuthenticatedNavigation.SpecificExploreModal,
                                {
                                  contentCreatorId: contentCreator?.id!!,
                                  targetContentId: content.id,
                                },
                              );
                            }}>
                            <FastImage
                              source={{uri: content.thumbnail}}
                              style={styles.video}
                            />
                          </Pressable>
                        ),
                    )}
                  </View>
                </View>
              </ScrollView>
            </View>
          </PagerView>
        </View>
        <CustomButton text="Contact Content Creator" />
      </View>
    </PageWithBackButton>
  );
};

export default ContentCreatorDetailScreen;

const styles = StyleSheet.create({
  pagerView: {
    width: '100%',
    height: '60%',
  },
  button: {
    width: Dimensions.get('window').width * 0.45,
  },
  video: {
    height: 200,
    borderRadius: 10,
  },
});
