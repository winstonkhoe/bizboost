import React, {useState, useRef, useEffect, useMemo} from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import ChatHeader from '../components/chat/ChatHeader';
import ChatBubble from '../components/chat/ChatBubble';
import ChatInputBar from '../components/chat/ChatInputBar';
import ChatWidget from '../components/chat/ChatWidget';
import SafeAreaContainer from '../containers/SafeAreaContainer';

import {useUser} from '../hooks/user';
import {flex, justify, self} from '../styles/Flex';
import {background} from '../styles/BackgroundColor';
import {COLOR} from '../styles/Color';
import {HorizontalPadding} from '../components/atoms/ViewPadding';
import {gap} from '../styles/Gap';
import {Chat, Message, MessageType} from '../model/Chat';

import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  AuthenticatedNavigation,
  AuthenticatedStack,
  NavigationStackProps,
} from '../navigation/StackNavigation';
import {UserRole} from '../model/User';
import {Offer, OfferStatus} from '../model/Offer';
import {useNavigation} from '@react-navigation/native';
import {Pressable} from 'react-native';
import {Animated} from 'react-native';
import ChevronUp from '../assets/vectors/chevron-up.svg';
import ChevronDown from '../assets/vectors/chevron-down.svg';
import {rounded} from '../styles/BorderRadius';
import FastImage from 'react-native-fast-image';
import {getSourceOrDefaultAvatar} from '../utils/asset';
import {Campaign} from '../model/Campaign';
import OfferActionModal from '../components/molecules/OfferActionsModal';
import {MeatballMenuIcon} from '../components/atoms/Icon';
import {padding} from '../styles/Padding';
import {formatDateToDayMonthYear} from '../utils/date';
import {font} from '../styles/Font';
import {textColor} from '../styles/Text';

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
  const {chat, recipient} = route.params;
  const [chatData, setChatData] = useState<Chat>(chat);
  const [offers, setOffers] = useState<Offer[]>([]);
  const {user, activeRole} = useUser();

  const [isWidgetVisible, setIsWidgetVisible] = useState<boolean>(false);
  const navigation = useNavigation<NavigationStackProps>();
  const [isModalOpened, setIsModalOpened] = useState<boolean>(true);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer>();

  useEffect(() => {
    const chatRef = Chat.getDocumentReference(chat.id ?? '');

    const unsubscribe = chatRef.onSnapshot(doc => {
      if (doc.exists) {
        const updatedChatData = doc.data() as Chat;
        setChatData(updatedChatData);
      }
    });

    return () => unsubscribe();
  }, [chat.id]);

  useEffect(() => {
    if (offers.length === 1) {
      setIsExpanded(true);
    }
  }, [offers.length]);

  useEffect(() => {
    const unsubscribe = Offer.getPendingOffersbyCCBP(
      chat.businessPeopleId ?? '',
      chat.contentCreatorId ?? '',
      res => {
        const sortedTransactions = res.sort(
          (a, b) => b.createdAt - a.createdAt,
        );
        setOffers(sortedTransactions);
      },
    );

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const dateGroupedMessages = useMemo(
    () =>
      chatData.messages.reduce((acc, message) => {
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

        if (lastRoleGroupedMessages.role !== message.role) {
          addNewRoleEntry();
          return acc;
        }
        appendRoleEntry();
        return acc;
      }, [] as DateGroupedMessages[]),
    [chatData.messages],
  );

  const scrollViewRef = useRef<ScrollView>(null);

  const handleSendPress = async (message: string) => {
    if (message !== '') {
      await Chat.insertOrdinaryMessage(chat.id, message, activeRole);

      // Scroll to the end of the ScrollView
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({animated: true});
      }

      // Clear the input field
      console.log(`Sending message: ${message}`);
    }
  };

  // Handle opening the widget
  const handleOpenWidgetPress = () => {
    setIsWidgetVisible(!isWidgetVisible);
  };

  const handleImageUpload = async (downloadURL: string) => {
    // Add the new message to the chatMessages state
    await Chat.insertPhotoMessage(chat.id, downloadURL, activeRole);

    // Scroll to the end of the ScrollView
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({animated: true});
    }
  };

  const handleMakeOffer = () => {
    navigation.navigate(AuthenticatedNavigation.MakeOffer, {
      businessPeopleId: chat.businessPeopleId ?? '',
      contentCreatorId: chat.contentCreatorId ?? '',
    });
  };

  const [isExpanded, setIsExpanded] = useState(false);

  const businessPeople =
    activeRole === UserRole.BusinessPeople
      ? user?.businessPeople?.fullname
      : recipient.fullname ?? '';
  const contentCreator =
    activeRole === UserRole.ContentCreator
      ? user?.contentCreator?.fullname
      : recipient.fullname ?? '';

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

  return (
    <SafeAreaContainer enable>
      <View
        className="h-full w-full"
        style={[flex.flexCol, background(COLOR.background.neutral.default)]}>
        {/* Chat Header */}
        <View style={[flex.flexRow]}>
          <ChatHeader
            recipientName={recipient.fullname ?? ''}
            recipientPicture={recipient.profilePicture ?? ''}
          />
        </View>

        {/* Floating Tab */}
        {offers && offers.length > 0 && (
          <View className="w-full relative">
            <ScrollView
              scrollEnabled={isExpanded}
              style={[flex.flexCol, isExpanded ? styles.scroll : null]}>
              <View
                style={flex.flexCol}
                className="px-1 pt-1 rounded-t-md z-50">
                <View
                  style={flex.flexCol}
                  className="bg-gray-100 pt-3 pb-1 z-30 rounded-md">
                  <OfferCard
                    offer={offers[0]}
                    businessPeople={businessPeople || ''}
                    contentCreator={contentCreator || ''}
                    toggleExpansion={toggleExpansion}
                    setIsModalOpened={setIsModalOpened}
                    setSelectedOffer={setSelectedOffer}
                    isExpanded={isExpanded}
                  />

                  {isExpanded &&
                    offers.length > 1 &&
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
                              setIsModalOpened={setIsModalOpened}
                              setSelectedOffer={setSelectedOffer}
                            />
                          ),
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
        )}

        {/* Chat Messages */}
        <ScrollView
          // className={`offers ${offers && offers.length > 0 ? 'mt-24' : ''}`}
          ref={scrollViewRef}
          style={[flex.flex1]}
          onContentSizeChange={() => {
            if (scrollViewRef.current) {
              scrollViewRef.current?.scrollToEnd({animated: true});
            }
          }}
          stickyHeaderIndices={dateGroupedMessages.map((_, index) => index * 2)}
          contentContainerStyle={[
            flex.flexCol,
            gap.large,
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
                            key={messageIndex}
                            message={message}
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
            onSendPress={handleSendPress}
            onOpenWidgetPress={handleOpenWidgetPress}
            isWidgetVisible={isWidgetVisible}
          />

          {/* Chat Widget */}
          {isWidgetVisible ? (
            <View style={[flex.grow]}>
              <ChatWidget
                options={{
                  cropping: false,
                }}
                handleImageUpload={handleImageUpload}
                handleMakeOffer={handleMakeOffer}
              />
            </View>
          ) : null}
        </View>
      </View>
      {isModalOpened && selectedOffer && (
        <OfferActionModal
          isModalOpened={isModalOpened}
          onModalDismiss={() => {
            setIsModalOpened(false);
            console.log('ondismissed', isModalOpened);
          }}
          offer={selectedOffer}
          navigation={navigation}
        />
      )}
    </SafeAreaContainer>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  scroll: {
    maxHeight: 300,
  },
  meatball: {
    width: 100,
    backgroundColor: 'red',
    position: 'absolute',
    top: 20,
    right: 5,
    zIndex: 1,
  },
});

type OfferCardProps = {
  offer: Offer;
  businessPeople: string;
  contentCreator: string;
  isExpanded?: boolean;
  toggleExpansion?: () => void;
  setIsModalOpened: (isModalOpened: boolean) => void;
  setSelectedOffer: (offer: Offer) => void;
};

const OfferCard = ({
  offer,
  businessPeople,
  contentCreator,
  isExpanded = true,
  toggleExpansion,
  setIsModalOpened,
  setSelectedOffer,
}: OfferCardProps) => {
  const [campaign, setCampaign] = useState<Campaign>();
  const navigation = useNavigation<NavigationStackProps>();
  const {activeRole} = useUser();

  useEffect(() => {
    Campaign.getById(offer.campaignId || '').then(c => setCampaign(c));
  }, [offer]);

  return (
    <View
      className="px-3 pb-2 justify-between items-center"
      style={flex.flexRow}>
      <View
        style={flex.flexRow}
        className="flex-1 justify-between items-center py-1">
        <Pressable
          style={flex.flexRow}
          className="items-start"
          onPress={() => {
            navigation.navigate(AuthenticatedNavigation.OfferDetail, {
              offerId: offer?.id || '',
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
                    Last Offer: {offer.offeredPrice}
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
      {isExpanded &&
        ((offer.negotiatedBy && offer.negotiatedBy !== activeRole) ||
          (!offer.negotiatedBy && activeRole === UserRole.ContentCreator)) && (
          <Pressable
            onPress={() => {
              setIsModalOpened(true);
              setSelectedOffer(offer);
            }}>
            <MeatballMenuIcon size="xsmall" />
          </Pressable>
        )}
    </View>
  );
};
