import {Text, View} from 'react-native';
import {SheetModal} from '../../containers/SheetModal';
import {flex, items, justify} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import {padding} from '../../styles/Padding';
import {textColor} from '../../styles/Text';
import {font} from '../../styles/Font';
import {COLOR} from '../../styles/Color';
import {CustomButton} from '../atoms/Button';
import {formatToRupiah} from '../../utils/currency';

type Props = {
  isModalOpened: boolean;
  onModalDismiss: () => void;
  amount: number;
};

const PaymentSheetModal = ({isModalOpened, onModalDismiss, amount}: Props) => {
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
        <View style={[flex.flexCol, items.center, gap.default]}>
          <Text
            className="font-bold"
            style={[font.size[40], textColor(COLOR.text.neutral.high)]}>
            Upload Payment Proof
          </Text>
          <Text style={[font.size[20], textColor(COLOR.text.neutral.med)]}>
            You need to pay {formatToRupiah(amount)} to Account Number
            xxxxxxxxxx by [End Date regis]
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
