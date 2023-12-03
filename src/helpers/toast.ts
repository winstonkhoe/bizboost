import {DeviceEventEmitter} from 'react-native';
import {ToastType} from '../providers/ToastProvider';

export interface ShowToastProps {
  message: string;
  duration?: number;
  type?: ToastType;
  onClose?: () => void;
}
export const showToast = ({
  message,
  duration = 3000,
  type = ToastType.info,
  onClose = () => {},
}: ShowToastProps) => {
  DeviceEventEmitter.emit('show.toast', {
    message,
    duration,
    type,
    onClose,
  });
};
