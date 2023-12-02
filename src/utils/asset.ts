import {ImageRequireSource} from 'react-native';
import {Source} from 'react-native-fast-image';

export const getSourceOrDefaultAvatar = (
  source?: Source,
): Source | ImageRequireSource => {
  if (!source?.uri) {
    return require('../assets/images/bizboost-avatar.png');
  }
  return source;
};
