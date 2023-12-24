import {View} from 'react-native';
import {flex} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import {ScrollView} from 'react-native-gesture-handler';

interface MasonryLayoutProps<T = any> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
}

const MasonryLayout = ({data, renderItem}: MasonryLayoutProps) => {
  return (
    <ScrollView
      style={[flex.flex1]}
      contentContainerStyle={[flex.flexRow, gap.default]}>
      <View style={[flex.flex1, flex.flexCol, gap.default]}>
        {data.map((content, idx) => idx % 2 === 0 && renderItem(content, idx))}
      </View>
      <View style={[flex.flex1, flex.flexCol, gap.default]}>
        {data.map((content, idx) => idx % 2 !== 0 && renderItem(content, idx))}
      </View>
    </ScrollView>
  );
};

export default MasonryLayout;
