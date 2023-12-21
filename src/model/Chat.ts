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
  System = 'System',
}

export type Message = {
  message: string;
  type: MessageType;
  role: UserRole;
  createdAt: number;
};

export type Recipient = {
  fullname: string;
  profilePicture: string;
};

const CHAT_COLLECTION = 'chats';

export class Chat extends BaseModel {
  id: string;
  businessPeopleId: string;
  contentCreatorId: string;
  messages: Message[];

  constructor(data: Partial<Chat>) {
    super();
    this.messages = data.messages || [];
    this.businessPeopleId = data.businessPeopleId || '';
    this.contentCreatorId = data.contentCreatorId || '';
    this.id = this.generateId();
  }

  private generateId(): string {
    return `${this.businessPeopleId}${this.contentCreatorId}`;
  }

  public serialize(): any {
    const messages: Message[] =
      this.messages?.map((messageData: any) => ({
        message: messageData.message,
        type: messageData.type,
        role: messageData.role,
        createdAt: messageData.createdAt,
      })) || [];

    return {
      id: this.id,
      businessPeopleId: this.businessPeopleId,
      contentCreatorId: this.contentCreatorId,
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
      console.log('[Chat:fromSnapshot] data: ' + data);

      return new Chat({
        id: doc.id,
        businessPeopleId: data.businessPeopleId.id,
        contentCreatorId: data.contentCreatorId.id,
        messages: data.messages,
      });
    }

    throw new Error("Error, document doesn't exist!");
  }

  static getDocumentReference(documentId: string) {
    this.setFirestoreSettings();
    return firestore().collection(CHAT_COLLECTION).doc(documentId);
  }

  private static fromQuerySnapshot(
    querySnapshots: FirebaseFirestoreTypes.QuerySnapshot<FirebaseFirestoreTypes.DocumentData>,
  ): Chat[] {
    return querySnapshots.docs.map(this.fromSnapshot);
  }

  static getCollectionReference = () => {
    return firestore().collection(CHAT_COLLECTION);
  };

  async insert() {
    try {
      const {id, ...rest} = this;
      if (!id) {
        throw Error('Missing id');
      }
      const data = {
        ...rest,
        businessPeopleId: User.getDocumentReference(
          this.businessPeopleId ?? '',
        ),
        contentCreatorId: User.getDocumentReference(
          this.contentCreatorId ?? '',
        ),
      };

      await Chat.getDocumentReference(id).set(data);
    } catch (error) {
      console.error(error);
      throw new Error('Error!');
    }
  }

  static getUserChatsReactive(
    userId: string,
    activeRole: string,
    callback: (chats: Chat[]) => void,
  ) {
    try {
      const userRef = User.getDocumentReference(userId);
      console.log('Chat:getUserChatsReactive:', activeRole);

      let fieldToCheck = '';
      if (activeRole === UserRole.BusinessPeople) {
        fieldToCheck = 'businessPeopleId';
      } else if (activeRole === UserRole.ContentCreator) {
        fieldToCheck = 'contentCreatorId';
      }

      if (fieldToCheck) {
        const unsubscribe = this.getCollectionReference()
          .where(fieldToCheck, '==', userRef)
          .onSnapshot(
            querySnapshots => {
              callback(this.fromQuerySnapshot(querySnapshots));
            },
            (error: Error) => {
              console.log('getUserChatsReactive error', error.message);
            },
          );

        return unsubscribe;
      } else {
        console.log('Invalid role:', activeRole);
        return () => {};
      }
    } catch (error) {
      console.log('no access', error);
      return () => {};
    }
  }

  // async convertToChatView(currentRole: UserRole): Promise<ChatView> {
  //   const cv: ChatView = {
  //     chat: Chat.serialize(this),
  //     recipient: {},
  //   };
  //   console.log('convertToChatView', this.toJSON());

  //   for (const participant of this.participants || []) {
  //     if (participant.role !== currentRole) {
  //       const role = participant.role;
  //       const ref = participant.ref;
  //       console.log(ref);

  //       const user = await User.getById(ref);
  //       if (user) {
  //         const fullname =
  //           role === 'Business People'
  //             ? user.businessPeople?.fullname
  //             : user.contentCreator?.fullname;
  //         const profilePicture =
  //           role === 'Business People'
  //             ? user.businessPeople?.profilePicture
  //             : user.contentCreator?.profilePicture;

  //         if (cv.recipient) {
  //           cv.recipient.fullname = fullname;
  //           cv.recipient.profilePicture = profilePicture;
  //         }
  //       }
  //     }
  //   }
  //   return cv;
  // }

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

  static async insertOrdinaryMessage(
    chatId: string,
    message: string,
    activeRole: UserRole,
  ) {
    const newMessage: Message = {
      message: message,
      role: activeRole,
      type: MessageType.Text,
      createdAt: new Date().getTime(),
    };

    this.insertMessage(chatId, newMessage);
  }

  static async insertPhotoMessage(
    chatId: string,
    message: string,
    activeRole: UserRole,
  ) {
    const newMessage: Message = {
      message: message,
      role: activeRole,
      type: MessageType.Photo,
      createdAt: new Date().getTime(),
    };

    this.insertMessage(chatId, newMessage);
  }

  static async insertSystemMessage(
    chatId: string,
    message: string,
    activeRole: UserRole,
  ) {
    const newMessage: Message = {
      message: message,
      role: activeRole,
      type: MessageType.System,
      createdAt: new Date().getTime(),
    };

    this.insertMessage(chatId, newMessage);
  }

  static async insertOfferMessage(
    chatId: string,
    message: string,
    activeRole: UserRole,
  ) {
    const newMessage: Message = {
      message: message,
      role: activeRole,
      type: MessageType.Offer,
      createdAt: new Date().getTime(),
    };

    this.insertMessage(chatId, newMessage);
  }

  static async insertNegotiateMessage(
    chatId: string,
    message: string,
    activeRole: UserRole,
  ) {
    const newMessage: Message = {
      message: message,
      role: activeRole,
      type: MessageType.Negotiation,
      createdAt: new Date().getTime(),
    };

    this.insertMessage(chatId, newMessage);
  }
}

// export interface ChatView {
//   chat: Chat;
//   recipient?: {
//     fullname?: string;
//     profilePicture?: string;
//   };
// }
