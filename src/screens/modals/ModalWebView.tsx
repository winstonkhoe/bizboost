import {View} from 'react-native';
import {CustomModal} from '../../components/atoms/CustomModal';
import {flex, justify} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import {dimension} from '../../styles/Dimension';
import {background} from '../../styles/BackgroundColor';
import {COLOR} from '../../styles/Color';
import {padding} from '../../styles/Padding';
import WebView from 'react-native-webview';
import {rounded} from '../../styles/BorderRadius';
import {CustomButton} from '../../components/atoms/Button';
import {font} from '../../styles/Font';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

interface ModalWebViewProps {
  url: string;
  visible: boolean;
  onClose?: () => void;
}

export const ModalWebView = ({...props}: ModalWebViewProps) => {
  const safeAreaInsets = useSafeAreaInsets();
  return (
    <CustomModal
      transparent
      visible={props.visible}
      removeDefaultBackground
      removeDefaultPadding>
      <View
        style={[
          flex.flexCol,
          gap.medium,
          justify.center,
          dimension.width.full,
          dimension.height.full,
          background(COLOR.black[0], 0.4),
          padding.horizontal.medium,
          {
            paddingTop: safeAreaInsets.top,
            paddingBottom: safeAreaInsets.bottom,
          },
        ]}>
        <View
          style={[
            dimension.width.full,
            {
              height: '85%',
            },
          ]}>
          <WebView
            style={[rounded.large]}
            source={{
              uri: props.url,
            }}
          />
        </View>
        <CustomButton
          text="Close Preview"
          customTextSize={font.size[30]}
          rounded="large"
          verticalPadding="medium"
          onPress={props?.onClose}
        />
      </View>
    </CustomModal>
  );
};
