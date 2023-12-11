import firestore from '@react-native-firebase/firestore';

export class BaseModel {
  toJSON(): this {
    return Object.assign({}, this);
  }

  static setFirestoreSettings() {
    firestore().settings({
      ignoreUndefinedProperties: true,
    });
  }
}
