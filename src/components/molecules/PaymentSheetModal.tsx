import {Text, View} from 'react-native';
import {SheetModal} from '../../containers/SheetModal';
import {flex, justify} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import {padding} from '../../styles/Padding';
import {textColor} from '../../styles/Text';
import {font} from '../../styles/Font';
import {COLOR} from '../../styles/Color';
import {CustomButton} from '../atoms/Button';

type Props = {
  isModalOpened: boolean;
  onModalDismiss: () => void;
};

const PaymentSheetModal = ({isModalOpened, onModalDismiss}: Props) => {
  return (
    <SheetModal open={isModalOpened} onDismiss={onModalDismiss}>
      <View
        style={[
          flex.flexCol,
          gap.default,
          padding.top.default,
          padding.bottom.xlarge,
          padding.horizontal.default,
        ]}>
        <View style={[flex.flexRow, justify.center]}>
          <Text
            className="font-bold"
            style={[font.size[40], textColor(COLOR.text.neutral.high)]}>
            Upload Payment Proof
          </Text>
        </View>

        <View style={[flex.flexCol]}>
          <Text>Masuk</Text>
          <CustomButton text="Save" onPress={() => {}} />
        </View>
      </View>
    </SheetModal>
  );
};

export default PaymentSheetModal;
