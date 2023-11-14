import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {
  AuthenticatedNavigation,
  NavigationStackProps,
  AuthenticatedStack,
} from '../navigation/StackNavigation';
import {Text, View} from 'react-native';

import {Campaign} from '../model/Campaign';

import {useUser} from '../hooks/user';

import {PageWithBackButton} from '../components/templates/PageWithBackButton';
import {useNavigation} from '@react-navigation/native';
import {flex} from '../styles/Flex';
import {gap} from '../styles/Gap';
import {Stepper} from '../components/atoms/Stepper';
import {font} from '../styles/Font';
import {HorizontalPadding} from '../components/atoms/ViewPadding';
import {padding} from '../styles/Padding';
import {rounded} from '../styles/BorderRadius';
import {background} from '../styles/BackgroundColor';
import {COLOR} from '../styles/Color';
import {CustomButton} from '../components/atoms/Button';
import {border} from '../styles/Border';
import {textColor} from '../styles/Text';

type Props = NativeStackScreenProps<
  AuthenticatedStack,
  AuthenticatedNavigation.CampaignTimeline
>;

const CampaignTimelineScreen = ({route}: Props) => {
  const {uid} = useUser();
  const navigation = useNavigation<NavigationStackProps>();
  const {campaignId} = route.params;
  const [campaign, setCampaign] = useState<Campaign>();

  useEffect(() => {
    Campaign.getById(campaignId).then(c => setCampaign(c));
  }, [campaignId]);

  if (!campaign) {
    return <Text>Loading</Text>;
  }

  return (
    <PageWithBackButton enableSafeAreaContainer fullHeight>
      <HorizontalPadding>
        <View style={[flex.flexCol, gap.default, padding.top.xlarge3]}>
          <Stepper type="content" currentPosition={1} maxPosition={6}>
            {[...Array(5)].map((_, i) => (
              <View key={i} style={[flex.flexCol, gap.default]}>
                <View style={[flex.flexCol]}>
                  <Text
                    className="font-bold"
                    style={[font.size[60]]}
                    numberOfLines={1}>
                    Registration
                  </Text>
                  <Text
                    style={[font.size[30], textColor(COLOR.text.neutral.high)]}
                    numberOfLines={1}>
                    24 Oct 2023 - 28 Oct 2023
                  </Text>
                </View>
                <View
                  style={[
                    flex.flexCol,
                    padding.default,
                    rounded.default,
                    gap.default,
                    border({
                      borderWidth: 3,
                      color: COLOR.green[60],
                      opacity: 0.5,
                    }),
                  ]}>
                  <Text
                    className="font-semibold"
                    style={[font.size[60]]}
                    numberOfLines={1}>
                    Submit your ideas!
                  </Text>
                  <View
                    style={[
                      flex.flexCol,
                      gap.default,
                      padding.default,
                      rounded.default,
                      background(`${COLOR.green[5]}`),
                    ]}>
                    <Text>💡 Things to highlight</Text>
                    <Text>
                      Features: Multiple compartments for organized packing
                      Water-resistant and weather-proof material Lightweight and
                      easy to carry Available in various sizes and colors
                      Tagline: “Travel with confidence with Koper Idaman
                      Petualang!”
                    </Text>
                  </View>
                  <CustomButton text="Submit idea" />
                </View>
              </View>
            ))}
          </Stepper>
        </View>
      </HorizontalPadding>
    </PageWithBackButton>
  );
};

export default CampaignTimelineScreen;
