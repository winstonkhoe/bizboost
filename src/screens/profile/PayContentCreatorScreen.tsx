import {ScrollView, Text, View} from 'react-native';
import {CloseModal} from '../../components/atoms/Close';
import SafeAreaContainer from '../../containers/SafeAreaContainer';
import {flex} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import {padding} from '../../styles/Padding';

const PayContentCreatorScreen = () => {
  return (
    <SafeAreaContainer enable>
      <CloseModal />
      <ScrollView>
        <View style={[flex.flexCol, gap.medium, padding.horizontal.default]}>
          <Text className="text-lg font-bold">PayContentCreatorScreen</Text>
          <Text>SOON</Text>
        </View>
      </ScrollView>
    </SafeAreaContainer>
  );
};

export default PayContentCreatorScreen;
