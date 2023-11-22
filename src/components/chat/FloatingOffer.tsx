import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import {flex} from '../../styles/Flex';
import ChevronDown from '../../assets/vectors/chevron-down.svg';
import ChevronUp from '../../assets/vectors/chevron-up.svg';
import {COLOR} from '../../styles/Color';
import {useUser} from '../../hooks/user';
import {useNavigation} from '@react-navigation/native';
import {
  AuthenticatedNavigation,
  NavigationStackProps,
} from '../../navigation/StackNavigation';
import {Offer} from '../../model/Offer';
import {Campaign} from '../../model/Campaign';
import {Pressable} from 'react-native';
import ChevronRight from '../../assets/vectors/chevron-right.svg';
import {UserRole} from '../../model/User';
import FastImage from 'react-native-fast-image';
import {rounded} from '../../styles/BorderRadius';
import {HorizontalPadding} from '../atoms/ViewPadding';
import {CustomButton} from '../atoms/Button';
import {font} from '../../styles/Font';

UIManager.setLayoutAnimationEnabledExperimental &&
  UIManager.setLayoutAnimationEnabledExperimental(true);

interface Props {
  offers: Offer[];
  recipientName: string;
}
const FloatingOffer = ({offers, recipientName}: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [campaign, setCampaign] = useState<Campaign>();
  const navigation = useNavigation<NavigationStackProps>();

  useEffect(() => {
    Campaign.getById(offers[0].campaignId || '').then(c => setCampaign(c));
  }, [offers]);

  const {activeRole, user} = useUser();
  const businessPeople =
    activeRole === UserRole.BusinessPeople
      ? user?.businessPeople?.fullname
      : recipientName;

  // Function to toggle the expansion
  const toggleExpansion = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  for (let i = 0; i < offers.length; i++) {
    console.log(offers[i].toString());
  }

  return (
    <View
      className="w-full items-center justify-center relative z-50"
      style={flex.flexCol}>
      <View style={flex.flexCol} className="w-full p-1 rounded-md">
        <View style={flex.flexCol} className="w-full bg-gray-100 py-3">
          <View
            style={flex.flexRow}
            className="justify-between items-center px-3">
            <View>
              <Text className="text-md text-left text-black">
                Last Offer:{' '}
                <Text className="font-bold">
                  {offers[0]?.offeredPrice?.toLocaleString('en-ID')}
                </Text>
              </Text>
              <Text className="text-xs text-left">by {businessPeople}</Text>
            </View>
            <TouchableOpacity onPress={toggleExpansion}>
              {isExpanded ? (
                // Display the new SVG icon when expanded
                <ChevronUp width={20} height={10} color={COLOR.black[100]} />
              ) : (
                // Display the original ChevronDown icon when not expanded
                <ChevronDown width={20} height={10} color={COLOR.black[100]} />
              )}
            </TouchableOpacity>
          </View>
          {isExpanded && (
            <React.Fragment>
              <View className="w-full bg-gray-100 absolute top-14 z-20">
                <View className="pb-4 px-3">
                  <Pressable
                    style={flex.flexRow}
                    className="justify-between items-center"
                    onPress={() => {
                      navigation.navigate(
                        AuthenticatedNavigation.CampaignDetail,
                        {
                          campaignId: offers[0]?.campaignId || '',
                        },
                      );
                    }}>
                    <View style={flex.flexRow} className="w-4/5 items-start">
                      <View
                        className="mr-2 w-14 h-14 items-center justify-center overflow-hidden"
                        style={[flex.flexRow, rounded.default]}>
                        <FastImage
                          className="w-full h-full object-cover"
                          source={
                            campaign?.image
                              ? {
                                  uri: campaign?.image,
                                }
                              : require('../../assets/images/bizboost-avatar.png')
                          }
                        />
                      </View>
                      <View className="flex-1" style={flex.flexCol}>
                        <Text className="font-bold pb-1">
                          {campaign?.title}
                        </Text>
                        <View className="bg-white rounded-sm p-2">
                          <Text className="text-xs font-semibold pb-1">
                            Important Notes
                          </Text>
                          {offers[0].importantNotes &&
                            offers[0].importantNotes.map((note, idx) => (
                              <Text className="text-xs" key={idx}>
                                • {note}
                              </Text>
                            ))}
                        </View>
                      </View>
                    </View>
                    <HorizontalPadding paddingSize="small">
                      <ChevronRight fill={COLOR.black[20]} />
                    </HorizontalPadding>
                  </Pressable>
                  <View className="pt-2 flex flex-row items-center justify-between w-full">
                    <View className="w-1/2">
                      <CustomButton
                        text="Accept"
                        scale={1}
                        rounded="small"
                        className="w-full"
                        customTextSize={font.size[20]}
                      />
                    </View>
                    <View className="w-1/2">
                      <CustomButton
                        text="Reject"
                        scale={1}
                        rounded="small"
                        className="w-ful"
                        customTextSize={font.size[20]}
                        type="tertiary"
                      />
                    </View>
                  </View>
                </View>
                {offers.length > 1 &&
                  offers
                    .slice(1)
                    .map(offer => (
                      <OfferCard
                        key={offer.id}
                        offer={offer}
                        businessPeople={businessPeople}
                      />
                    ))}
              </View>
            </React.Fragment>
          )}
        </View>
      </View>
    </View>
  );
};

export default FloatingOffer;

type OfferCardProps = {
  offer: Offer;
  businessPeople: string;
};

const OfferCard = ({offer, businessPeople}: OfferCardProps) => {
  const [campaign, setCampaign] = useState<Campaign>();
  const navigation = useNavigation<NavigationStackProps>();

  useEffect(() => {
    Campaign.getById(offer.campaignId || '').then(c => setCampaign(c));
  }, [offer]);

  const imageSource = campaign?.image
    ? {
        uri: campaign?.image,
      }
    : require('../../assets/images/bizboost-avatar.png');

  return (
    <View
      style={flex.flexCol}
      className="w-full p-3 bg-gray-100 border-t border-t-zinc-300">
      <View style={flex.flexRow} className="justify-between items-center pb-2">
        <View>
          <Text className="text-md text-left text-black">
            Offer:{' '}
            <Text className="font-bold">
              IDR {offer?.offeredPrice?.toLocaleString('en-ID')}
            </Text>
          </Text>
          <Text className="text-xs text-left">by {businessPeople}</Text>
        </View>
      </View>
      <Pressable
        style={flex.flexRow}
        className="justify-between items-center"
        onPress={() => {
          navigation.navigate(AuthenticatedNavigation.CampaignDetail, {
            campaignId: offer?.campaignId || '',
          });
        }}>
        <View style={flex.flexRow} className="w-4/5 items-start">
          <View
            className="mr-2 w-14 h-14 items-center justify-center overflow-hidden"
            style={[flex.flexRow, rounded.default]}>
            <FastImage
              className="w-full h-full object-cover"
              source={imageSource}
            />
          </View>
          <View className="flex-1" style={flex.flexCol}>
            <Text className="font-bold pb-1">{campaign?.title}</Text>
            <View className="bg-white rounded-sm p-2">
              <Text className="text-xs font-semibold pb-1">
                Important Notes
              </Text>
              {offer.importantNotes &&
                offer.importantNotes.map((note, idx) => (
                  <Text className="text-xs" key={idx}>
                    • {note}
                  </Text>
                ))}
            </View>
          </View>
        </View>
        <HorizontalPadding paddingSize="small">
          <ChevronRight fill={COLOR.black[20]} />
        </HorizontalPadding>
      </Pressable>
      <View className="pt-2 flex flex-row items-center justify-between w-full">
        <View className="w-1/2">
          <CustomButton
            text="Accept"
            scale={1}
            rounded="small"
            className="w-full"
            customTextSize={font.size[20]}
          />
        </View>
        <View className="w-1/2">
          <CustomButton
            text="Reject"
            scale={1}
            rounded="small"
            className="w-ful"
            customTextSize={font.size[20]}
            type="tertiary"
          />
        </View>
      </View>
    </View>
  );
};
