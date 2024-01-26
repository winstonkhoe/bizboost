import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  AuthenticatedNavigation,
  AuthenticatedStack,
  NavigationStackProps,
} from '../navigation/StackNavigation';
import {Negotiation, Offer} from '../model/Offer';
import {useEffect, useState} from 'react';
import {View} from 'react-native';
import {PageWithBackButton} from '../components/templates/PageWithBackButton';
import {Campaign} from '../model/Campaign';
import {Text} from 'react-native';
import {COLOR} from '../styles/Color';
import {textColor} from '../styles/Text';
import {font} from '../styles/Font';
import {flex, items, justify} from '../styles/Flex';
import {CampaignDetailSection} from './transaction/TransactionDetailScreen';
import {User} from '../model/User';
import CampaignPlatformAccordion from '../components/molecules/CampaignPlatformAccordion';
import {padding} from '../styles/Padding';
import {Seperator} from '../components/atoms/Separator';
import {BackButtonLabel} from '../components/atoms/Header';
import {OfferAction} from '../components/molecules/OfferActionsModal';
import {LoadingScreen} from './LoadingScreen';
import {useNavigation} from '@react-navigation/native';
import {gap} from '../styles/Gap';
import PagerView from 'react-native-pager-view';
import {CircleIcon} from '../components/atoms/Icon';
import {currencyFormat} from '../utils/currency';
import {ScrollView} from 'react-native';

type Props = NativeStackScreenProps<
  AuthenticatedStack,
  AuthenticatedNavigation.OfferDetail
>;

export const OfferDetailScreen = ({route}: Props) => {
  const {offerId} = route.params;
  const navigation = useNavigation<NavigationStackProps>();
  const [offer, setOffer] = useState<Offer | null>();
  const [campaign, setCampaign] = useState<Campaign | null>();
  const [businessPeople, setBusinessPeople] = useState<User | null>();
  const [activeViewNegotiateIndex, setActiveViewNegotiateIndex] = useState(0);

  useEffect(() => {
    if (offerId) {
      console.log('get offer');
      Offer.getById(offerId)
        .then(setOffer)
        .catch(() => setOffer(null));
    }
  }, [offerId]);

  useEffect(() => {
    if (offer && offer.campaignId) {
      Campaign.getById(offer.campaignId)
        .then(setCampaign)
        .catch(() => setCampaign(null));
    }
  }, [offer]);

  useEffect(() => {
    if (offer && offer.businessPeopleId) {
      User.getById(offer.businessPeopleId)
        .then(setBusinessPeople)
        .catch(() => setBusinessPeople(null));
    }
  }, [offer]);

  const navigateBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate(AuthenticatedNavigation.Home);
  };

  if (offer === undefined || campaign === undefined) {
    return <LoadingScreen />;
  }

  return (
    <PageWithBackButton
      enableSafeAreaContainer
      fullHeight
      threshold={0}
      backButtonPlaceholder={<BackButtonLabel text="Offer Detail" />}>
      <View
        style={[
          flex.flex1,
          flex.flexCol,
          padding.top.xlarge2,
          padding.bottom.default,
        ]}>
        {campaign && businessPeople && (
          <CampaignDetailSection
            businessPeople={businessPeople}
            campaign={campaign}
          />
        )}
        <Seperator />
        <PagerView
          style={[flex.flex1]}
          initialPage={Math.max((offer?.negotiations.length || 0) - 1, 0)}
          onPageSelected={e => {
            console.log(
              'offer detail screen pindah pager',
              e.nativeEvent.position,
            );
            const newIndex = e.nativeEvent.position;
            if (activeViewNegotiateIndex !== newIndex) {
              setActiveViewNegotiateIndex(newIndex);
            }
          }}>
          {offer?.negotiations
            .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
            .map((negotiation, index) => (
              <NegotiateView key={index} negotiation={negotiation} />
            ))}
        </PagerView>
        <View style={[flex.flexCol, gap.default]}>
          <View style={[flex.flexRow, gap.xsmall, justify.center]}>
            {offer?.negotiations.map((_, index) => (
              <CircleIcon
                key={index}
                size="small"
                color={
                  index === activeViewNegotiateIndex
                    ? COLOR.green[50]
                    : COLOR.text.neutral.low
                }
              />
            ))}
          </View>
          {offer &&
            (offer.isPending() || offer.isNegotiating()) &&
            activeViewNegotiateIndex === offer.negotiations.length - 1 && (
              <OfferAction offer={offer} onSuccess={navigateBack} />
            )}
        </View>
      </View>
    </PageWithBackButton>
  );
};

interface NegotiateViewProps {
  negotiation: Negotiation;
}

const NegotiateView = ({negotiation}: NegotiateViewProps) => {
  return (
    <ScrollView
      contentContainerStyle={[
        flex.grow,
        flex.flexCol,
        gap.medium,
        padding.top.medium,
        padding.bottom.xlarge,
      ]}>
      <View style={(flex.flexCol, gap.large, padding.horizontal.default)}>
        <Text
          style={[
            textColor(COLOR.text.neutral.high),
            font.weight.bold,
            font.size[40],
          ]}>
          {'Offered Task'}
        </Text>
        <View style={[flex.flexCol, gap.default]}>
          {negotiation?.tasks?.map((negotiationTask, index) => (
            <CampaignPlatformAccordion
              key={index}
              platform={{
                name: negotiationTask.name,
                tasks: negotiationTask.tasks,
              }}
            />
          ))}
        </View>
      </View>
      {negotiation.notes && [
        <Seperator key={'notes-seperator'} />,
        <View
          key={'notes-content'}
          style={[flex.flexCol, gap.small, padding.horizontal.default]}>
          <Text
            style={[
              textColor(COLOR.text.neutral.high),
              font.weight.bold,
              font.size[40],
            ]}>
            Notes
          </Text>
          <Text>{negotiation?.notes}</Text>
        </View>,
      ]}
      <Seperator />
      <View
        style={[
          flex.flexRow,
          justify.between,
          items.center,
          padding.horizontal.default,
        ]}>
        <Text
          style={[
            textColor(COLOR.text.neutral.high),
            font.weight.bold,
            font.size[40],
          ]}>
          Offered Fee
        </Text>
        <Text
          style={[
            textColor(COLOR.text.neutral.high),
            font.weight.bold,
            font.size[40],
          ]}>
          {currencyFormat(negotiation.fee || 0)}
        </Text>
      </View>
    </ScrollView>
  );
};
