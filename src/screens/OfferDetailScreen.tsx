import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  AuthenticatedNavigation,
  AuthenticatedStack,
  NavigationStackProps,
} from '../navigation/StackNavigation';
import {Offer} from '../model/Offer';
import {useEffect, useState} from 'react';
import {View} from 'react-native';
import {PageWithBackButton} from '../components/templates/PageWithBackButton';
import {Campaign} from '../model/Campaign';
import {Text} from 'react-native';
import {COLOR} from '../styles/Color';
import {textColor} from '../styles/Text';
import {font} from '../styles/Font';
import {flex} from '../styles/Flex';
import {rounded} from '../styles/BorderRadius';
import FastImage from 'react-native-fast-image';
import {getSourceOrDefaultAvatar} from '../utils/asset';
import {CampaignDetailSection} from './transaction/TransactionDetailScreen';
import {User, UserRole} from '../model/User';
import CampaignPlatformAccordion from '../components/molecules/CampaignPlatformAccordion';
import {openNegotiateModal} from '../utils/modal';
import {useNavigation} from '@react-navigation/native';
import {
  HorizontalPadding,
  VerticalPadding,
} from '../components/atoms/ViewPadding';
import {TouchableOpacity} from 'react-native';
import {CustomButton} from '../components/atoms/Button';
import {gap} from '../styles/Gap';
import {useUser} from '../hooks/user';

type Props = NativeStackScreenProps<
  AuthenticatedStack,
  AuthenticatedNavigation.OfferDetail
>;

export const OfferDetailScreen = ({route}: Props) => {
  const {offerId, onNegotiationComplete} = route.params;

  const [offer, setOffer] = useState<Offer>();
  const [campaign, setCampaign] = useState<Campaign>();
  const [businessPeople, setBusinessPeople] = useState<User>();
  const {activeRole} = useUser();

  const navigation = useNavigation<NavigationStackProps>();

  useEffect(() => {
    Offer.getById(offerId).then(offer => {
      if (offer) {
        setOffer(offer);

        Campaign.getByIdReactive(offer.campaignId || '', c => setCampaign(c));
        User.getById(offer.businessPeopleId || '').then(u =>
          setBusinessPeople(u),
        );
      }
    });
  }, []);

  const acceptOffer = () => {
    if (offer) {
      offer.accept().then(() => {
        navigation.goBack();
      });
    }
  };

  const declineOffer = () => {
    if (offer) {
      offer.reject().then(() => {
        navigation.goBack();
      });
    }
  };

  const openModalNegotiate = () => {
    openNegotiateModal({
      selectedOffer: offer,
      campaign: campaign,
      navigation: navigation,
      onNegotiationComplete: onNegotiationComplete,
    });
  };

  console.log(offer);

  return (
    <PageWithBackButton
      enableSafeAreaContainer
      fullHeight
      backButtonPlaceholder={
        <View style={[flex.flex1, flex.flexCol]}>
          <Text
            className="font-bold"
            style={[font.size[60], textColor(COLOR.text.neutral.high)]}>
            Offer Detail
          </Text>
        </View>
      }>
      <View className="pt-12">
        {campaign && businessPeople && (
          <CampaignDetailSection
            businessPeople={businessPeople}
            campaign={campaign}
          />
        )}

        <HorizontalPadding>
          <View style={flex.flexCol}>
            {offer?.negotiatedTasks ? (
              <View>
                <Text
                  className="font-bold pb-2"
                  style={[textColor(COLOR.text.neutral.high), font.size[40]]}>
                  {'Task Negotitated'}
                </Text>
                {offer?.negotiatedTasks?.map((fp, index) => (
                  <CampaignPlatformAccordion
                    platform={{
                      name: fp.name,
                      tasks: fp.tasks,
                    }}
                    key={index}
                  />
                ))}
              </View>
            ) : (
              <View>
                <Text
                  className="font-bold pb-2"
                  style={[textColor(COLOR.text.neutral.high), font.size[40]]}>
                  {'Campaign Task'}
                </Text>
                {campaign?.platformTasks?.map((fp, index) => (
                  <CampaignPlatformAccordion
                    platform={{
                      name: fp.name,
                      tasks: fp.tasks,
                    }}
                    key={index}
                  />
                ))}
              </View>
            )}
          </View>

          <View
            style={flex.flexRow}
            className="pt-1 justify-between items-center">
            <Text
              className="font-bold pb-2"
              style={[textColor(COLOR.text.neutral.high), font.size[40]]}>
              {offer?.negotiatedBy ? 'Negotitated Fee' : 'Offered Fee'}
            </Text>
            <Text
              className="font-bold pb-2"
              style={[textColor(COLOR.text.neutral.high), font.size[60]]}>
              Rp.{' '}
              {offer?.negotiatedPrice
                ? offer.negotiatedPrice
                : offer?.offeredPrice}
            </Text>
          </View>

          <VerticalPadding>
            {offer?.negotiatedBy ? (
              offer?.negotiatedBy === activeRole ? (
                <CustomButton text="Negotiated" disabled />
              ) : (
                <View style={(flex.flexCol, gap.small)}>
                  <CustomButton text="Accept" onPress={() => acceptOffer()} />
                  <CustomButton
                    type="secondary"
                    text="Negotiate"
                    onPress={() => openModalNegotiate()}
                  />
                  <CustomButton
                    customBackgroundColor={{
                      default: COLOR.red[60],
                      disabled: COLOR.yellow[50],
                    }}
                    text="Reject"
                    onPress={() => declineOffer()}
                  />
                </View>
              )
            ) : activeRole === UserRole.ContentCreator ? (
              <View style={(flex.flexCol, gap.small)}>
                <CustomButton text="Accept" onPress={() => acceptOffer()} />
                <CustomButton
                  type="secondary"
                  text="Negotiate"
                  onPress={() => openModalNegotiate()}
                />
                <CustomButton
                  customBackgroundColor={{
                    default: COLOR.red[60],
                    disabled: COLOR.yellow[50],
                  }}
                  text="Reject"
                  onPress={() => declineOffer()}
                />
              </View>
            ) : (
              <CustomButton text="Waiting for Content Creator" disabled />
            )}
          </VerticalPadding>
        </HorizontalPadding>
      </View>
    </PageWithBackButton>
  );
};
