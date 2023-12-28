import {View} from 'react-native';
import {CustomModal} from '../atoms/CustomModal';
import {flex, justify} from '../../styles/Flex';
import {padding} from '../../styles/Padding';
import {gap} from '../../styles/Gap';
import {textColor} from '../../styles/Text';
import {COLOR} from '../../styles/Color';
import {font} from '../../styles/Font';
import {CustomButton, CustomButtonProps} from '../atoms/Button';
import {ReactNode, isValidElement, useState} from 'react';
import {Text} from 'react-native';

export interface CustomAlertProps extends Partial<CustomButtonProps> {
  text: string;
  confirmationText?: string | ReactNode;
  approveButtonText?: string;
  rejectButtonText?: string;
  onApprove?: () => void;
  onReject?: () => void;
  onDismiss?: () => void;
}

export const CustomAlert = ({
  confirmationText = 'Please confirm your action, as it cannot be undone',
  approveButtonText = 'Proceed',
  rejectButtonText = 'Cancel',
  onApprove,
  onReject,
  onDismiss,
  ...props
}: CustomAlertProps) => {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const dismiss = (action?: () => void) => {
    action && action();
    setIsConfirmModalOpen(false);
    onDismiss && onDismiss();
  };
  return (
    <>
      <CustomModal transparent={true} visible={isConfirmModalOpen}>
        <View style={[flex.flexCol, padding.default, gap.large]}>
          <View style={[flex.flexRow, justify.center, padding.medium]}>
            {typeof confirmationText === 'string' ? (
              <Text
                className="text-center"
                style={[font.size[30], textColor(COLOR.text.neutral.med)]}>
                {confirmationText}
              </Text>
            ) : isValidElement(confirmationText) ? (
              confirmationText
            ) : null}
          </View>
          <View style={[flex.flexRow, gap.large, justify.center]}>
            <CustomButton
              text={rejectButtonText}
              type="tertiary"
              customTextColor={{
                default: COLOR.text.danger.default,
                disabled: COLOR.red[10],
              }}
              onPress={() => {
                dismiss(onReject);
              }}
            />
            <CustomButton
              text={approveButtonText}
              onPress={() => {
                dismiss(onApprove);
              }}
            />
          </View>
        </View>
      </CustomModal>
      <CustomButton
        {...props}
        onPress={() => {
          setIsConfirmModalOpen(true);
        }}
      />
    </>
  );
};
