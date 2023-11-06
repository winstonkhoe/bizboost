import {Image, View} from 'react-native';
import {flex, items} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import {MediaUploader} from '../../components/atoms/Input';
import {Text} from 'react-native';
import {textColor} from '../../styles/Text';
import {COLOR} from '../../styles/Color';
import {font} from '../../styles/Font';
import {FormLabel} from '../../components/atoms/FormLabel';
import {
  HorizontalPadding,
  VerticalPadding,
} from '../../components/atoms/ViewPadding';
import {dimension} from '../../styles/Dimension';
import {rounded} from '../../styles/BorderRadius';
import {useEffect, useState} from 'react';

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
            <View style={[flex.flexCol, items.center, gap.small]}>
              <Text
                className="font-bold"
                style={[textColor(COLOR.text.neutral.high), font.size[50]]}>
                Profile Picture <FormLabel type="optional" />
              </Text>
              <Text
                className="font-medium"
                style={[textColor(COLOR.text.neutral.med), font.size[30]]}>
                You can always change it later
              </Text>
            </View>
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
              <View
                className="overflow-hidden"
                style={[dimension.square.xlarge6, rounded.medium]}>
                <Image
                  style={[dimension.full]}
                  source={
                    uploadedImage
                      ? {uri: uploadedImage}
                      : require('../../assets/images/bizboost-avatar.png')
                  }
                />
              </View>
            </MediaUploader>
          </View>
        </View>
      </HorizontalPadding>
    </VerticalPadding>
  );
};
