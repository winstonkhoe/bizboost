import {Modal, ModalProps} from 'react-native';
import {View} from 'react-native';
import {flex, justify} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import {background} from '../../styles/BackgroundColor';
import {COLOR} from '../../styles/Color';
import {HorizontalPadding} from './ViewPadding';
import {ReactNode} from 'react';
import {rounded} from '../../styles/BorderRadius';

interface CustomModalProps extends ModalProps {
  children: ReactNode;
}

export const CustomModal = ({children, ...props}: CustomModalProps) => {
  return (
    <View style={[flex.flex1]}>
      <Modal animationType="fade" {...props}>
        <View
          style={[
            flex.flex1,
            justify.center,
            gap.default,
            background(`${COLOR.black[100]}d0`),
          ]}>
          <HorizontalPadding paddingSize="xlarge">
            <View style={[rounded.default, background(COLOR.black[0])]}>
              {children}
            </View>
          </HorizontalPadding>
        </View>
      </Modal>
    </View>
  );
};
