import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import {BaseModel} from './BaseModel';
import {User} from './User';
import {Transaction} from './Transaction';

export const REPORT_COLLECTION = 'reports';

export enum ReportStatus {
  pending = 'Pending',
  resolved = 'Resolved',
}

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
  [key in ReportType]: string;
};

export const reportTypeLabelMap: ReportTypeLabelMap = {
  [ReportType.cheating]:
    'Report this when you suspect a user is not following the rules or is being dishonest.',
  [ReportType.unfairRejection]:
    'Use this when you believe your content has been rejected without a valid reason.',
  [ReportType.harassment]:
    'Choose this if you are experiencing threatening, abusive, or persistently annoying behavior from a user.',
  [ReportType.fraud]:
    'Select this if you encounter deceptive practices, such as providing false information or impersonating another user.',
  [ReportType.other]:
    'If none of the above categories apply, use this option and provide a detailed description of the issue.',
};

export class Report extends BaseModel {
  id?: string;
  transactionId?: string;
  type?: ReportType;
  status?: ReportStatus;
  reason?: string;
  actionTaken?: ActionTaken;
  actionTakenReason?: string;
  reporterId?: string;
  createdAt?: number;
  updatedAt?: number;

  constructor({
    id,
    transactionId,
    type,
    status,
    reason,
    actionTaken,
    actionTakenReason,
    reporterId,
    createdAt,
    updatedAt,
  }: Partial<Report>) {
    super();
    this.id = id;
    this.transactionId = transactionId;
    this.type = type;
    this.status = status;
    this.reason = reason;
    this.actionTaken = actionTaken;
    this.actionTakenReason = actionTakenReason;
    this.reporterId = reporterId;
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
        type: data.type,
        status: data.status,
        reason: data.reason,
        actionTaken: data.actionTaken,
        actionTakenReason: data.actionTakenReason,
        reporterId: data.reporterId.id,
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
      const {reporterId, transactionId, ...rest} = this;
      if (!reporterId) {
        throw Error('Missing reporter identifier');
      }
      if (!transactionId) {
        throw Error('Missing transaction identifier');
      }
      const data = {
        ...rest,
        id: undefined,
        reporterId: User.getDocumentReference(reporterId),
        transactionId: Transaction.getDocumentReference(transactionId),
        createdAt: new Date().getTime(),
      };
      await Report.getCollectionReference().add(data);
    } catch (error) {
      console.log(error);
    }
    throw Error('Report.insert err!');
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
}
