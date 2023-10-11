import {ReactNode} from 'react';
import SafeAreaContainer from '../../containers/SafeAreaContainer';
import {HorizontalPadding} from '../atoms/ViewPadding';
import {SearchBar} from '../organisms/SearchBar';
import {View} from 'react-native';
import {flex} from '../../styles/Flex';
import {ScrollView} from 'react-native-gesture-handler';
import {AutoCompleteSearchItem} from '../molecules/AutoCompleteSearchItem';
import {gap} from '../../styles/Gap';
import {useAppSelector} from '../../redux/hooks';

interface Props {
  children: ReactNode;
}

export const PageWithSearchBar = ({children}: Props) => {
  const {isOnSearchPage} = useAppSelector(state => state.search);
  return (
    <SafeAreaContainer>
      <View className="h-full text-center" style={[flex.flexCol]}>
        <HorizontalPadding>
          <SearchBar />
        </HorizontalPadding>
        <View className="mb-3" />
        {isOnSearchPage ? (
          <View className="h-full w-full" style={[flex.flexCol]}>
            <ScrollView>
              <View style={[flex.flexCol, gap.default]}>
                {[...Array(10)].map((_item: any, index: number) => (
                  <HorizontalPadding key={index}>
                    <AutoCompleteSearchItem itemValue="David Disini" />
                  </HorizontalPadding>
                ))}
              </View>
            </ScrollView>
          </View>
        ) : (
          <View className="h-full w-full">{children}</View>
        )}
      </View>
    </SafeAreaContainer>
  );
};
