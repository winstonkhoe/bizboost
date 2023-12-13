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
import Meatballs from '../../assets/vectors/meatballs.svg';

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

  const animatedHeight = new Animated.Value(isExpanded ? 200 : 60);

  const toggleExpansion = () => {
    const targetHeight = isExpanded ? 60 : 200;
    Animated.timing(animatedHeight, {
      toValue: targetHeight,
      duration: 300,
      useNativeDriver: false,
    }).start();

    setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    if (offers.length < 2) {
      setIsExpanded(true);
    }
  }, [offers.length]);

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
                  toggleExpansion={toggleExpansion}
                  handleClickAccept={() => acceptOffer(offers[0])}
                  handleClickReject={() => declineOffer(offers[0])}
                  onNegotiationComplete={onNegotiationComplete}
                  isExpanded={isExpanded}
                />
              </View>
              {isExpanded && (
                <React.Fragment>
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
                              contentCreator={contentCreator || ''}
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
        {isExpanded && offers.length > 1 && (
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
  meatball: {
    width: 100,
    backgroundColor: 'white',
    position: 'absolute',
    top: 20,
    right: 0,
    zIndex: 300,
  },
});

type OfferCardProps = {
  offer: Offer;
  businessPeople: string;
  contentCreator: string;
  isExpanded?: boolean;
  handleClickAccept: () => void;
  handleClickReject: () => void;
  toggleExpansion: () => void;
  onNegotiationComplete: (fee: string) => void;
};

const OfferCard = ({
  offer,
  businessPeople,
  contentCreator,
  isExpanded = true,
  toggleExpansion,
  handleClickAccept,
  handleClickReject,
  onNegotiationComplete,
}: OfferCardProps) => {
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

  return (
    <View className="pb-2 justify-between" style={flex.flexRow}>
      <View
        style={flex.flexRow}
        className="flex-1 justify-between items-start py-1">
        <Pressable
          style={flex.flexRow}
          className="items-start"
          onPress={() => {
            navigation.navigate(AuthenticatedNavigation.CampaignDetail, {
              campaignId: offer?.campaignId || '',
            });
          }}>
          <View
            className="mr-2 w-14 h-14 items-center justify-center overflow-hidden"
            style={[flex.flexRow, rounded.default]}>
            <FastImage
              className="w-full h-full object-cover"
              source={getSourceOrDefaultAvatar({uri: campaign?.image})}
            />
          </View>
          <View>
            <Text className="text-md text-left text-black">
              {offer.status === OfferStatus.negotiate
                ? 'Negotiation: '
                : 'Offer: '}
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
        </Pressable>
        {!isExpanded && (
          <TouchableOpacity onPress={toggleExpansion}>
            <ChevronDown width={20} height={10} color={COLOR.black[100]} />
          </TouchableOpacity>
        )}
      </View>
      {isExpanded && (
        <Pressable>
          <Meatballs width={20} height={20} />
        </Pressable>
      )}
      <View style={styles.meatball}>
        <TouchableOpacity className="py-3 px-2" onPress={handleClickReject}>
          <Text className="text-black text-center text-xs">Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity className="py-3 px-2" onPress={handleClickReject}>
          <Text className="text-black text-center text-xs">Negotiate</Text>
        </TouchableOpacity>
        <TouchableOpacity className="py-3 px-2" onPress={handleClickReject}>
          <Text className="text-black text-center text-xs">Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
