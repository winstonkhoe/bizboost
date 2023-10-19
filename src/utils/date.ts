import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

export const getDate = (
  timestamp: FirebaseFirestoreTypes.Timestamp | number,
): Date => {
  console.log(timestamp);
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

export const formatDate = (date: Date, format: string): string => {
  const formatPlaceholders: Record<string, number> = {
    dd: date.getDate(),
    mm: date.getMonth() + 1,
    yyyy: date.getFullYear(),
  };

  const formattedDate = format.replace(/dd|mm|yyyy/g, match => {
    return formatPlaceholders[match] || match;
  });

  return formattedDate;
};
