import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import {User} from './User';
import {BaseModel} from './BaseModel';
import {useUser} from '../hooks/user';
import {formatDate} from '../utils/date';

export enum MessageType {
  Photo = 'Photo',
  Text = 'Text',
}

export type MessageTypes = MessageType.Photo | MessageType.Text;

export type Message = {
  message: string;
  type: MessageTypes;
  sender: string;
  createdAt: FirebaseFirestoreTypes.Timestamp | number | Date;
};

export type Participant = {
  ref: string;
  role: string;
};

const CHAT_COLLECTION = 'chats';

export class Chat extends BaseModel {
  id?: string = '';
  participants?: Participant[] = [];
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

    const messages: Message[] = chat.messages.map((messageData: any) => ({
      message: messageData.message,
      type: messageData.type,
      sender: messageData.sender,
      createdAt: messageData.createdAt,
    }));

    const participants: Participant[] = chat.participants.map(
      (participantData: any) => {
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
      },
    );

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
      const messages: Message[] = data.messages.map((messageData: any) => ({
        message: messageData.message,
        type: messageData.type,
        sender: messageData.sender,
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
            throw Error(error.message);
          },
        );
    } catch (error) {
      throw Error('Error!');
    }
  }

  async insertMessage(newMessage: Message) {
    try {
      const chatRef = Chat.getDocumentReference(this.id ?? '');

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

export interface ChatView {
  chat: Chat;
  recipient?: {
    fullname?: string;
    profilePicture?: string;
  };
}