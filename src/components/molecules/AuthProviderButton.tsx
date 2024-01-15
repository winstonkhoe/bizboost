import {Provider} from '../../model/AuthMethod';
import {CustomButton, CustomButtonProps} from '../atoms/Button';
import GoogleLogo from '../../assets/vectors/google-color-logo.svg';
import FacebookLogo from '../../assets/vectors/facebook-logo.svg';
import {View} from 'react-native';

interface AuthProviderButtonProps extends Partial<CustomButtonProps> {
  provider: Provider;
}

export const AuthProviderButton = ({
  provider,
  ...props
}: AuthProviderButtonProps) => {
  if (provider === Provider.EMAIL) {
    return (
      <CustomButton
        text={props.text ? props.text : 'Log in'}
        rounded="max"
        {...props}
      />
    );
  } else if (provider === Provider.GOOGLE) {
    return (
      <CustomButton
        text={props.text ? props.text : 'Continue With Google'}
        rounded="max"
        type="secondary"
        logo={
          <View>
            <GoogleLogo width={25} height={25} />
          </View>
        }
        {...props}
      />
    );
  } else if (provider === Provider.FACEBOOK) {
    return (
      <CustomButton
        text={props.text ? props.text : 'Continue With Facebook'}
        rounded="max"
        type="secondary"
        logo={
          <View>
            <FacebookLogo width={35} height={35} color="#0F90F3" />
          </View>
        }
        {...props}
      />
    );
  }
  return null;
};
