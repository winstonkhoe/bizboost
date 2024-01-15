import firestore from '@react-native-firebase/firestore';

export type UpdateFields = {[key: string]: any};

export abstract class BaseModel {
  toJSON(): this {
    return Object.assign({}, this);
  }

  constructor() {
    BaseModel.setFirestoreSettings();
  }

  static setFirestoreSettings() {
    firestore().settings({
      ignoreUndefinedProperties: true,
    });
  }
}
