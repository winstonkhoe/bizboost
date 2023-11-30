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
import {Transaction} from '../../model/Transaction';
import {ScrollView} from 'react-native-gesture-handler';

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

  const toggleExpansion = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  const acceptOffer = (offer: Offer) => {
    offer.accept().then(async () => {
      const rejectedOffers = Offer.filterByCampaignId(
        offers,
        offer.campaignId ?? '',
      );

      for (let i = 0; i < rejectedOffers.length; i++) {
        console.log('Rejected offer:', rejectedOffers[i].toString());
        await rejectedOffers[i].reject();
      }

      Transaction.getById(offer.campaignId ?? '' + offer.contentCreatorId).then(
        transaction => {
          if (transaction) {
            transaction.acceptOffer(offer.offeredPrice ?? 0);
          }
        },
      );
    });
  };

  const declineOffer = (offer: Offer) => {
    offer.reject();
  };

  return (
    <View className="w-full absolute top-16 z-50">
      <View className={`${isExpanded ? 'h-2/3' : 'h-16'}`} style={flex.flexCol}>
        <ScrollView style={flex.flexCol} className="w-full p-1 rounded-md z-50">
          <View
            style={flex.flexCol}
            className="w-full bg-gray-100 py-3 z-30 rounded-md">
            <View
              style={flex.flexRow}
              className="justify-between items-center px-3 bg-gray-100">
              <View>
                <Text className="text-md text-left text-black">
                  Last Offer:{' '}
                  <Text className="font-bold">
                    {offers[0]?.offeredPrice?.toLocaleString('en-ID')}
                  </Text>
                </Text>
                <Text className="text-xs text-left">by {businessPeople}</Text>
              </View>
              {!isExpanded && (
                <TouchableOpacity onPress={toggleExpansion}>
                  <ChevronDown
                    width={20}
                    height={10}
                    color={COLOR.black[100]}
                  />
                </TouchableOpacity>
              )}
            </View>
            {isExpanded && (
              <React.Fragment>
                <View className="py-3 px-3">
                  {activeRole && (
                    <CampaignCard
                      offer={offers[0]}
                      businessPeople={businessPeople || ''}
                      activeRole={activeRole}
                      handleClickAccept={() => acceptOffer(offers[0])}
                      handleClickReject={() => declineOffer(offers[0])}
                    />
                  )}
                </View>
                {offers.length > 1 &&
                  offers
                    .slice(1)
                    .map(
                      offer =>
                        activeRole && (
                          <OfferCard
                            key={offer.id}
                            offer={offer}
                            businessPeople={businessPeople || ''}
                            activeRole={activeRole}
                            handleClickAccept={() => acceptOffer(offer)}
                            handleClickReject={() => declineOffer(offer)}
                          />
                        ),
                    )}
              </React.Fragment>
            )}
          </View>
        </ScrollView>
        {isExpanded && (
          <TouchableOpacity
            style={flex.flexRow}
            className="bg-gray-100 border-t border-t-zinc-300 justify-end items-center px-3 py-3"
            onPress={toggleExpansion}>
            <ChevronUp width={20} height={10} color={COLOR.black[100]} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default FloatingOffer;

type OfferCardProps = {
  offer: Offer;
  businessPeople: string;
  activeRole: UserRole;
  handleClickAccept: () => void;
  handleClickReject: () => void;
};

const OfferCard = ({
  offer,
  businessPeople,
  activeRole,
  handleClickAccept,
  handleClickReject,
}: OfferCardProps) => {
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
      <CampaignCard
        offer={offer}
        businessPeople={businessPeople}
        activeRole={activeRole}
        handleClickAccept={handleClickAccept}
        handleClickReject={handleClickReject}
      />
    </View>
  );
};

type CampaignCardProps = {
  offer: Offer;
  businessPeople: string;
  activeRole: UserRole;
  handleClickAccept: () => void;
  handleClickReject: () => void;
};

const CampaignCard = ({
  offer,
  activeRole,
  handleClickAccept,
  handleClickReject,
}: CampaignCardProps) => {
  const [campaign, setCampaign] = useState<Campaign>();
  const navigation = useNavigation<NavigationStackProps>();

  const [showAllNotes, setShowAllNotes] = useState(false);

  const handleSeeMore = () => {
    setShowAllNotes(true);
  };

  useEffect(() => {
    Campaign.getById(offer.campaignId || '').then(c => setCampaign(c));
  }, [offer]);

  const imageSource = campaign?.image
    ? {
        uri: campaign?.image,
      }
    : require('../../assets/images/bizboost-avatar.png');

  return (
    <View style={flex.flexCol}>
      <Pressable
        style={flex.flexRow}
        className="justify-between items-center py-1"
        onPress={() => {
          navigation.navigate(AuthenticatedNavigation.CampaignDetail, {
            campaignId: offer?.campaignId || '',
          });
        }}>
        <View style={flex.flexRow} className="w-full items-start">
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
              {offer.importantNotes && offer.importantNotes !== '' ? (
                <Text numberOfLines={2} className="text-xs">
                  {offer.importantNotes}
                </Text>
              ) : (
                <Text numberOfLines={2} className="text-xs">
                  -
                </Text>
              )}
            </View>
          </View>
        </View>
        <HorizontalPadding paddingSize="small">
          <ChevronRight fill={COLOR.black[20]} />
        </HorizontalPadding>
      </Pressable>
      {activeRole === UserRole.ContentCreator && (
        <View className="pt-2 flex flex-row items-center justify-between w-full">
          <View className="w-1/3">
            <TouchableOpacity
              className="bg-secondary py-3 px-2 rounded-l-md"
              onPress={handleClickReject}>
              <Text className="text-white text-center text-xs">Reject</Text>
            </TouchableOpacity>
          </View>

          <View className="w-1/3">
            <TouchableOpacity
              className="bg-yellow-500 py-3 px-2"
              onPress={handleClickAccept}>
              <Text className="text-center text-xs text-white">Negotiate</Text>
            </TouchableOpacity>
          </View>
          <View className="w-1/3">
            <TouchableOpacity
              className="bg-primary py-3 px-2 rounded-r-md"
              onPress={handleClickAccept}>
              <Text className="text-white text-center text-xs">Accept</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};
