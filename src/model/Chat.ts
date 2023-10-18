import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import {User} from './User';
import {BaseModel} from './BaseModel';

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

  constructor({id, participants, messages}: Partial<Chat>) {
    super();
    this.id = id;
    this.participants = participants;
    this.messages = messages;
  }

  private static fromSnapshot(
    doc:
      | FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>
      | FirebaseFirestoreTypes.DocumentSnapshot<FirebaseFirestoreTypes.DocumentData>,
  ): Chat {
    const data = doc.data();
    if (data && doc.exists) {
      const messages: Message[] = data.messages.map((messageData: any) => ({
        message: messageData.message,
        type: messageData.type,
        sender: messageData.sender,
        createdAt: messageData.createdAt,
      }));

      const participants: Participant[] = data.participants.map(
        (participantData: any) => ({
          ref: participantData.ref,
          role: participantData.role,
        }),
      );

      return new Chat({
        id: doc.id,
        participants: participants,
        messages: messages,
      });
    }

    throw new Error("Error, document doesn't exist!");
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
}
