import {View, Text} from 'react-native';
import {useUser} from '../../hooks/user';
import {Offer} from '../../model/Offer';
import {CustomButton} from '../atoms/Button';
import {HorizontalPadding, VerticalPadding} from '../atoms/ViewPadding';
import {flex, items, justify} from '../../styles/Flex';
import {COLOR} from '../../styles/Color';
import {NavigationStackProps} from '../../navigation/StackNavigation';
import {SheetModal} from '../../containers/SheetModal';
import {gap} from '../../styles/Gap';
import {openNegotiateModal} from '../../utils/modal';
import {useEffect, useState} from 'react';
import {Campaign} from '../../model/Campaign';
import {User, UserRole} from '../../model/User';
import {CustomAlert} from './CustomAlert';
import {textColor} from '../../styles/Text';
import {font} from '../../styles/Font';
import {padding} from '../../styles/Padding';
import {ChatService} from '../../model/Chat';
import {Transaction, TransactionStatus} from '../../model/Transaction';

type Props = {
  offer: Offer;
  isModalOpened: boolean;
  onModalDismiss: () => void;
  navigation: NavigationStackProps;
};

const OfferActionModal = ({
  isModalOpened,
  onModalDismiss,
  offer,
  navigation,
}: Props) => {
  const {user, activeRole} = useUser();

  const [campaign, setCampaign] = useState<Campaign>();

  useEffect(() => {
    if (offer) {
      Campaign.getById(offer.campaignId || '').then(c => setCampaign(c));
    }
  }, [offer]);

  const bpId = User.extractIdFromRef(offer.businessPeopleId ?? '');
  const ccId = User.extractIdFromRef(offer.contentCreatorId ?? '');

  const acceptOffer = () => {
    if (offer) {
      offer.accept().then(acc => {
        const transaction = new Transaction({
          transactionAmount: acc.offeredPrice,
          platformTasks: acc.platformTasks,
          contentCreatorId: offer.contentCreatorId ?? '',
          businessPeopleId: offer.businessPeopleId ?? '',
          campaignId: campaign?.id ?? '',
        });

        transaction.insert(TransactionStatus.offerApproved).then(() => {
          const name =
            activeRole === UserRole.BusinessPeople
              ? user?.businessPeople?.fullname
              : user?.contentCreator?.fullname;
          const text =
            name +
            ' ' +
            (offer.negotiatedBy
              ? 'accepted a negotiation'
              : 'accepted an offer');
          ChatService.insertSystemMessage(bpId + ccId, text, activeRole).then(
            () => {
              onModalDismiss();
            },
          );
        });
      });
    }
  };

  const declineOffer = () => {
    if (offer) {
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
              ? 'rejected a negotiation'
              : 'rejected an offer');
          ChatService.insertSystemMessage(bpId + ccId, text, activeRole).then(
            () => {
              onModalDismiss();
            },
          );
        });
      });
    }
  };

  const openModalNegotiate = () => {
    onModalDismiss();
    if (offer && campaign) {
      openNegotiateModal({
        selectedOffer: offer,
        campaign: campaign,
        navigation: navigation,
        activeRole: activeRole,
      });
    }
  };

  return (
    <SheetModal open={isModalOpened} onDismiss={onModalDismiss}>
      <HorizontalPadding>
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
                        className="font-bold pb-2"
                        style={[
                          textColor(COLOR.text.neutral.high),
                          font.size[30],
                        ]}>
                        {offer?.negotiatedBy
                          ? 'Negotitated Fee'
                          : 'Offered Fee'}
                      </Text>
                      <Text
                        className="font-bold pb-2"
                        style={[
                          textColor(COLOR.text.neutral.high),
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
                onApprove={() => acceptOffer()}
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
                        className="font-bold pb-2"
                        style={[
                          textColor(COLOR.text.neutral.high),
                          font.size[30],
                        ]}>
                        {offer?.negotiatedBy
                          ? 'Negotitated Fee'
                          : 'Offered Fee'}
                      </Text>
                      <Text
                        className="font-bold pb-2"
                        style={[
                          textColor(COLOR.text.neutral.high),
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
                onApprove={() => declineOffer()}
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
                      className="font-bold pb-2"
                      style={[
                        textColor(COLOR.text.neutral.high),
                        font.size[30],
                      ]}>
                      {offer?.negotiatedBy ? 'Negotitated Fee' : 'Offered Fee'}
                    </Text>
                    <Text
                      className="font-bold pb-2"
                      style={[
                        textColor(COLOR.text.neutral.high),
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
              onApprove={() => acceptOffer()}
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
                      className="font-bold pb-2"
                      style={[
                        textColor(COLOR.text.neutral.high),
                        font.size[30],
                      ]}>
                      {offer?.negotiatedBy ? 'Negotitated Fee' : 'Offered Fee'}
                    </Text>
                    <Text
                      className="font-bold pb-2"
                      style={[
                        textColor(COLOR.text.neutral.high),
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
              onApprove={() => declineOffer()}
            />
          </View>
        ) : (
          <CustomButton text="Waiting for Content Creator" disabled />
        )}
      </HorizontalPadding>
    </SheetModal>
  );
};

export default OfferActionModal;
