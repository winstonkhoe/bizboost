import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
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
import {Offer, OfferStatus} from '../../model/Offer';
import {Campaign} from '../../model/Campaign';
import {Pressable} from 'react-native';
import ChevronRight from '../../assets/vectors/chevron-right.svg';
import {UserRole} from '../../model/User';
import FastImage from 'react-native-fast-image';
import {rounded} from '../../styles/BorderRadius';
import {HorizontalPadding} from '../atoms/ViewPadding';
import {Transaction, TransactionStatus} from '../../model/Transaction';
import {ScrollView} from 'react-native-gesture-handler';
import {openNegotiateModal} from '../../utils/modal';
import {getSourceOrDefaultAvatar} from '../../utils/asset';
import {Animated} from 'react-native';

interface Props {
  offers: Offer[];
  recipientName: string;
  businessPeopleId?: string;
  contentCreatorId?: string;
  onNegotiationComplete: (fee: string) => void;
}
const FloatingOffer = ({
  offers,
  recipientName,
  businessPeopleId,
  contentCreatorId,
  onNegotiationComplete,
}: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const {activeRole, user} = useUser();
  const businessPeople =
    activeRole === UserRole.BusinessPeople
      ? user?.businessPeople?.fullname
      : recipientName;
  const contentCreator =
    activeRole === UserRole.ContentCreator
      ? user?.contentCreator?.fullname
      : recipientName;

  const animatedHeight = new Animated.Value(isExpanded ? 200 : 60); // Set your desired expanded and collapsed heights

  const toggleExpansion = () => {
    const targetHeight = isExpanded ? 60 : 200; // Set your desired expanded and collapsed heights
    Animated.timing(animatedHeight, {
      toValue: targetHeight,
      duration: 300, // Set your desired animation duration
      useNativeDriver: false,
    }).start();

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

      Transaction.getById(
        offer.campaignId ?? '' + offer.contentCreatorId,
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
      <View>
        <ScrollView
          scrollEnabled={isExpanded}
          className={`${!isExpanded ?? 'h-16'}`}
          style={(flex.flexCol, isExpanded ?? styles.scroll)}>
          <View
            style={flex.flexCol}
            className="w-full px-1 pt-1 rounded-t-md z-50">
            <View
              style={flex.flexCol}
              className="w-full bg-gray-100 pt-3 pb-1 z-30 rounded-md">
              <View
                style={flex.flexRow}
                className="justify-between items-center px-3 bg-gray-100">
                <OfferCard
                  offer={offers[0]}
                  businessPeople={businessPeople || ''}
                  contentCreator={contentCreator || ''}
                />
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
                  <View className="py-1 px-3">
                    {activeRole && (
                      <CampaignCard
                        offer={offers[0]}
                        businessPeople={businessPeople || ''}
                        businessPeopleId={businessPeopleId || ''}
                        contentCreatorId={contentCreatorId || ''}
                        activeRole={activeRole}
                        handleClickAccept={() => acceptOffer(offers[0])}
                        handleClickReject={() => declineOffer(offers[0])}
                        onNegotiationComplete={onNegotiationComplete}
                      />
                    )}
                  </View>
                  {offers.length > 1 &&
                    offers
                      .slice(1)
                      .map(
                        offer =>
                          activeRole && (
                            <Card
                              key={offer.id}
                              offer={offer}
                              businessPeople={businessPeople || ''}
                              contentCreator={contentCreator || ''}
                              activeRole={activeRole}
                              handleClickAccept={() => acceptOffer(offer)}
                              handleClickReject={() => declineOffer(offer)}
                              onNegotiationComplete={onNegotiationComplete}
                            />
                          ),
                      )}
                </React.Fragment>
              )}
            </View>
          </View>
        </ScrollView>
        {isExpanded && (
          <View className="px-1 rounded-b-md">
            <TouchableOpacity
              style={flex.flexRow}
              className="bg-gray-100 border-t border-t-zinc-300 justify-end items-center px-3 py-3"
              onPress={toggleExpansion}>
              <ChevronUp width={20} height={10} color={COLOR.black[100]} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export default FloatingOffer;

const styles = StyleSheet.create({
  scroll: {
    height: 60,
  },
});

type CardProps = {
  offer: Offer;
  businessPeople: string;
  contentCreator: string;
  activeRole: UserRole;
  businessPeopleId?: string;
  contentCreatorId?: string;
  handleClickAccept: () => void;
  handleClickReject: () => void;
  onNegotiationComplete: (fee: string) => void;
};

const Card = ({
  offer,
  businessPeople,
  contentCreator,
  activeRole,
  businessPeopleId,
  contentCreatorId,
  handleClickAccept,
  handleClickReject,
  onNegotiationComplete,
}: CardProps) => {
  return (
    <View
      style={flex.flexCol}
      className="w-full p-3 bg-gray-100 border-t border-t-zinc-300">
      <View style={flex.flexRow} className="justify-between items-center pb-2">
        <OfferCard
          offer={offer}
          businessPeople={businessPeople}
          contentCreator={contentCreator}
        />
      </View>
      <CampaignCard
        offer={offer}
        businessPeople={businessPeople}
        activeRole={activeRole}
        businessPeopleId={businessPeopleId || ''}
        contentCreatorId={contentCreatorId || ''}
        handleClickAccept={handleClickAccept}
        handleClickReject={handleClickReject}
        onNegotiationComplete={onNegotiationComplete}
      />
    </View>
  );
};

type OfferCardProps = {
  offer: Offer;
  businessPeople: string;
  contentCreator: string;
};

const OfferCard = ({offer, businessPeople, contentCreator}: OfferCardProps) => {
  return (
    <View className="pb-2">
      <Text className="text-md text-left text-black">
        {offer.status === OfferStatus.negotiate ? 'Negotiation: ' : 'Offer: '}
        <Text className="font-bold">
          {offer.status === OfferStatus.pending ||
          offer.status === OfferStatus.negotiateRejected
            ? offer?.offeredPrice?.toLocaleString('en-ID')
            : offer?.negotiatedPrice?.toLocaleString('en-ID')}
        </Text>
      </Text>
      {offer.status === OfferStatus.pending ? (
        <Text className="text-xs text-left">
          by{' '}
          {offer.negotiatedBy === UserRole.ContentCreator
            ? contentCreator
            : businessPeople}
        </Text>
      ) : (
        <View>
          {(offer.status === OfferStatus.negotiateRejected ||
            offer.status === OfferStatus.negotiate) && (
            <Text className="text-xs text-left">
              Last Negotiation: {offer.negotiatedPrice}
            </Text>
          )}
          <Text className="text-xs text-left">
            by{' '}
            {offer.negotiatedBy === UserRole.ContentCreator
              ? contentCreator
              : businessPeople}
          </Text>
        </View>
      )}
    </View>
  );
};

type CampaignCardProps = {
  offer: Offer;
  businessPeople: string;
  activeRole: UserRole;
  businessPeopleId?: string;
  contentCreatorId?: string;
  handleClickAccept: () => void;
  handleClickReject: () => void;
  onNegotiationComplete: (fee: string) => void;
};

const CampaignCard = ({
  offer,
  activeRole,
  businessPeopleId,
  contentCreatorId,
  handleClickAccept,
  handleClickReject,
  onNegotiationComplete,
}: CampaignCardProps) => {
  const [campaign, setCampaign] = useState<Campaign>();
  const navigation = useNavigation<NavigationStackProps>();

  useEffect(() => {
    Campaign.getById(offer.campaignId || '').then(c => setCampaign(c));
  }, [offer]);

  console.log('campaign', campaign);

  const openModalNegotiate = () => {
    openNegotiateModal({
      selectedOffer: offer,
      campaign: campaign,
      navigation: navigation,
      onNegotiationComplete: onNegotiationComplete,
    });
  };

  const importantNotes =
    offer.status === OfferStatus.pending
      ? offer?.importantNotes
      : offer?.negotiatedNotes;

  const handleAcceptNegotiation = () => {
    offer.acceptNegotiation().then(() => {
      console.log('Accepted');
    });

    const transaction = new Transaction({
      contentCreatorId: contentCreatorId,
      businessPeopleId: businessPeopleId,
      campaignId: campaign.id,
      transactionAmount: offer.negotiatedPrice,
    });

    transaction.insert(TransactionStatus.offerApproved);
  };

  const handleRejectNegotiation = () => {
    console.log('Rejecting negotiation..');
    offer.rejectNegotiation().then(() => {
      console.log('Rejected');
    });
  };

  return (
    <View style={flex.flexCol}>
      <Pressable
        style={flex.flexRow}
        className="justify-between items-center pb-1"
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
              source={getSourceOrDefaultAvatar({uri: campaign?.image})}
            />
          </View>
          <View className="flex-1" style={flex.flexCol}>
            <Text className="font-bold pb-1">{campaign?.title}</Text>
            <View className="bg-white rounded-sm p-2">
              <Text className="text-xs font-semibold pb-1">
                Important Notes
              </Text>
              {importantNotes && importantNotes !== '' ? (
                <Text numberOfLines={2} className="text-xs">
                  {importantNotes}
                </Text>
              ) : (
                <Text numberOfLines={2} className="text-xs">
                  -
                </Text>
              )}
            </View>
          </View>
          <HorizontalPadding paddingSize="small">
            <ChevronRight fill={COLOR.black[20]} />
          </HorizontalPadding>
        </View>
      </Pressable>
      <View className="pt-1">
        {activeRole === UserRole.ContentCreator &&
          (offer.status === OfferStatus.pending ||
          offer.status === OfferStatus.negotiateRejected ? (
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
                  onPress={openModalNegotiate}>
                  <Text className="text-center text-xs text-white">
                    Negotiate
                  </Text>
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
          ) : (
            <View className="w-full">
              <TouchableOpacity className="bg-gray-300 py-3 px-2 rounded-md">
                <Text className="text-white text-center text-xs">
                  Negotiated
                </Text>
              </TouchableOpacity>
            </View>
          ))}

        {activeRole === UserRole.BusinessPeople &&
          offer.status === OfferStatus.negotiate && (
            <View className="pt-2 flex flex-row items-center justify-between w-full">
              <View className="w-1/2">
                <TouchableOpacity
                  className="bg-secondary py-3 px-2 rounded-l-md"
                  onPress={() => handleRejectNegotiation()}>
                  <Text className="text-white text-center text-xs">Reject</Text>
                </TouchableOpacity>
              </View>
              <View className="w-1/2">
                <TouchableOpacity
                  className="bg-primary py-3 px-2 rounded-r-md"
                  onPress={() => handleAcceptNegotiation()}>
                  <Text className="text-white text-center text-xs">Accept</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
      </View>
    </View>
  );
};
