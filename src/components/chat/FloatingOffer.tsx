import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import {flex} from '../../styles/Flex';
import ChevronDown from '../../assets/vectors/chevron-down.svg';
import ChevronUp from '../../assets/vectors/chevron-up.svg';
import {COLOR} from '../../styles/Color';
import {Button} from 'react-native-elements';
import {Transaction} from '../../model/Transaction';
import {User, UserRole} from '../../model/User';
import {useUser} from '../../hooks/user';
import {useNavigation} from '@react-navigation/native';
import {
  AuthenticatedNavigation,
  NavigationStackProps,
} from '../../navigation/StackNavigation';

UIManager.setLayoutAnimationEnabledExperimental &&
  UIManager.setLayoutAnimationEnabledExperimental(true);

interface Props {
  offers: Transaction[];
  recipientName: string;
}
const FloatingOffer = ({offers, recipientName}: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigation = useNavigation<NavigationStackProps>();

  const {activeRole, user} = useUser();
  const businessPeople =
    activeRole === UserRole.BusinessPeople
      ? user?.businessPeople?.fullname
      : recipientName;

  // Function to toggle the expansion
  const toggleExpansion = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };
  console.log('Offers: ' + offers[0]?.toString());

  return (
    <View
      className="w-full absolute top-16 z-20 items-center justify-center"
      style={flex.flexCol}>
      <View style={flex.flexCol} className="w-full p-1 rounded-md">
        <View style={flex.flexCol} className="w-full bg-gray-100 py-3">
          <View
            style={flex.flexRow}
            className="justify-between items-center px-3">
            <View>
              <Text className="text-md text-left text-black">
                Last Offer:{' '}
                <Text className="font-bold">
                  {offers[0]?.offeredPrice?.toLocaleString('en-ID')}
                </Text>
              </Text>
              <Text className="text-xs text-left">by {businessPeople}</Text>
            </View>
            <TouchableOpacity onPress={toggleExpansion}>
              {isExpanded ? (
                // Display the new SVG icon when expanded
                <ChevronUp width={20} height={10} color={COLOR.black[100]} />
              ) : (
                // Display the original ChevronDown icon when not expanded
                <ChevronDown width={20} height={10} color={COLOR.black[100]} />
              )}
            </TouchableOpacity>
          </View>
          {isExpanded && (
            <React.Fragment>
              <View className="pb-4 px-3 border-b border-b-zinc-300">
                <Button
                  title="See Campaign Details"
                  buttonStyle={{
                    width: '50%',
                    backgroundColor: '#258842',
                    borderWidth: 1,
                    borderColor: 'white',
                    borderRadius: 5,
                    paddingVertical: 10,
                    marginVertical: 10,
                  }}
                  onPress={() => {
                    navigation.navigate(
                      AuthenticatedNavigation.CampaignDetail,
                      {
                        campaignId: offers[0]?.campaignId || '',
                      },
                    );
                  }}
                  titleStyle={{fontWeight: 'bold', fontSize: 12}}
                />
                {offers[0].importantNotes &&
                  offers[0].importantNotes.map((note, idx) => (
                    <View key={idx} className="bg-white rounded-sm p-2">
                      <Text>• {note}</Text>
                    </View>
                  ))}
              </View>
              {offers.length > 1 &&
                offers.slice(1).map(offer => (
                  <View
                    key={offer.id}
                    style={flex.flexCol}
                    className="w-full px-3 bg-gray-100 pt-3">
                    <View
                      style={flex.flexRow}
                      className="justify-between items-center">
                      <View>
                        <Text className="text-md text-left text-black">
                          Offer:{' '}
                          <Text className="font-bold">
                            IDR {offer?.offeredPrice?.toLocaleString('en-ID')}
                          </Text>
                        </Text>
                        <Text className="text-xs text-left">
                          by {businessPeople}
                        </Text>
                      </View>
                    </View>
                    <View>
                      <Button
                        title="See Campaign Details"
                        buttonStyle={{
                          width: '50%',
                          backgroundColor: '#258842',
                          borderWidth: 1,
                          borderColor: 'white',
                          borderRadius: 5,
                          paddingVertical: 10,
                          marginVertical: 10,
                        }}
                        onPress={() => {
                          navigation.navigate(
                            AuthenticatedNavigation.CampaignDetail,
                            {
                              campaignId: offer?.campaignId || '',
                            },
                          );
                        }}
                        titleStyle={{fontWeight: 'bold', fontSize: 12}}
                      />
                      {offer.importantNotes &&
                        offer.importantNotes.map((note, idx) => (
                          <View key={idx} className="bg-white rounded-sm p-2">
                            <Text>• {note}</Text>
                          </View>
                        ))}
                    </View>
                  </View>
                ))}
            </React.Fragment>
          )}
        </View>
      </View>
    </View>
  );
};

export default FloatingOffer;
