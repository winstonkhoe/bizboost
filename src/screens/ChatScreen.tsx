import React, {useState, useRef, useEffect, useMemo} from 'react';
import {View, ScrollView, Text, TouchableOpacity} from 'react-native';
import ChatHeader from '../components/chat/ChatHeader';
import ChatBubble from '../components/chat/ChatBubble';
import ChatInputBar from '../components/chat/ChatInputBar';
import ChatWidget from '../components/chat/ChatWidget';

import {useUser} from '../hooks/user';
import {flex, items, justify, self} from '../styles/Flex';
import {background} from '../styles/BackgroundColor';
import {COLOR} from '../styles/Color';
import {gap} from '../styles/Gap';
import {Chat, Message, MessageType, Recipient} from '../model/Chat';

import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  AuthenticatedNavigation,
  AuthenticatedStack,
  NavigationStackProps,
} from '../navigation/StackNavigation';
import {User, UserRole} from '../model/User';
import {Offer} from '../model/Offer';
import {useNavigation} from '@react-navigation/native';
import {Pressable} from 'react-native';
import {Animated} from 'react-native';
import {rounded} from '../styles/BorderRadius';
import FastImage from 'react-native-fast-image';
import {getSourceOrDefaultAvatar} from '../utils/asset';
import {Campaign} from '../model/Campaign';
import OfferActionModal from '../components/molecules/OfferActionsModal';
import {ChevronRight, MeatballMenuIcon} from '../components/atoms/Icon';
import {padding} from '../styles/Padding';
import {formatDateToDayMonthYear} from '../utils/date';
import {font} from '../styles/Font';
import {textColor} from '../styles/Text';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {size} from '../styles/Size';
import {KeyboardAvoidingContainer} from '../containers/KeyboardAvoidingContainer';
import {showToast} from '../helpers/toast';
import {ToastType} from '../providers/ToastProvider';
import {ErrorMessage} from '../constants/errorMessage';
import {LoadingScreen} from './LoadingScreen';
import {overflow} from '../styles/Overflow';
import {shadow} from '../styles/Shadow';
import {dimension} from '../styles/Dimension';
import {currencyFormat} from '../utils/currency';

type Props = NativeStackScreenProps<
  AuthenticatedStack,
  AuthenticatedNavigation.ChatDetail
>;

interface DateGroupedMessages {
  date: number;
  messages: RoleGroupedMessages[];
}

interface RoleGroupedMessages {
  role: UserRole;
  messages: Message[];
}

const ChatScreen = ({route}: Props) => {
  const {chatId} = route.params;
  const {user, activeRole, isBusinessPeople} = useUser();
  const safeAreaInsets = useSafeAreaInsets();

  const [chat, setChat] = useState<Chat>();
  const [offers, setOffers] = useState<Offer[]>();
  const [recipient, setRecipient] = useState<Recipient | null>();

  const [isWidgetVisible, setIsWidgetVisible] = useState<boolean>(false);
  const navigation = useNavigation<NavigationStackProps>();
  const [isModalOpened, setIsModalOpened] = useState<boolean>(true);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer>();

  // TODO: bikin Chat.getById
  useEffect(() => {
    return Chat.getById(chatId, setChat);
  }, [chatId]);

  useEffect(() => {
    if (chat?.contentCreatorId && chat?.businessPeopleId) {
      User.getById(
        isBusinessPeople ? chat.contentCreatorId : chat.businessPeopleId,
      )
        .then(u => {
          const userRecipient = isBusinessPeople
            ? u?.contentCreator
            : u?.businessPeople;
          setRecipient({
            fullname: userRecipient?.fullname || 'Empty',
            profilePicture: userRecipient?.profilePicture || '',
          });
        })
        .catch(() => {
          setRecipient(null);
        });
    }
  }, [chat, isBusinessPeople]);

  useEffect(() => {
    if (chat?.businessPeopleId && chat?.contentCreatorId) {
      return Offer.getPendingOffersbyCCBP(
        chat.businessPeopleId,
        chat.contentCreatorId,
        res => {
          const sortedTransactions = res.sort(
            (a, b) => (b.createdAt || 0) - (a.createdAt || 0),
          );
          setOffers(sortedTransactions);
        },
      );
    }
  }, [chat]);

  useEffect(() => {
    if (offers && offers.length === 1) {
      setIsExpanded(true);
    }
  }, [offers]);

  const dateGroupedMessages = useMemo(() => {
    if (!chat) {
      return [];
    }
    return chat.messages.reduce((acc, message) => {
      const messageDate = new Date(message.createdAt);
      const normalizedMessageDate = new Date(
        messageDate.getFullYear(),
        messageDate.getMonth(),
        messageDate.getDate(),
      );
      const addNewDateEntry = () => {
        acc.push({
          date: normalizedMessageDate.getTime(),
          messages: [
            {
              role: message.role,
              messages: [message],
            },
          ],
        });
      };
      const addNewRoleEntry = () => {
        acc[acc.length - 1].messages.push({
          role: message.role,
          messages: [message],
        });
      };
      const appendRoleEntry = () => {
        acc[acc.length - 1].messages[
          acc[acc.length - 1].messages.length - 1
        ].messages.push(message);
      };

      if (acc.length === 0) {
        addNewDateEntry();
        return acc;
      }
      const lastDateGroupedMessages = acc[acc.length - 1];
      if (lastDateGroupedMessages.date !== normalizedMessageDate.getTime()) {
        addNewDateEntry();
        return acc;
      }
      const lastRoleGroupedMessages =
        lastDateGroupedMessages.messages[
          lastDateGroupedMessages.messages.length - 1
        ];

      if (
        [MessageType.System].findIndex(
          messageType => messageType === message.type,
        ) >= 0
      ) {
        addNewRoleEntry();
        return acc;
      }

      if (lastRoleGroupedMessages.role !== message.role) {
        addNewRoleEntry();
        return acc;
      }
      appendRoleEntry();
      return acc;
    }, [] as DateGroupedMessages[]);
  }, [chat]);

  const scrollViewRef = useRef<ScrollView>(null);

  const handleSendTextMessage = async (message: string) => {
    if (!message) {
      return;
    }
    if (!activeRole) {
      showToast({
        type: ToastType.info,
        message: ErrorMessage.GENERAL,
      });
      return;
    }
    chat
      ?.addMessage(MessageType.Text, activeRole, {
        content: message,
      })
      .catch(() => {
        showToast({
          type: ToastType.info,
          message: 'Error sending message',
        });
      })
      .finally(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({animated: true});
        }
      });
  };

  const handleSendImageMessage = async (imageUrl: string) => {
    if (!imageUrl) {
      return;
    }
    if (!activeRole) {
      showToast({
        type: ToastType.info,
        message: ErrorMessage.GENERAL,
      });
      return;
    }
    chat
      ?.addMessage(MessageType.Photo, activeRole, {
        content: imageUrl,
      })
      .catch(() => {
        showToast({
          type: ToastType.info,
          message: 'Error sending photo',
        });
      })
      .finally(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToEnd({animated: true});
        }
      });
  };

  const handleMakeOffer = () => {
    if (chat?.businessPeopleId && chat?.contentCreatorId) {
      navigation.navigate(AuthenticatedNavigation.MakeOffer, {
        businessPeopleId: chat.businessPeopleId,
        contentCreatorId: chat.contentCreatorId,
      });
    }
  };

  const [isExpanded, setIsExpanded] = useState(false);

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

  const visibleOffers = useMemo(() => {
    if (!offers) {
      return [];
    }
    return offers.slice(0, !isExpanded ? 1 : undefined);
  }, [offers, isExpanded]);

  if (recipient === undefined || offers === undefined) {
    return <LoadingScreen />;
  }

  return (
    <View
      style={[
        flex.flex1,
        flex.flexCol,
        background(COLOR.background.neutral.default),
        {
          paddingTop: Math.max(safeAreaInsets.top, size.default),
          paddingBottom: Math.max(safeAreaInsets.bottom, size.default),
        },
      ]}>
      {/* Chat Header */}
      <ChatHeader recipient={recipient} />

      {/* Floating Tab */}
      {offers && offers.length > 0 && (
        <View
          style={[
            flex.flexCol,
            rounded.medium,
            shadow.default,
            background(COLOR.background.neutral.default),
            {
              marginHorizontal: size.small,
              marginTop: size.small,
              maxHeight: size.xlarge15,
            },
          ]}>
          <ScrollView
            scrollEnabled={isExpanded}
            contentContainerStyle={[
              flex.flexCol,
              gap.default,
              padding.default,
            ]}>
            {visibleOffers.map((offer, offerIndex) => {
              const isFirst = offerIndex === 0;
              const isLast = offerIndex === visibleOffers.length - 1;
              return [
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  toggleExpansion={isFirst ? toggleExpansion : undefined}
                  setIsModalOpened={setIsModalOpened}
                  setSelectedOffer={setSelectedOffer}
                  isExpanded={isFirst ? isExpanded : undefined}
                />,
                !isLast && (
                  <View
                    key={`separator-${offerIndex}`}
                    style={[
                      {
                        borderTopColor: COLOR.black[20],
                        borderTopWidth: 0.4,
                      },
                    ]}
                  />
                ),
              ];
            })}
          </ScrollView>
          {isExpanded && offers.length > 1 && (
            <View
              style={[
                {
                  borderTopColor: COLOR.black[20],
                  borderTopWidth: 0.5,
                },
              ]}>
              <TouchableOpacity
                style={[flex.flexRow, justify.end, padding.default]}
                onPress={toggleExpansion}>
                <View
                  style={[
                    {
                      transform: [
                        {
                          rotate: '-90deg',
                        },
                      ],
                    },
                  ]}>
                  <ChevronRight size="large" />
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      <KeyboardAvoidingContainer withoutScroll>
        {/* Chat Messages */}
        <ScrollView
          // className={`offers ${offers && offers.length > 0 ? 'mt-24' : ''}`}
          // className="bg-red-500"
          ref={scrollViewRef}
          onContentSizeChange={() => {
            if (scrollViewRef.current) {
              scrollViewRef.current?.scrollToEnd({animated: true});
            }
          }}
          stickyHeaderIndices={dateGroupedMessages.map((_, index) => index * 2)}
          contentContainerStyle={[
            flex.flexCol,
            gap.xlarge,
            padding.bottom.default,
          ]}>
          {dateGroupedMessages.map(
            (dateGroupedMessage: DateGroupedMessages) => [
              <View
                key={`${dateGroupedMessage.date}-date`}
                style={[flex.flexRow, justify.center, padding.top.default]}>
                <View
                  style={[
                    self.center,
                    background(COLOR.absoluteBlack[70], 0.5),
                    padding.horizontal.default,
                    padding.vertical.small,
                    rounded.medium,
                  ]}>
                  <Text
                    style={[
                      self.center,
                      font.size[10],
                      textColor(COLOR.absoluteBlack[0]),
                      font.weight.medium,
                    ]}>
                    {formatDateToDayMonthYear(
                      new Date(dateGroupedMessage.date),
                    )}
                  </Text>
                </View>
              </View>,
              <View
                key={`${dateGroupedMessage.date}-chats`}
                style={[padding.horizontal.default, flex.flexCol, gap.default]}>
                {dateGroupedMessage.messages.map(
                  (
                    roleGroupedMessage: RoleGroupedMessages,
                    roleGroupedMessageIndex,
                  ) => (
                    <View
                      key={roleGroupedMessageIndex}
                      style={[flex.flexCol, gap.xsmall]}>
                      {roleGroupedMessage.messages.map(
                        (message: Message, messageIndex) => (
                          <ChatBubble
                            key={`${dateGroupedMessage.date}-${roleGroupedMessageIndex}-${messageIndex}`}
                            data={message}
                            isSender={message.role === activeRole}
                            isStart={messageIndex === 0}
                            isLast={
                              messageIndex ===
                              roleGroupedMessage.messages.length - 1
                            }
                          />
                        ),
                      )}
                    </View>
                  ),
                )}
              </View>,
            ],
          )}
        </ScrollView>

        <View
          style={[
            flex.flexCol,
            padding.vertical.default,
            {
              borderTopColor: COLOR.black[20],
              borderTopWidth: 1,
            },
          ]}>
          {/* Chat Input Bar */}
          <ChatInputBar
            onSendPress={handleSendTextMessage}
            isWidgetVisible={isWidgetVisible}
            onWidgetVisibilityChange={setIsWidgetVisible}
          />

          {/* Chat Widget */}
          {isWidgetVisible && (
            <ChatWidget
              options={{
                cropping: false,
              }}
              handleImageUpload={handleSendImageMessage}
              handleMakeOffer={handleMakeOffer}
            />
          )}
        </View>
      </KeyboardAvoidingContainer>

      {isModalOpened && selectedOffer && (
        <OfferActionModal
          isModalOpened={isModalOpened}
          onModalDismiss={() => {
            setIsModalOpened(false);
            console.log('ondismissed', isModalOpened);
          }}
          offer={selectedOffer}
        />
      )}
    </View>
  );
};

export default ChatScreen;

type OfferCardProps = {
  offer: Offer;
  isExpanded?: boolean;
  toggleExpansion?: () => void;
  setIsModalOpened: (isModalOpened: boolean) => void;
  setSelectedOffer: (offer: Offer) => void;
};

const OfferCard = ({
  offer,
  isExpanded = true,
  toggleExpansion,
  setIsModalOpened,
  setSelectedOffer,
}: OfferCardProps) => {
  const [campaign, setCampaign] = useState<Campaign | null>();
  const navigation = useNavigation<NavigationStackProps>();
  const {activeRole} = useUser();
  const [businessPeople, setBusinessPeople] = useState<User | null>();
  const [contentCreator, setContentCreator] = useState<User | null>();
  const latestNegotiation = offer.getLatestNegotiation();
  const negotiatedByCurrentUser =
    latestNegotiation?.negotiatedBy === activeRole;
  const negotiatedByContentCreator =
    latestNegotiation?.negotiatedBy === UserRole.ContentCreator;

  const getNegotiatedByName = () => {
    if (negotiatedByCurrentUser) {
      return 'You';
    }
    if (negotiatedByContentCreator) {
      return contentCreator?.contentCreator?.fullname;
    }
    return businessPeople?.businessPeople?.fullname;
  };

  const offeredByName = getNegotiatedByName();

  useEffect(() => {
    if (offer.campaignId) {
      Campaign.getById(offer.campaignId)
        .then(setCampaign)
        .catch(() => setCampaign(null));
    }
    if (offer.businessPeopleId) {
      User.getById(offer.businessPeopleId)
        .then(setBusinessPeople)
        .catch(() => setBusinessPeople(null));
    }
    if (offer.contentCreatorId) {
      User.getById(offer.contentCreatorId)
        .then(setContentCreator)
        .catch(() => setContentCreator(null));
    }
  }, [offer]);

  return (
    <View style={[flex.flexRow]}>
      <View style={[flex.flex1, flex.flexRow, items.center, justify.between]}>
        <Pressable
          style={[flex.flexRow, gap.default]}
          onPress={() => {
            if (offer.id) {
              navigation.navigate(AuthenticatedNavigation.OfferDetail, {
                offerId: offer?.id,
              });
            }
          }}>
          <View
            style={[
              flex.flexRow,
              rounded.default,
              dimension.square.xlarge3,
              overflow.hidden,
            ]}>
            <FastImage
              style={[dimension.full]}
              source={getSourceOrDefaultAvatar({uri: campaign?.image})}
            />
          </View>
          <View>
            <Text style={[font.size[30], textColor(COLOR.text.neutral.high)]}>
              {offer.isNegotiating() ? 'Negotiation: ' : 'Offer: '}
              <Text style={[font.weight.bold, font.size[30]]}>
                {currencyFormat(latestNegotiation?.fee || 0)}
              </Text>
            </Text>
            <Text style={[font.size[20], textColor(COLOR.text.neutral.med)]}>
              {`by ${offeredByName}`}
            </Text>
          </View>
        </Pressable>
        {!isExpanded && (
          <TouchableOpacity onPress={toggleExpansion}>
            <View
              style={[
                {
                  transform: [
                    {
                      rotate: '90deg',
                    },
                  ],
                },
              ]}>
              <ChevronRight size="large" />
            </View>
          </TouchableOpacity>
        )}
      </View>
      {isExpanded && !negotiatedByCurrentUser && (
        <TouchableOpacity
          onPress={() => {
            setIsModalOpened(true);
            setSelectedOffer(offer);
          }}>
          <MeatballMenuIcon size="xsmall" />
        </TouchableOpacity>
      )}
    </View>
  );
};
