import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import {BaseModel} from './BaseModel';
import {User, UserRole} from './User';
import {Transaction, TransactionStatus} from './Transaction';
import {StatusType} from '../components/atoms/StatusTag';

export const REPORT_COLLECTION = 'reports';

export enum ReportStatus {
  pending = 'Pending',
  resolved = 'Resolved',
}

type ReportStatusTypeMap = {
  [key in ReportStatus]: StatusType;
};

export const reportStatusTypeMap: ReportStatusTypeMap = {
  [ReportStatus.pending]: StatusType.warning,
  [ReportStatus.resolved]: StatusType.success,
};

export enum ReportType {
  cheating = 'Cheating',
  unfairRejection = 'Unfair Rejection',
  harassment = 'Harassment',
  fraud = 'Fraud',
  other = 'Other',
}

export enum ActionTaken {
  warningIssued = 'Warning Issued',
  terminateTransaction = 'Terminate Transaction',
  suspendUser = 'Suspend User',
  reject = 'Reject',
  approveTransaction = 'Approve Transaction',
}

type ReportTypeLabelMap = {
  [type in ReportType]: {
    [key in UserRole]?: string;
  };
};
export const reportTypeLabelMap: ReportTypeLabelMap = {
  [ReportType.cheating]: {
    [UserRole.ContentCreator]:
      '· You suspect a business person is not following the rules or is being dishonest.',
    [UserRole.BusinessPeople]:
      '· You suspect a content creator is not following the rules or is being dishonest.',
  },
  [ReportType.unfairRejection]: {
    [UserRole.ContentCreator]:
      '· You believe your content has been rejected by a business person without a valid reason.',
    [UserRole.BusinessPeople]:
      "· You believe a content creator's content has been unfairly rejected.",
  },
  [ReportType.harassment]: {
    [UserRole.ContentCreator]:
      '· You are experiencing threatening, abusive, or persistently annoying behavior from a business person.',
    [UserRole.BusinessPeople]:
      '· You are experiencing threatening, abusive, or persistently annoying behavior from a content creator.',
  },
  [ReportType.fraud]: {
    [UserRole.ContentCreator]:
      '· You encounter deceptive practices, false information, or impersonation by a business person.',
    [UserRole.BusinessPeople]:
      '· You encounter deceptive practices, false information, or impersonation by a content creator.',
  },
  [ReportType.other]: {
    [UserRole.ContentCreator]:
      'If none of the above categories apply to issues with a business person, use this option and provide a detailed description of the issue.',
    [UserRole.BusinessPeople]:
      'If none of the above categories apply to issues with a content creator, use this option and provide a detailed description of the issue.',
  },
};

export class Report extends BaseModel {
  id?: string;
  transactionId?: string;
  transactionStatus?: TransactionStatus;
  type?: ReportType;
  status: ReportStatus;
  reason?: string;
  actionTaken?: ActionTaken;
  actionTakenReason?: string;
  reporterId?: string;
  reportedId?: string;
  createdAt?: number;
  updatedAt?: number;

  constructor({
    id,
    transactionId,
    transactionStatus,
    type,
    status,
    reason,
    actionTaken,
    actionTakenReason,
    reporterId,
    reportedId,
    createdAt,
    updatedAt,
  }: Partial<Report>) {
    super();
    this.id = id;
    this.transactionId = transactionId;
    this.transactionStatus = transactionStatus;
    this.type = type;
    this.status = status || ReportStatus.pending;
    this.reason = reason;
    this.actionTaken = actionTaken;
    this.actionTakenReason = actionTakenReason;
    this.reporterId = reporterId;
    this.reportedId = reportedId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  private static fromSnapshot(
    doc:
      | FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>
      | FirebaseFirestoreTypes.DocumentSnapshot<FirebaseFirestoreTypes.DocumentData>,
  ): Report {
    const data = doc.data();
    if (data && doc.exists) {
      return new Report({
        id: doc.id,
        transactionId: data.transactionId.id,
        transactionStatus: data.transactionStatus,
        type: data.type,
        status: data.status,
        reason: data.reason,
        actionTaken: data.actionTaken,
        actionTakenReason: data.actionTakenReason,
        reporterId: data.reporterId.id,
        reportedId: data.reportedId.id,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    }

    throw Error("Error, document doesn't exist!");
  }

  static getCollectionReference = () => {
    return firestore().collection(REPORT_COLLECTION);
  };

  static getDocumentReference = (documentId: string) => {
    this.setFirestoreSettings();
    return this.getCollectionReference().doc(documentId);
  };

  async insert() {
    try {
      const {reporterId, reportedId, transactionId, ...rest} = this;
      if (!reporterId) {
        throw Error('Missing reporter identifier');
      }
      if (!reportedId) {
        throw Error('Missing reported identifier');
      }
      if (!transactionId) {
        throw Error('Missing transaction identifier');
      }
      const data = {
        ...rest,
        id: undefined,
        status: ReportStatus.pending,
        reporterId: User.getDocumentReference(reporterId),
        reportedId: User.getDocumentReference(reportedId),
        transactionId: Transaction.getDocumentReference(transactionId),
        createdAt: new Date().getTime(),
      };
      await Report.getCollectionReference().add(data);
    } catch (error) {
      console.log(error);
      throw Error('Report.insert err! ' + error);
    }
  }

  async update(fields?: Partial<Report>) {
    try {
      const {id} = this;
      if (!id) {
        throw Error('Missing id');
      }
      await Report.getDocumentReference(id).update({
        ...fields,
        updatedAt: new Date().getTime(),
      });
    } catch (error) {
      console.log(error);
    }
    throw Error('Report.update err!');
  }

  async resolveReport(
    actionTaken: ActionTaken,
    reason?: string,
  ): Promise<void> {
    const {id} = this;
    if (!id) {
      throw Error('Missing id');
    }
    await Report.getDocumentReference(id).update({
      status: ReportStatus.resolved,
      actionTaken,
      actionTakenReason: reason,
    });
  }

  static getById(id: string, onComplete: (transaction: Report | null) => void) {
    try {
      const unsubscribe = Report.getCollectionReference()
        .doc(id)
        .onSnapshot(
          docSnapshot => {
            if (docSnapshot.exists) {
              onComplete && onComplete(Report.fromSnapshot(docSnapshot));
              return;
            }
            onComplete && onComplete(null);
          },
          error => {
            console.log(error);
          },
        );

      return unsubscribe;
    } catch (error) {
      console.error(error);
      throw Error('Error!');
    }
  }

  static getByTransactionId(
    transactionId: string,
    onComplete: (transaction: Report[]) => void,
  ) {
    try {
      const unsubscribe = Report.getCollectionReference()
        .where(
          'transactionId',
          '==',
          Transaction.getDocumentReference(transactionId),
        )
        .onSnapshot(
          querySnapshot => {
            if (querySnapshot.empty) {
              onComplete && onComplete([]);
              return;
            }
            onComplete &&
              onComplete(querySnapshot.docs.map(Report.fromSnapshot));
          },
          error => {
            console.log(error);
          },
        );

      return unsubscribe;
    } catch (error) {
      console.error(error);
      throw Error('Error!');
    }
  }

  static getAll(onComplete: (transactions: Report[]) => void) {
    try {
      const unsubscribe = Report.getCollectionReference().onSnapshot(
        querySnapshot => {
          if (querySnapshot.empty) {
            onComplete([]);
          } else {
            onComplete(querySnapshot.docs.map(this.fromSnapshot));
          }
        },
        error => {
          console.log(error);
        },
      );

      return unsubscribe;
    } catch (error) {
      console.error(error);
      throw Error('Error!');
    }
  }

  static getAllByTransactionId(
    transactionId: string,
    onComplete: (transactions: Report[]) => void,
  ) {
    try {
      const unsubscribe = Report.getCollectionReference()
        .where(
          'transactionId',
          '==',
          Transaction.getDocumentReference(transactionId),
        )
        .onSnapshot(
          querySnapshot => {
            if (querySnapshot.empty) {
              onComplete([]);
            } else {
              onComplete(querySnapshot.docs.map(this.fromSnapshot));
            }
          },
          error => {
            console.log(error);
          },
        );

      return unsubscribe;
    } catch (error) {
      console.error(error);
      throw Error('Error!');
    }
  }

  static getAllByReporterId(
    reporterId: string,
    onComplete: (transactions: Report[]) => void,
  ) {
    try {
      const unsubscribe = Report.getCollectionReference()
        .where('reporterId', '==', User.getDocumentReference(reporterId))
        .onSnapshot(
          querySnapshot => {
            if (querySnapshot.empty) {
              onComplete([]);
            } else {
              onComplete(querySnapshot.docs.map(this.fromSnapshot));
            }
          },
          error => {
            console.log(error);
          },
        );

      return unsubscribe;
    } catch (error) {
      console.error(error);
      throw Error('Error!');
    }
  }

  async terminateTransaction(reason?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const {transactionId} = this;
        if (!transactionId) {
          throw Error('Missing transaction identifier');
        }
        const unsubscribe = Transaction.getById(
          transactionId,
          async transaction => {
            if (transaction) {
              await transaction.terminate();
              await this.resolveReport(
                ActionTaken.terminateTransaction,
                reason,
              );
              unsubscribe();
              resolve();
            }
          },
        );
      } catch (error) {
        console.log(error);
        reject(Error('Report.terminateTransaction err!'));
      }
    });
  }

  async rejectReport(reason?: string): Promise<void> {
    const {id} = this;
    if (!id) {
      throw Error('Missing id');
    }
    await this.resolveReport(ActionTaken.reject, reason);
  }

  async approveTransaction(reason?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const {transactionId} = this;
        if (!transactionId) {
          throw Error('Missing transaction identifier');
        }
        const unsubscribe = Transaction.getById(
          transactionId,
          async transaction => {
            if (transaction) {
              await transaction.approve();
              await this.resolveReport(ActionTaken.approveTransaction, reason);
              unsubscribe();
              resolve();
            }
          },
        );
      } catch (error) {
        console.log(error);
        reject(Error('Report.approveTransaction err!'));
      }
    });
  }

  async suspendUser(reason?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const {transactionId} = this;
        if (!transactionId) {
          throw Error('Missing transaction identifier');
        }
        const unsubscribe = Transaction.getById(
          transactionId,
          async transaction => {
            if (transaction) {
              let targetSuspendUserId;
              if (this.reporterId === transaction.businessPeopleId) {
                targetSuspendUserId = transaction.contentCreatorId;
              } else {
                targetSuspendUserId = transaction.businessPeopleId;
              }
              unsubscribe();
              if (targetSuspendUserId) {
                const user = await User.getById(targetSuspendUserId);
                if (user) {
                  await user.suspend();
                  await this.resolveReport(ActionTaken.suspendUser, reason);
                  resolve();
                  return;
                }
              }
              reject(Error('Missing targer suspend user id'));
            }
          },
        );
      } catch (error) {
        console.log(error);
        reject(Error('Report.approveTransaction err!'));
      }
    });
  }
}
