import firestore from '@react-native-firebase/firestore';

export abstract class BaseModel {
  toJSON(): this {
    return Object.assign({}, this);
  }

  static setFirestoreSettings() {
    firestore().settings({
      ignoreUndefinedProperties: true,
    });
  }
}
