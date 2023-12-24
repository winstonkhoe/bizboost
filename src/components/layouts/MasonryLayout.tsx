import {View} from 'react-native';
import {flex} from '../../styles/Flex';
import {gap} from '../../styles/Gap';

interface MasonryLayoutProps<T = any> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
}

const MasonryLayout = ({data, renderItem}: MasonryLayoutProps) => {
  return (
    <View style={[flex.flex1, flex.flexRow, gap.default]}>
      <View style={[flex.flex1, flex.flexCol]}>
        {data.map((content, idx) => idx % 2 === 0 && renderItem(content, idx))}
      </View>
      <View style={[flex.flex1, flex.flexCol]}>
        {data.map((content, idx) => idx % 2 !== 0 && renderItem(content, idx))}
      </View>
    </View>
  );
};

export default MasonryLayout;
