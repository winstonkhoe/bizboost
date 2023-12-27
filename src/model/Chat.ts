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
    Chat.setFirestoreSettings();
    return firestore().collection(CHAT_COLLECTION).doc(documentId);
  }

  private static fromQuerySnapshot(
    querySnapshots: FirebaseFirestoreTypes.QuerySnapshot<FirebaseFirestoreTypes.DocumentData>,
  ): Chat[] {
    return querySnapshots.docs.map(Chat.fromSnapshot);
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

  static getFieldToCheck(role: UserRole) {
    if (role === UserRole.BusinessPeople) {
      return 'businessPeopleId';
    }
    if (role === UserRole.ContentCreator) {
      return 'contentCreatorId';
    }
    throw new Error('Chat.getFieldToCheck - Invalid role');
  }

  static getUserChatsReactive(
    userId: string,
    activeRole: UserRole,
    onChange: (chats: Chat[]) => void,
  ) {
    try {
      console.log('Chat:getUserChatsReactive:', activeRole);
      const fieldToCheck = this.getFieldToCheck(activeRole);
      return Chat.getCollectionReference()
        .where(fieldToCheck, '==', User.getDocumentReference(userId))
        .onSnapshot(
          querySnapshots => {
            onChange(Chat.fromQuerySnapshot(querySnapshots));
          },
          (error: Error) => {
            console.log('getUserChatsReactive error', error.message);
          },
        );
    } catch (error) {
      console.log('no access', error);
      return () => {};
    }
  }

  static getById(id: string, onChange: (chat: Chat) => void) {
    try {
      const unsubscribe = Chat.getDocumentReference(id).onSnapshot(
        doc => {
          onChange(Chat.fromSnapshot(doc));
        },
        (error: Error) => {
          console.log('getById error', error.message);
        },
      );

      return unsubscribe;
    } catch (error) {
      console.log('no access', error);
      return () => {};
    }
  }

  static async findOrCreateByContentCreatorIdAndBusinessPeopleId(
    contentCreatorId: string,
    businessPeopleId: string,
  ): Promise<Chat> {
    try {
      const querySnapshot = await Chat.getCollectionReference()
        .where(
          'contentCreatorId',
          '==',
          User.getDocumentReference(contentCreatorId),
        )
        .where(
          'businessPeopleId',
          '==',
          User.getDocumentReference(businessPeopleId),
        )
        .get();

      if (querySnapshot.empty) {
        const chat = new Chat({
          contentCreatorId: contentCreatorId,
          businessPeopleId: businessPeopleId,
        });
        await chat.insert();
        return chat;
      }

      return Chat.fromSnapshot(querySnapshot.docs[0]);
    } catch (error) {
      console.log(
        'Chat.findOrCreateByContentCreatorIdAndBusinessPeopleId error ' + error,
      );
      throw new Error(
        'Chat.findOrCreateByContentCreatorIdAndBusinessPeopleId error ' + error,
      );
    }
  }

  static async insertMessage(
    chatId: string,
    type: MessageType,
    role: UserRole,
    message: string,
  ) {
    try {
      await Chat.getDocumentReference(chatId).update({
        messages: firestore.FieldValue.arrayUnion({
          message: message,
          role: role,
          type: type,
          createdAt: new Date().getTime(),
        }),
      });
    } catch (error) {
      console.error(error);
      throw new Error('Chat.insertMessage error ' + error);
    }
  }

  async addMessage(type: MessageType, role: UserRole, message: string) {
    const {id} = this;
    try {
      await Chat.getDocumentReference(id).update({
        messages: firestore.FieldValue.arrayUnion({
          message: message,
          role: role,
          type: type,
          createdAt: new Date().getTime(),
        }),
      });
    } catch (error) {
      console.error(error);
      throw new Error('Chat.insertMessage error ' + error);
    }
  }

  getLatestMessage() {
    const {messages} = this;
    if (messages.length === 0) {
      return null;
    }
    return messages[messages.length - 1];
  }
}
