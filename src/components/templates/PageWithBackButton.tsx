import {ReactNode} from 'react';
import SafeAreaContainer from '../../containers/SafeAreaContainer';
import {HorizontalPadding} from '../atoms/ViewPadding';
import {flex} from '../../styles/Flex';
import {ScrollView} from 'react-native-gesture-handler';
import {BackButtonPlaceholder} from '../molecules/BackButtonPlaceholder';
import {useNavigation} from '@react-navigation/native';

interface Props {
  children: ReactNode;
  fullHeight?: boolean;
}

export const PageWithBackButton = ({children, fullHeight = false}: Props) => {
  const navigation = useNavigation();
  return (
    <SafeAreaContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={fullHeight && {flexGrow: 1}}
        className="h-full w-full"
        style={[flex.flexCol]}>
        <HorizontalPadding>
          <BackButtonPlaceholder
            onPress={() => {
              navigation.goBack();
            }}
          />
        </HorizontalPadding>
        {children}
      </ScrollView>
    </SafeAreaContainer>
  );
};
