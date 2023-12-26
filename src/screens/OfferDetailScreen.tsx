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
import {flex, items, justify} from '../styles/Flex';
import {CampaignDetailSection} from './transaction/TransactionDetailScreen';
import {User, UserRole} from '../model/User';
import CampaignPlatformAccordion from '../components/molecules/CampaignPlatformAccordion';
import {openNegotiateModal} from '../utils/modal';
import {useNavigation} from '@react-navigation/native';
import {
  HorizontalPadding,
  VerticalPadding,
} from '../components/atoms/ViewPadding';
import {CustomButton} from '../components/atoms/Button';
import {gap} from '../styles/Gap';
import {useUser} from '../hooks/user';
import {CustomAlert} from '../components/molecules/CustomAlert';
import {padding} from '../styles/Padding';
import {Chat, MessageType} from '../model/Chat';
import {Seperator} from '../components/atoms/Separator';
import {Transaction, TransactionStatus} from '../model/Transaction';
import {showToast} from '../helpers/toast';
import {ToastType} from '../providers/ToastProvider';
import {ErrorMessage} from '../constants/errorMessage';
import {BackButtonLabel} from '../components/atoms/Header';

type Props = NativeStackScreenProps<
  AuthenticatedStack,
  AuthenticatedNavigation.OfferDetail
>;

export const OfferDetailScreen = ({route}: Props) => {
  const {offerId} = route.params;

  const [offer, setOffer] = useState<Offer | null>();
  const [campaign, setCampaign] = useState<Campaign>();
  const [businessPeople, setBusinessPeople] = useState<User | null>();
  const {user, activeRole} = useUser();

  const navigation = useNavigation<NavigationStackProps>();

  const bpId = offer?.businessPeopleId ?? '';
  const ccId = offer?.contentCreatorId ?? '';

  useEffect(() => {
    if (offerId) {
      Offer.getById(offerId)
        .then(setOffer)
        .catch(() => setOffer(null));
    }
  }, [offer, offerId]);

  useEffect(() => {
    if (offer && offer.campaignId) {
      return Campaign.getByIdReactive(offer.campaignId, setCampaign);
    }
  }, [offer]);

  useEffect(() => {
    if (offer && offer.businessPeopleId) {
      User.getById(offer.businessPeopleId)
        .then(setBusinessPeople)
        .catch(() => setBusinessPeople(null));
    }
  }, [offer]);

  const onAcceptOfferClicked = () => {
    if (
      !offer ||
      !offer.contentCreatorId ||
      !offer?.businessPeopleId ||
      !campaign?.id ||
      !activeRole
    ) {
      showToast({
        type: ToastType.info,
        message: ErrorMessage.GENERAL,
      });
      return;
    }
    offer.accept().then(acc => {
      const transaction = new Transaction({
        transactionAmount: acc.offeredPrice,
        platformTasks: acc.platformTasks,
        contentCreatorId: offer.contentCreatorId,
        businessPeopleId: offer.businessPeopleId,
        campaignId: campaign?.id ?? '',
      });

      transaction
        .updateStatus(TransactionStatus.offerWaitingForPayment)
        .then(() => {
          const name =
            activeRole === UserRole.BusinessPeople
              ? user?.businessPeople?.fullname
              : user?.contentCreator?.fullname;
          const text = `${name} ${
            offer.negotiatedBy
              ? 'accepted negotiation for'
              : 'accepted offer for'
          } ${
            campaign?.title
          }. Transaction will begin after Business People have finished payment.`;
          Chat.insertMessage(
            bpId + ccId,
            MessageType.System,
            activeRole,
            text,
          ).then(() => {
            navigation.goBack();
          });
        });
    });
  };

  const onRejectOfferClicked = () => {
    if (
      !offer ||
      !offer.contentCreatorId ||
      !offer?.businessPeopleId ||
      !campaign?.id ||
      !activeRole
    ) {
      showToast({
        type: ToastType.info,
        message: ErrorMessage.GENERAL,
      });
      return;
    }
    offer.reject().then(() => {
      const transaction = new Transaction({
        contentCreatorId: offer.contentCreatorId ?? '',
        businessPeopleId: offer.businessPeopleId ?? '',
        campaignId: campaign.id ?? '',
      });

      transaction.updateStatus(TransactionStatus.offerRejected).then(() => {
        const name =
          activeRole === UserRole.BusinessPeople
            ? user?.businessPeople?.fullname
            : user?.contentCreator?.fullname;
        const text =
          name +
          ' ' +
          (offer.negotiatedBy
            ? 'rejected negotiation for'
            : 'rejected offer for') +
          ' ' +
          campaign?.title;

        Chat.insertMessage(
          bpId + ccId,
          MessageType.System,
          activeRole,
          text,
        ).then(() => {
          navigation.goBack();
        });
      });
    });
  };

  const openModalNegotiate = () => {
    if (!offer || !campaign || !activeRole) {
      return;
    }
    openNegotiateModal({
      selectedOffer: offer,
      campaign: campaign,
      navigation: navigation,
      activeRole: activeRole,
    });
  };

  console.log(offer);

  return (
    <PageWithBackButton
      enableSafeAreaContainer
      fullHeight
      backButtonPlaceholder={<BackButtonLabel text="Offer Detail" />}>
      <View className="pt-12">
        {campaign && businessPeople && (
          <CampaignDetailSection
            businessPeople={businessPeople}
            campaign={campaign}
          />
        )}
        <Seperator />

        <HorizontalPadding>
          <View style={(flex.flexCol, padding.top.medium)}>
            <View>
              <Text
                className="pb-2"
                style={[
                  textColor(COLOR.text.neutral.high),
                  font.weight.bold,
                  font.size[40],
                ]}>
                {offer?.negotiatedBy ? 'Previous Task' : 'Original Task'}
              </Text>
              {offer?.negotiatedBy
                ? offer?.platformTasks?.map((fp, index) => (
                    <CampaignPlatformAccordion
                      platform={{
                        name: fp.name,
                        tasks: fp.tasks,
                      }}
                      key={index}
                    />
                  ))
                : campaign?.platformTasks?.map((fp, index) => (
                    <CampaignPlatformAccordion
                      platform={{
                        name: fp.name,
                        tasks: fp.tasks,
                      }}
                      key={index}
                    />
                  ))}
            </View>
            {offer?.negotiatedTasks && offer?.negotiatedTasks.length > 0 && (
              <View>
                <Text
                  className="pb-2"
                  style={[
                    textColor(COLOR.text.neutral.high),
                    font.weight.bold,
                    font.size[40],
                  ]}>
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
            )}
          </View>

          <View>
            <Text
              className="pb-2"
              style={[
                textColor(COLOR.text.neutral.high),
                font.weight.bold,
                font.size[40],
              ]}>
              Important Notes
            </Text>
            <Text>{offer?.importantNotes}</Text>
          </View>

          {offer?.negotiatedNotes && (
            <View style={padding.top.medium}>
              <Text
                className="pb-2"
                style={[
                  textColor(COLOR.text.neutral.high),
                  font.weight.bold,
                  font.size[40],
                ]}>
                Negotiated Notes
              </Text>
              <Text>{offer?.negotiatedNotes}</Text>
            </View>
          )}

          <View
            style={[
              flex.flexRow,
              padding.top.large,
              justify.between,
              items.center,
            ]}>
            <Text
              className="pb-2"
              style={[
                textColor(COLOR.text.neutral.high),
                font.weight.bold,
                font.size[40],
              ]}>
              Offered Fee
            </Text>
            <Text
              className="pb-2"
              style={[
                textColor(COLOR.text.neutral.high),
                font.weight.bold,
                font.size[40],
              ]}>
              Rp. {offer?.offeredPrice}
            </Text>
          </View>
          {offer?.negotiatedPrice && (
            <View
              style={[
                flex.flexRow,
                padding.top.small,
                justify.between,
                items.center,
              ]}>
              <Text
                className="pb-2"
                style={[
                  textColor(COLOR.text.neutral.high),
                  font.weight.bold,
                  font.size[40],
                ]}>
                Negotiated Fee
              </Text>
              <Text
                className="pb-2"
                style={[
                  textColor(COLOR.text.neutral.high),
                  font.weight.bold,
                  font.size[40],
                ]}>
                Rp. {offer?.negotiatedPrice}
              </Text>
            </View>
          )}

          <VerticalPadding paddingSize="medium">
            {offer?.negotiatedBy ? (
              offer?.negotiatedBy === activeRole ? (
                <CustomButton text="Negotiated" disabled />
              ) : (
                <View style={(flex.flexCol, gap.small)}>
                  <CustomAlert
                    confirmationText={
                      <View>
                        <Text>Are you sure you want to accept this offer?</Text>
                        <View
                          style={[
                            flex.flexRow,
                            justify.between,
                            items.center,
                            padding.top.xsmall,
                          ]}>
                          <Text
                            className="pb-2"
                            style={[
                              textColor(COLOR.text.neutral.high),
                              font.weight.bold,
                              font.size[30],
                            ]}>
                            {offer?.negotiatedBy
                              ? 'Negotitated Fee'
                              : 'Offered Fee'}
                          </Text>
                          <Text
                            className="pb-2"
                            style={[
                              textColor(COLOR.text.neutral.high),
                              font.weight.bold,
                              font.size[30],
                            ]}>
                            Rp.{' '}
                            {offer?.negotiatedPrice
                              ? offer.negotiatedPrice
                              : offer?.offeredPrice}
                          </Text>
                        </View>
                      </View>
                    }
                    text="Accept"
                    approveButtonText="Accept"
                    onApprove={() => onAcceptOfferClicked()}
                  />
                  <CustomButton
                    type="secondary"
                    text="Negotiate"
                    onPress={() => openModalNegotiate()}
                  />
                  <CustomAlert
                    confirmationText={
                      <View>
                        <Text
                          style={[
                            textColor(COLOR.text.neutral.high),
                            font.size[30],
                          ]}>
                          Are you sure you want to reject this offer?
                        </Text>
                        <Text style={[textColor(COLOR.red[50]), font.size[20]]}>
                          You can't exchange offer again for this campaign
                        </Text>
                        <View
                          style={[
                            flex.flexRow,
                            justify.between,
                            items.center,
                            padding.top.xsmall,
                          ]}>
                          <Text
                            className="pb-2"
                            style={[
                              textColor(COLOR.text.neutral.high),
                              font.weight.bold,
                              font.size[30],
                            ]}>
                            {offer?.negotiatedBy
                              ? 'Negotitated Fee'
                              : 'Offered Fee'}
                          </Text>
                          <Text
                            className="pb-2"
                            style={[
                              textColor(COLOR.text.neutral.high),
                              font.weight.bold,
                              font.size[30],
                            ]}>
                            Rp.{' '}
                            {offer?.negotiatedPrice
                              ? offer.negotiatedPrice
                              : offer?.offeredPrice}
                          </Text>
                        </View>
                      </View>
                    }
                    customBackgroundColor={{
                      default: COLOR.red[60],
                      disabled: COLOR.yellow[50],
                    }}
                    text="Reject"
                    approveButtonText="Reject"
                    onApprove={() => onRejectOfferClicked()}
                  />
                </View>
              )
            ) : activeRole === UserRole.ContentCreator ? (
              <View style={(flex.flexCol, gap.small)}>
                <CustomAlert
                  confirmationText={
                    <View>
                      <Text>Are you sure you want to accept this offer?</Text>
                      <View
                        style={[
                          flex.flexRow,
                          justify.between,
                          items.center,
                          padding.top.xsmall,
                        ]}>
                        <Text
                          className="pb-2"
                          style={[
                            textColor(COLOR.text.neutral.high),
                            font.weight.bold,
                            font.size[30],
                          ]}>
                          {offer?.negotiatedBy
                            ? 'Negotitated Fee'
                            : 'Offered Fee'}
                        </Text>
                        <Text
                          className="pb-2"
                          style={[
                            textColor(COLOR.text.neutral.high),
                            font.weight.bold,
                            font.size[30],
                          ]}>
                          Rp.{' '}
                          {offer?.negotiatedPrice
                            ? offer.negotiatedPrice
                            : offer?.offeredPrice}
                        </Text>
                      </View>
                    </View>
                  }
                  text="Accept"
                  approveButtonText="Accept"
                  onApprove={() => onAcceptOfferClicked()}
                />
                <CustomButton
                  type="secondary"
                  text="Negotiate"
                  onPress={() => openModalNegotiate()}
                />
                <CustomAlert
                  confirmationText={
                    <View>
                      <Text>Are you sure you want to reject this offer?</Text>
                      <View
                        style={[
                          flex.flexRow,
                          justify.between,
                          items.center,
                          padding.top.xsmall,
                        ]}>
                        <Text
                          className="pb-2"
                          style={[
                            textColor(COLOR.text.neutral.high),
                            font.weight.bold,
                            font.size[30],
                          ]}>
                          {offer?.negotiatedBy
                            ? 'Negotitated Fee'
                            : 'Offered Fee'}
                        </Text>
                        <Text
                          className="pb-2"
                          style={[
                            textColor(COLOR.text.neutral.high),
                            font.weight.bold,
                            font.size[30],
                          ]}>
                          Rp.{' '}
                          {offer?.negotiatedPrice
                            ? offer.negotiatedPrice
                            : offer?.offeredPrice}
                        </Text>
                      </View>
                    </View>
                  }
                  customBackgroundColor={{
                    default: COLOR.red[60],
                    disabled: COLOR.yellow[50],
                  }}
                  text="Reject"
                  approveButtonText="Reject"
                  onApprove={() => onRejectOfferClicked()}
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
