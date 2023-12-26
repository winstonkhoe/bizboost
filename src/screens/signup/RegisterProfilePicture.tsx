import {View} from 'react-native';
import {flex, items, justify} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import {MediaUploader} from '../../components/atoms/Input';
import {Text} from 'react-native';
import {textColor} from '../../styles/Text';
import {COLOR} from '../../styles/Color';
import {font} from '../../styles/Font';
import {FormFieldHelper, FormLabel} from '../../components/atoms/FormLabel';
import {
  HorizontalPadding,
  VerticalPadding,
} from '../../components/atoms/ViewPadding';
import {dimension} from '../../styles/Dimension';
import {rounded} from '../../styles/BorderRadius';
import {useEffect, useState} from 'react';
import FastImage from 'react-native-fast-image';
import {getSourceOrDefaultAvatar} from '../../utils/asset';
import {overflow} from '../../styles/Overflow';

interface RegisterProfilePictureProps {
  defaultProfile?: string;
  onProfilePictureChange: (profilePicture: string) => void;
}

export const RegisterProfilePicture = ({
  defaultProfile,
  onProfilePictureChange,
}: RegisterProfilePictureProps) => {
  const [uploadedImage, setUploadedImage] = useState<string | undefined>(
    defaultProfile,
  );

  useEffect(() => {
    if (uploadedImage) {
      onProfilePictureChange(uploadedImage);
    }
  }, [uploadedImage, onProfilePictureChange]);

  return (
    <VerticalPadding paddingSize="large">
      <HorizontalPadding paddingSize="large">
        <View style={[flex.flexCol, gap.medium]}>
          <View style={[flex.flexCol, items.center, gap.xlarge]}>
            <View style={[flex.flexRow, justify.center, items.center]}>
              <FormFieldHelper
                title="Profile Picture"
                description="You can always change it later"
                type="optional"
              />
            </View>
            <View style={[dimension.square.xlarge7]}>
              <MediaUploader
                targetFolder="profile-pictures"
                showUploadProgress
                options={{
                  width: 400,
                  height: 400,
                  cropping: true,
                }}
                onUploadSuccess={setUploadedImage}
                onMediaSelected={imageOrVideo => console.log(imageOrVideo)}>
                <View style={[rounded.medium, overflow.hidden]}>
                  <FastImage
                    style={[dimension.full]}
                    source={getSourceOrDefaultAvatar({
                      uri: uploadedImage,
                    })}
                  />
                </View>
              </MediaUploader>
            </View>
          </View>
        </View>
      </HorizontalPadding>
    </VerticalPadding>
  );
};
