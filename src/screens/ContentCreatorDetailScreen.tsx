import React, {useState, useEffect} from 'react';
import SafeAreaContainer from '../containers/SafeAreaContainer';

import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  AuthenticatedNavigation,
  AuthenticatedStack,
} from '../navigation/StackNavigation';
import {User} from '../model/User';
import {Dimensions, Image, Text, View} from 'react-native';
import {PageWithBackButton} from '../components/templates/PageWithBackButton';
import {font} from '../styles/Font';
import {flex} from '../styles/Flex';
import StarIcon from '../assets/vectors/star.svg';
import InstagramLogo from '../assets/vectors/instagram.svg';
import TiktokLogo from '../assets/vectors/tiktok.svg';
import {CustomButton} from '../components/atoms/Button';

type Props = NativeStackScreenProps<
  AuthenticatedStack,
  AuthenticatedNavigation.ContentCreatorDetail
>;

const ContentCreatorDetailScreen = ({route}: Props) => {
  const param = route.params;
  const [contentCreator, setContentCreator] = useState<User>();

  useEffect(() => {
    User.getById(param.contentCreatorId).then(user => setContentCreator(user));
  }, [param]);

  const profilePictureSource = require('../assets/images/sample-influencer.jpeg');

  return (
    <SafeAreaContainer>
      <PageWithBackButton>
        <View style={flex.flexCol} className="justify-between">
          <View style={flex.flexCol} className="justify-center items-center">
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
            <Text style={font.size[60]} className="font-bold">
              {contentCreator?.contentCreator?.fullname}
            </Text>
            <Text style={font.size[30]}>Content Creator</Text>
            <View style={flex.flexRow} className="items-center justify-center">
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
                  <Text>
                    {contentCreator.tiktok.followersCount?.toString()}
                  </Text>
                </View>
              )}
              <View
                style={flex.flexRow}
                className="justify-center items-center">
                <StarIcon width={10} height={10} />
                <Text>
                  {contentCreator?.contentCreator?.rating ?? 'Not rated'}
                </Text>
              </View>
            </View>
          </View>
          <CustomButton text="Contact Content Creator" />
        </View>
      </PageWithBackButton>
    </SafeAreaContainer>
  );
};

export default ContentCreatorDetailScreen;
