import React from 'react';
import SafeAreaContainer from '../../containers/SafeAreaContainer';
import {CloseModal} from '../../components/atoms/Close';
import {ScrollView} from 'react-native-gesture-handler';
import {flex} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import {padding} from '../../styles/Padding';
import {Text} from 'react-native';
import {View} from 'react-native';

const PayCampaignScreen = () => {
  return (
    <SafeAreaContainer enable>
      <CloseModal />
      <ScrollView>
        <View style={[flex.flexCol, gap.medium, padding.horizontal.default]}>
          <Text className="text-lg font-bold">PayCampaignScreen</Text>
          <Text>SOON</Text>
        </View>
      </ScrollView>
    </SafeAreaContainer>
  );
};

export default PayCampaignScreen;
