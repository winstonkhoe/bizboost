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

export enum ActionTaken {
  warningIssued = 'Warning Issued',
  terminateTransaction = 'Terminate Transaction',
  suspendUser = 'Suspend User',
  reject = 'Reject',
  approveTransaction = 'Approve Transaction',
}

type ActionTakenLabelMap = {
  [action in ActionTaken]: string;
};

export const actionTakenLabelMap: ActionTakenLabelMap = {
  [ActionTaken.warningIssued]: 'A warning will be issued to the user.',
  [ActionTaken.terminateTransaction]: 'The transaction will be terminated.',
  [ActionTaken.suspendUser]: 'The user will be suspended.',
  [ActionTaken.reject]: 'The report will be rejected.',
  [ActionTaken.approveTransaction]: 'The transaction will be approved.',
};

export const reportStatusPrecendence = {
  [ReportStatus.pending]: 0,
  [ReportStatus.resolved]: 1,
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
  warningNotes?: string;
  warningClosedAt?: number;

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
    warningNotes,
    warningClosedAt,
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
    this.warningNotes = warningNotes;
    this.warningClosedAt = warningClosedAt;
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
        warningNotes: data.warningNotes,
        warningClosedAt: data.warningClosedAt,
      });
    }

    throw Error("Error, document doesn't exist!");
  }

  static getCollectionReference = () => {
    return firestore().collection(REPORT_COLLECTION);
  };

  static getDocumentReference = (documentId: string) => {
    Report.setFirestoreSettings();
    return Report.getCollectionReference().doc(documentId);
  };

  static getById(id: string, onComplete: (report: Report | null) => void) {
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

  static getByTransactionIdAndReporterId(
    transactionId: string,
    reporterId: string,
    onComplete: (reports: Report[]) => void,
  ) {
    try {
      const unsubscribe = Report.getCollectionReference()
        .where(
          'transactionId',
          '==',
          Transaction.getDocumentReference(transactionId),
        )
        .where('reporterId', '==', User.getDocumentReference(reporterId))
        .onSnapshot(
          querySnapshot => {
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

  static getAll(onComplete: (reports: Report[]) => void) {
    try {
      const unsubscribe = Report.getCollectionReference().onSnapshot(
        querySnapshot => {
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

  static getAllByTransactionId(
    transactionId: string,
    onComplete: (reports: Report[]) => void,
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

  static getAllByReporterId(
    reporterId: string,
    onComplete: (reports: Report[]) => void,
  ) {
    try {
      const unsubscribe = Report.getCollectionReference()
        .where('reporterId', '==', User.getDocumentReference(reporterId))
        .onSnapshot(
          querySnapshot => {
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

  static async closeAllWarnings(reports: string[]): Promise<void> {
    try {
      const batch = firestore().batch();
      const warningClosedAt = new Date().getTime();
      reports.forEach(reportId => {
        batch.update(Report.getDocumentReference(reportId), {
          warningClosedAt,
        });
      });
      await batch.commit();
    } catch (error) {
      console.log(error);
      throw Error('Report.closeAllWarnings err! ' + error);
    }
  }

  static async getAllWarnings(reportedId: string): Promise<Report[]> {
    try {
      const querySnapshot = await Report.getCollectionReference()
        .where('reportedId', '==', User.getDocumentReference(reportedId))
        .where('warningNotes', '!=', null)
        .get();
      console.log('getAllWarnings', querySnapshot);
      if (querySnapshot.empty) {
        return [];
      }
      return querySnapshot.docs.map(Report.fromSnapshot);
    } catch (error) {
      console.log(error);
      throw Error('Report.getAllWarnings err!');
    }
  }

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
      throw Error('Report.update err!');
    }
  }

  async resolve(
    action: ActionTaken,
    reason?: string,
    warningNotes?: string,
  ): Promise<void> {
    switch (action) {
      case ActionTaken.warningIssued:
        return this.issueWarning(reason, warningNotes);
      case ActionTaken.terminateTransaction:
        return this.terminateTransaction(reason);
      case ActionTaken.suspendUser:
        return this.suspendUser(reason);
      case ActionTaken.reject:
        return this.rejectReport(reason);
      case ActionTaken.approveTransaction:
        return this.approveTransaction(reason);
      default:
        throw Error('Invalid action!');
    }
  }

  async issueWarning(reason?: string, warningNotes?: string): Promise<void> {
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
              await this.update({
                status: ReportStatus.resolved,
                actionTaken: ActionTaken.warningIssued,
                actionTakenReason: reason,
                warningNotes: warningNotes,
              });
              unsubscribe();
              resolve();
            }
          },
        );
      } catch (error) {
        console.log(error);
        reject(Error('Report.issueWarning err!'));
      }
    });
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
              await this.update({
                status: ReportStatus.resolved,
                actionTaken: ActionTaken.terminateTransaction,
                actionTakenReason: reason,
              });
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
    await this.update({
      status: ReportStatus.resolved,
      actionTaken: ActionTaken.reject,
      actionTakenReason: reason,
    });
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
              await this.update({
                status: ReportStatus.resolved,
                actionTaken: ActionTaken.approveTransaction,
                actionTakenReason: reason,
              });
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
                  await this.update({
                    status: ReportStatus.resolved,
                    actionTaken: ActionTaken.suspendUser,
                    actionTakenReason: reason,
                  });
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

  isPending() {
    return this.status === ReportStatus.pending;
  }
}
