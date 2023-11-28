import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import {User, UserRole} from './User';
import {BaseModel} from './BaseModel';

export enum MessageType {
  Photo = 'Photo',
  Text = 'Text',
  Offer = 'Offer',
  Negotiation = 'Negotiation',
}

export type MessageTypes =
  | MessageType.Photo
  | MessageType.Text
  | MessageType.Offer
  | MessageType.Negotiation;

export type Message = {
  message: string;
  type: MessageTypes;
  role: UserRole;
  createdAt: number;
};

export type Participant = {
  ref: string;
  role: string;
};

const CHAT_COLLECTION = 'chats';

export class Chat extends BaseModel {
  id?: string = '';
  participants: Participant[] = [];
  messages?: Message[] = [];

  constructor(data: Partial<Chat>) {
    super();
    console.log('constructor:' + data.id);
    this.id = data.id || '';
    this.participants = data.participants || [];
    this.messages = data.messages || [];
  }

  static serialize(chat: Chat): any {
    if (!chat) {
      return null;
    }

    const messages: Message[] =
      chat.messages?.map((messageData: any) => ({
        message: messageData.message,
        type: messageData.type,
        role: messageData.role,
        createdAt: messageData.createdAt,
      })) || [];

    const participants: Participant[] =
      chat.participants?.map((participantData: any) => {
        const ref = participantData.ref;
        const role = participantData.role;

        const serializedParticipant: Participant = {
          ref: ref,
          role: role,
        };

        if (participantData.fullname || participantData.profilePicture) {
          serializedParticipant.fullname = participantData.fullname;
          serializedParticipant.profilePicture = participantData.profilePicture;
        }

        return serializedParticipant;
      }) || [];

    return {
      id: chat.id,
      participants: participants,
      messages: messages,
    };
  }

  private static fromSnapshot(
    doc:
      | FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>
      | FirebaseFirestoreTypes.DocumentSnapshot<FirebaseFirestoreTypes.DocumentData>,
  ): Chat {
    const data = doc.data();
    if (data && doc.exists) {
      console.log('[fromSnapshot] data: ' + data);
      const messages: Message[] = data.messages?.map((messageData: any) => ({
        message: messageData.message,
        type: messageData.type,
        role: messageData.role,
        createdAt: messageData.createdAt.seconds,
      }));
      console.log('[fromSnapshot] data.messages: ' + data.messages);

      const participants: Participant[] = data.participants.map((p: any) => ({
        ref: p.ref.id,
        role: p.role,
      }));
      console.log('[fromSnapshot] data.participants: ' + data.participants);

      return new Chat({
        id: doc.id,
        participants: participants,
        messages: messages,
      });
    }

    throw new Error("Error, document doesn't exist!");
  }

  static getDocumentReference(
    documentId: string,
  ): FirebaseFirestoreTypes.DocumentReference<FirebaseFirestoreTypes.DocumentData> {
    return firestore().collection(CHAT_COLLECTION).doc(documentId);
  }

  private static fromQuerySnapshot(
    querySnapshots: FirebaseFirestoreTypes.QuerySnapshot<FirebaseFirestoreTypes.DocumentData>,
  ): Chat[] {
    return querySnapshots.docs.map(this.fromSnapshot);
  }

  static getChatCollections =
    (): FirebaseFirestoreTypes.CollectionReference<FirebaseFirestoreTypes.DocumentData> => {
      return firestore().collection(CHAT_COLLECTION);
    };

  async insert() {
    try {
      const {id, ...rest} = this;

      const participantRefs = this.participants.map(
        (participant: Participant) => ({
          ref: User.getDocumentReference(participant.ref),
          role: participant.role,
        }),
      );

      const data = {
        ...rest,
        participants: participantRefs,
      };

      const docRef = await firestore().collection(CHAT_COLLECTION).add(data);
      this.id = docRef.id;
      return true;
    } catch (error) {
      console.error(error);
      throw new Error('Error!');
    }
  }

  static getUserChatsReactive(
    userId: string,
    activeRole: string,
    callback: (chats: Chat[], unsubscribe: () => void) => void,
  ): void {
    try {
      const userRef = User.getDocumentReference(userId);
      const subscriber = this.getChatCollections()
        .where('participants', 'array-contains', {
          ref: userRef,
          role: activeRole,
        })
        .onSnapshot(
          (
            querySnapshots: FirebaseFirestoreTypes.QuerySnapshot<FirebaseFirestoreTypes.DocumentData>,
          ) => {
            const userChats = this.fromQuerySnapshot(querySnapshots);
            callback(userChats, subscriber);
          },
          (error: Error) => {
            console.log('getUserChatsReactive error', error.message);
          },
        );
    } catch (error) {
      console.log('no access', error);
    }
  }

  async insertMessage(newMessage: Message) {
    await ChatService.insertMessage(this.id || '', newMessage);
  }

  async convertToChatView(currentRole: UserRole): Promise<ChatView> {
    const cv: ChatView = {
      chat: Chat.serialize(this),
      recipient: {},
    };
    console.log('convertToChatView', this.toJSON());

    for (const participant of this.participants || []) {
      if (participant.role !== currentRole) {
        const role = participant.role;
        const ref = participant.ref;
        console.log(ref);

        const user = await User.getUser(ref);
        if (user) {
          const fullname =
            role === 'Business People'
              ? user.businessPeople?.fullname
              : user.contentCreator?.fullname;
          const profilePicture =
            role === 'Business People'
              ? user.businessPeople?.profilePicture
              : user.contentCreator?.profilePicture;

          if (cv.recipient) {
            cv.recipient.fullname = fullname;
            cv.recipient.profilePicture = profilePicture;
          }
        }
      }
    }
    return cv;
  }
}

export interface ChatView {
  chat: Chat;
  recipient?: {
    fullname?: string;
    profilePicture?: string;
  };
}

export class ChatService {
  static async insertMessage(chatId: string, newMessage: Message) {
    try {
      const chatRef = Chat.getDocumentReference(chatId);

      const chatDoc = await chatRef.get();
      if (chatDoc.exists) {
        const chatData = chatDoc.data() as Chat;

        const updatedMessages = chatData.messages || [];
        updatedMessages.push(newMessage);

        await chatRef.update({messages: updatedMessages});

        console.log('Message inserted successfully');
      } else {
        console.error('Chat document does not exist');
      }
    } catch (error) {
      console.error('Error inserting message:', error);
    }
  }
}
