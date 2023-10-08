import {ScrollView, View} from 'react-native';
import {HorizontalPadding} from '../atoms/ViewPadding';
import {gap} from '../../styles/Gap';

const HorizontalScrollView = ({children}: React.PropsWithChildren) => {
  return (
    <ScrollView
      className="pb-1"
      horizontal={true}
      showsHorizontalScrollIndicator={false}>
      <HorizontalPadding>
        <View className="flex flex-row" style={gap.default}>
          {children}
        </View>
      </HorizontalPadding>
    </ScrollView>
  );
};

export {HorizontalScrollView};
