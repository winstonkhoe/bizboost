import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Text} from 'react-native';
import {
  AuthenticatedNavigation,
  AuthenticatedStack,
} from '../navigation/StackNavigation';

type Props = NativeStackScreenProps<
  AuthenticatedStack,
  AuthenticatedNavigation.BusinessPeopleDetail
>;
const BusinessPeopleDetailScreen = ({route}: Props) => {
  const {businessPeopleId} = route.params;
  return <Text>BusinessPeopleDetailScreen id:{businessPeopleId}</Text>;
};

export default BusinessPeopleDetailScreen;
