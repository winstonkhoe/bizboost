import React, {ReactNode, useEffect, useState} from 'react';
import {View, Text, Pressable} from 'react-native';
import {textColor} from '../../styles/Text';
import {COLOR} from '../../styles/Color';
import {flex, items, justify, self} from '../../styles/Flex';
import {Message, MessageType} from '../../model/Chat';
import FastImage from 'react-native-fast-image';
import {background} from '../../styles/BackgroundColor';
import {font, text} from '../../styles/Font';
import {padding} from '../../styles/Padding';
import {rounded} from '../../styles/BorderRadius';
import {overflow} from '../../styles/Overflow';
import {dimension} from '../../styles/Dimension';
import {formatDateToHourMinute} from '../../utils/date';
import {gap} from '../../styles/Gap';
import {SizeType, size} from '../../styles/Size';
import {Offer} from '../../model/Offer';
import {currencyFormat} from '../../utils/currency';
import {LoadingSpinner} from '../atoms/LoadingSpinner';
import {getSourceOrDefaultAvatar} from '../../utils/asset';
import {Campaign} from '../../model/Campaign';
import {useUser} from '../../hooks/user';
import {User, UserRole} from '../../model/User';
import {useNavigation} from '@react-navigation/native';
import {
  AuthenticatedNavigation,
  NavigationStackProps,
} from '../../navigation/StackNavigation';
import {EmptyPlaceholder} from '../templates/EmptyPlaceholder';

interface ChatBubbleProps {
  data: Message;
  isSender: boolean;
  isStart?: boolean;
  isLast?: boolean;
}

const ChatBubble = ({
  data,
  isSender,
  isStart = false,
  isLast = false,
}: ChatBubbleProps) => {
  const isSystemMessage = data.type === MessageType.System;
  const isTextMessage = data.type === MessageType.Text;
  const isPhotoMessage = data.type === MessageType.Photo;
  const isOfferMessage = data.type === MessageType.Offer;
  const isNegotiationMessage = data.type === MessageType.Negotiation;
  return (
    <View
      style={[
        gap.xsmall,
        items.end,
        isSystemMessage && [flex.flexRow, justify.center],
        !isSystemMessage && isSender && [flex.flexRowReverse],
        !isSystemMessage && !isSender && [flex.flexRow],
      ]}>
      {!isSystemMessage && [
        <BubbleContainer
          key={`chat-container-${data.createdAt}`}
          isSender={isSender}
          isStart={isStart}
          isLast={isLast}>
          {isTextMessage && (
            <Text
              style={[
                textColor(COLOR.text.neutral.high),
                isSender && [textColor(COLOR.absoluteBlack[90])],
                font.size[20],
              ]}>
              {data.message.content}
            </Text>
          )}
          {isOfferMessage && <OfferBubbleContent data={data} />}
          {isNegotiationMessage && (
            <>
              <Text style={[textColor(COLOR.absoluteBlack[90])]}>
                MADE A NEGOTIATION
              </Text>
              <Text
                style={[textColor(COLOR.absoluteBlack[90]), font.weight.bold]}>
                Rp. {data.message.content}
              </Text>
            </>
          )}
          {isPhotoMessage && (
            <>
              <View
                style={[
                  dimension.square.xlarge10,
                  rounded.medium,
                  overflow.hidden,
                ]}>
                {data && (
                  <FastImage
                    source={{uri: data.message.content}}
                    style={[dimension.full]}
                  />
                )}
              </View>
            </>
          )}
        </BubbleContainer>,
        <View
          key={`date-container-${data.createdAt}`}
          style={[padding.bottom.xsmall]}>
          <Text
            style={[font.size[10], textColor(COLOR.text.neutral.med)]}
            numberOfLines={1}>
            {formatDateToHourMinute(new Date(data.createdAt), false)}
          </Text>
        </View>,
      ]}
      {isSystemMessage && (
        <View style={[padding.vertical.default]}>
          <View
            style={[
              background(COLOR.black[40], 0.2),
              padding.horizontal.medium,
              padding.vertical.default,
              rounded.medium,
            ]}>
            <Text
              style={[
                self.center,
                text.center,
                textColor(COLOR.text.neutral.high),
                font.size[10],
              ]}>
              {formatDateToHourMinute(new Date(data.createdAt), false)}
            </Text>
            <Text
              style={[
                self.center,
                text.center,
                textColor(COLOR.text.neutral.high),
                font.weight.medium,
                font.size[20],
              ]}>
              {data.message.content}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

interface BubbleContainerProps {
  isSender: boolean;
  isStart: boolean;
  isLast: boolean;
  children: ReactNode;
}

const BubbleContainer = ({...props}: BubbleContainerProps) => {
  const roundedSize: SizeType = 'large';
  return (
    <View
      style={[
        !props.isSender && [
          {
            borderTopRightRadius: size[roundedSize],
            borderBottomRightRadius: size[roundedSize],
          },
          background(COLOR.black[10], 0.5),
          props.isStart && [
            {
              borderTopLeftRadius: size[roundedSize],
            },
          ],
          props.isLast && [
            {
              borderBottomLeftRadius: size[roundedSize],
            },
          ],
        ],
        props.isSender && [
          {
            borderTopLeftRadius: size[roundedSize],
            borderBottomLeftRadius: size[roundedSize],
          },
          background(COLOR.green[10]),
          props.isStart && [
            {
              borderTopRightRadius: size[roundedSize],
            },
          ],
          props.isLast && [
            {
              borderBottomRightRadius: size[roundedSize],
            },
          ],
        ],
        props.isStart && props.isLast && [rounded[roundedSize]],
        {
          maxWidth: '75%',
        },
        padding.vertical.default,
        padding.horizontal.default,
      ]}>
      {props.children}
    </View>
  );
};

interface OfferBubbleContentProps {
  data: Message;
}

const OfferBubbleContent = ({data}: OfferBubbleContentProps) => {
  const navigation = useNavigation<NavigationStackProps>();
  const offerId = data.message.offer?.offerId;
  const offerAt = data.message.offer?.offerAt;
  const {activeRole, isContentCreator} = useUser();
  const [offer, setOffer] = useState<Offer | null>();
  const [campaign, setCampaign] = useState<Campaign | null>();
  const [opponent, setOpponent] = useState<User | null>();
  const negotiate =
    offer?.negotiations.find(n => n.createdAt === offerAt) || null;
  const isFirstNegotiate =
    offer?.negotiations.findIndex(n => n.createdAt === offerAt) === 0;

  useEffect(() => {
    if (offerId) {
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
    if (offer && offer.contentCreatorId && offer.businessPeopleId) {
      if (activeRole === UserRole.BusinessPeople) {
        User.getById(offer.contentCreatorId)
          .then(setOpponent)
          .catch(() => setOpponent(null));
      }
      if (activeRole === UserRole.ContentCreator) {
        User.getById(offer.businessPeopleId)
          .then(setOpponent)
          .catch(() => setOpponent(null));
      }
    }
  }, [offer, activeRole]);

  if (
    negotiate === undefined ||
    campaign === undefined ||
    opponent === undefined
  ) {
    return <LoadingSpinner size="large" />;
  }

  if (negotiate === null) {
    return <EmptyPlaceholder title="Offer not found" />;
  }

  const getOpponentData = () => {
    if (isContentCreator && opponent?.businessPeople) {
      return opponent.businessPeople;
    }
    if (opponent?.contentCreator) {
      return opponent.contentCreator;
    }
    return undefined;
  };

  const opponentData = getOpponentData();

  const navigateToOfferDetail = () => {
    if (offer?.id) {
      navigation.navigate(AuthenticatedNavigation.OfferDetail, {
        offerId: offer.id,
      });
    }
  };

  return (
    <View style={[flex.flexCol, gap.small]}>
      <Text
        style={[
          textColor(COLOR.text.neutral.high),
          font.weight.medium,
          font.size[20],
        ]}
        numberOfLines={1}>
        {negotiate.negotiatedBy === activeRole ? 'You' : opponentData?.fullname}{' '}
        {isFirstNegotiate ? 'made an offer' : 'made a negotiation'}
      </Text>
      {campaign && (
        <Pressable
          onPress={navigateToOfferDetail}
          style={[
            flex.flexRow,
            gap.small,
            padding.small,
            rounded.medium,
            background(COLOR.background.neutral.default),
          ]}>
          <View
            style={[
              dimension.square.xlarge2,
              rounded.default,
              overflow.hidden,
            ]}>
            <FastImage
              style={[dimension.full]}
              source={getSourceOrDefaultAvatar({
                uri: campaign.image,
              })}
            />
          </View>
          <View style={[flex.flexCol]}>
            <Text
              style={[
                {
                  width: size.xlarge9,
                },
                font.size[20],
                textColor(COLOR.text.neutral.high),
              ]}
              numberOfLines={1}>
              {campaign.title}
            </Text>
            <Text
              style={[
                font.size[30],
                font.weight.bold,
                textColor(COLOR.text.neutral.high),
              ]}
              numberOfLines={1}>
              {currencyFormat(negotiate.fee || 0)}
            </Text>
          </View>
        </Pressable>
      )}
    </View>
  );
};

export default ChatBubble;
