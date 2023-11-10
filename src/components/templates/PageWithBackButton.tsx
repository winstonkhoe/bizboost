import {ReactNode} from 'react';
import SafeAreaContainer from '../../containers/SafeAreaContainer';
import {HorizontalPadding} from '../atoms/ViewPadding';
import {flex} from '../../styles/Flex';
import {ScrollView} from 'react-native-gesture-handler';
import {BackButtonPlaceholder} from '../molecules/BackButtonPlaceholder';
import {useNavigation} from '@react-navigation/native';
import {PressableProps, View} from 'react-native';

interface Props extends PressableProps {
  children: ReactNode;
  icon?: 'back' | 'close';
  backButtonPlaceholder?: ReactNode;
  fullHeight?: boolean;
  disableDefaultOnPress?: boolean;
}

export const PageWithBackButton = ({
  children,
  icon = 'back',
  backButtonPlaceholder,
  fullHeight = false,
  disableDefaultOnPress = false,
  ...props
}: Props) => {
  const navigation = useNavigation();
  return (
    <ScrollView
      bounces={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={fullHeight && {flexGrow: 1}}
      style={[flex.flexCol]}>
      <SafeAreaContainer>
        <HorizontalPadding>
          <BackButtonPlaceholder
            icon={icon}
            onPress={
              disableDefaultOnPress
                ? props.onPress
                : () => {
                    navigation.goBack();
                  }
            }>
            {backButtonPlaceholder}
          </BackButtonPlaceholder>
        </HorizontalPadding>
        {children}
      </SafeAreaContainer>
    </ScrollView>
  );
};
