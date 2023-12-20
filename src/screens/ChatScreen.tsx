import React, {useState, useRef, useEffect} from 'react';
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
import {flex} from '../styles/Flex';
import {background} from '../styles/BackgroundColor';
import {COLOR} from '../styles/Color';
import {HorizontalPadding} from '../components/atoms/ViewPadding';
import {gap} from '../styles/Gap';
import {Chat, ChatService, Message, MessageType} from '../model/Chat';

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

type Props = NativeStackScreenProps<
  AuthenticatedStack,
  AuthenticatedNavigation.ChatDetail
>;
const ChatScreen = ({route}: Props) => {
  const {chat} = route.params;
  const [chatData, setChatData] = useState<Chat>(chat.chat);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const {user, activeRole} = useUser();

  const [isWidgetVisible, setIsWidgetVisible] = useState<boolean>(false);
  const navigation = useNavigation<NavigationStackProps>();
  const [isModalOpened, setIsModalOpened] = useState<boolean>(true);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer>();

  // TODO: bikin Chat.getById
  useEffect(() => {
    const chatRef = Chat.getDocumentReference(chat.chat.id ?? '');

    const unsubscribe = chatRef.onSnapshot(doc => {
      if (doc.exists) {
        const updatedChatData = doc.data() as Chat;
        setChatData(updatedChatData);
      }
    });

    return () => unsubscribe();
  }, [chat.chat.id]);

  const businessPeopleId = chat.chat.participants.find(
    participant => participant.role === UserRole.BusinessPeople,
  );
  const contentCreatorId = chat.chat.participants.find(
    participant => participant.role === UserRole.ContentCreator,
  );

  useEffect(() => {
    if (offers.length === 1) {
      setIsExpanded(true);
    }
  }, [offers.length]);

  useEffect(() => {
    const unsubscribe = Offer.getPendingOffersbyCCBP(
      businessPeopleId?.ref ?? '',
      contentCreatorId?.ref ?? '',
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
  }, [businessPeopleId, contentCreatorId]);

  console.log('ChatScreen:offers:', offers);
  console.log('ChatScreen:businessPeopleId:', businessPeopleId?.ref ?? '');
  console.log('ChatScreen:contentCreatorId:', contentCreatorId?.ref ?? '');

  useEffect(() => {
    if (chatData.messages) {
      setChatMessages(chatData.messages);
    }
  }, [chatData.messages]);

  const scrollViewRef = useRef<ScrollView>(null);

  const handleSendPress = async (message: string) => {
    if (message !== '') {
      const newMessage: Message = {
        message: message,
        role: activeRole,
        type: MessageType.Text,
        createdAt: new Date().getTime(),
      };
      await new Chat(chat.chat).insertMessage(newMessage);
      setChatMessages([...chatMessages, newMessage]);

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
    // Create a new message with the image download URL
    const newMessage: Message = {
      message: downloadURL,
      type: MessageType.Photo,
      role: activeRole,
      createdAt: new Date().getTime(),
    };

    // Add the new message to the chatMessages state
    setChatMessages([...chatMessages, newMessage]);
    await new Chat(chat.chat).insertMessage(newMessage);

    // Scroll to the end of the ScrollView
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({animated: true});
    }
  };

  const handleMakeOffer = () => {
    navigation.navigate(AuthenticatedNavigation.MakeOffer, {
      businessPeopleId: businessPeopleId?.ref ?? '',
      contentCreatorId: contentCreatorId?.ref ?? '',
    });
  };

  const [isExpanded, setIsExpanded] = useState(false);

  const businessPeople =
    activeRole === UserRole.BusinessPeople
      ? user?.businessPeople?.fullname
      : chat.recipient?.fullname ?? '';
  const contentCreator =
    activeRole === UserRole.ContentCreator
      ? user?.contentCreator?.fullname
      : chat.recipient?.fullname ?? '';

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
        style={[flex.flexCol, background(COLOR.white)]}>
        {/* Chat Header */}
        <View className="items-center justify-start" style={[flex.flexRow]}>
          <ChatHeader
            recipientName={chat.recipient?.fullname ?? ''}
            recipientPicture={chat.recipient?.profilePicture ?? ''}
          />
        </View>

        {/* Floating Tab */}
        {offers && offers.length > 0 && (
          <View className="w-full relative z-10">
            <View>
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
                    <ChevronUp
                      width={20}
                      height={10}
                      color={COLOR.black[100]}
                    />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Chat Messages */}
        <ScrollView
          // className={`offers ${offers && offers.length > 0 ? 'mt-24' : ''}`}
          ref={scrollViewRef}
          onContentSizeChange={() => {
            if (scrollViewRef.current) {
              scrollViewRef.current?.scrollToEnd({animated: true});
            }
          }}>
          <Pressable onPress={() => setIsWidgetVisible(false)}>
            <View style={[flex.flexCol, gap.default]} className="py-3">
              {chatMessages &&
                chatMessages.map((message: Message, index: number) => (
                  <HorizontalPadding key={index} paddingSize="xsmall2">
                    <View className="w-full px-3">
                      <ChatBubble
                        key={index}
                        message={message.message}
                        isSender={message.role === activeRole}
                        type={message.type}
                      />
                    </View>
                  </HorizontalPadding>
                ))}
            </View>
          </Pressable>
        </ScrollView>

        <View className="py-4 border-t-[0.5px]">
          {/* Chat Input Bar */}
          <ChatInputBar
            onSendPress={handleSendPress}
            onOpenWidgetPress={handleOpenWidgetPress}
            isWidgetVisible={isWidgetVisible}
          />

          {/* Chat Widget */}
          {isWidgetVisible ? (
            <View className="w-full" style={{height: 100}}>
              <ChatWidget
                options={{
                  width: 400,
                  height: 400,
                  cropping: true,
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
