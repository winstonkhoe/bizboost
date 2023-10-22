import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

export const getDate = (
  timestamp: FirebaseFirestoreTypes.Timestamp | number,
): Date => {
  if (
    typeof timestamp !== 'number' &&
    timestamp instanceof FirebaseFirestoreTypes.Timestamp
  ) {
    return timestamp.toDate();
  }
  let date = new Date(timestamp);
  if (date.getFullYear() <= 1970) {
    date = new Date(timestamp * 1000);
  }
  return date;
};
