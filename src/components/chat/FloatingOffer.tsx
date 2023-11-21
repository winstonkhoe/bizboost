import React, {useState} from 'react';
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

UIManager.setLayoutAnimationEnabledExperimental &&
  UIManager.setLayoutAnimationEnabledExperimental(true);

interface Props {
  offers: Transaction[];
}
const FloatingOffer = ({offers}: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Function to toggle the expansion
  const toggleExpansion = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };
  console.log('Offers: ' + offers);

  return (
    <View
      className="w-full absolute top-16 z-20 items-center justify-center"
      style={flex.flexCol}>
      <View style={flex.flexCol} className="w-full p-1 rounded-md">
        <View style={flex.flexCol} className="w-full bg-gray-100 p-3">
          <View style={flex.flexRow} className="justify-between items-center">
            <View>
              <Text className="text-md text-left">
                Last Offer : IDR 1.000.000
              </Text>
              <Text className="text-sm text-left font-bold">by You</Text>
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
                titleStyle={{fontWeight: 'bold', fontSize: 12}}
              />
              <View className="bg-white rounded-sm p-2">
                <Text>• Instagram: 5 post 10 story</Text>
                <Text>• Tiktok: Video soft selling</Text>
                <Text>Kontrak 3 bulan</Text>
              </View>
            </React.Fragment>
          )}
        </View>
      </View>
    </View>
  );
};

export default FloatingOffer;
