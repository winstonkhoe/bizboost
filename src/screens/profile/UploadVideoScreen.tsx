import {ScrollView, Text, View} from 'react-native';
import {CloseModal} from '../../components/atoms/Close';
import SafeAreaContainer from '../../containers/SafeAreaContainer';
import {flex, items, justify} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import {padding} from '../../styles/Padding';
import {PageWithBackButton} from '../../components/templates/PageWithBackButton';
import {KeyboardAvoidingContainer} from '../../containers/KeyboardAvoidingContainer';
import {BackButtonLabel} from '../../components/atoms/Header';
import {Controller, FormProvider, useForm} from 'react-hook-form';
import {FormFieldHelper} from '../../components/atoms/FormLabel';
import {CustomTextInput, MediaUploader} from '../../components/atoms/Input';
import {dimension} from '../../styles/Dimension';
import {rounded} from '../../styles/BorderRadius';
import {background} from '../../styles/BackgroundColor';
import {COLOR} from '../../styles/Color';
import {border} from '../../styles/Border';
import PhotosIcon from '../../assets/vectors/photos.svg';
import {CustomButton} from '../../components/atoms/Button';
import {isValidField} from '../../utils/form';
import FastImage from 'react-native-fast-image';
import {Portfolio} from '../../model/Portfolio';
import {useUser} from '../../hooks/user';
import {showToast} from '../../helpers/toast';
import {ToastType} from '../../providers/ToastProvider';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {size} from '../../styles/Size';

export type FormData = {
  uri: string;
  description: string;
};
const UploadVideoScreen = () => {
  const {uid} = useUser();
  const navigation = useNavigation();
  const safeAreaInsets = useSafeAreaInsets();
  const methods = useForm<FormData>({
    mode: 'all',
  });
  const {handleSubmit, setValue, watch, control, getFieldState, formState} =
    methods;

  const imageSelected = (url: string) => {
    setValue('uri', url);
  };

  const onSubmit = (data: FormData) => {
    const portfolio = new Portfolio({
      uri: data.uri,
      description: data.description,
      // thumbnail:
      userId: uid || '',
    });

    portfolio.insert().then(() => {
      navigation.goBack();
      showToast({
        type: ToastType.success,
        message: 'Successfully uploaded portfolio video',
      });
    });
  };
  return (
    <FormProvider {...methods}>
      <PageWithBackButton
        fullHeight
        threshold={0}
        backButtonPlaceholder={<BackButtonLabel text="Upload Video" />}>
        <ScrollView
          style={[flex.flex1]}
          contentContainerStyle={[
            {
              paddingTop: safeAreaInsets.top + size.xlarge4,
            },
          ]}>
          <KeyboardAvoidingContainer>
            <View
              style={[
                flex.flex1,
                flex.flexCol,
                gap.xlarge,
                padding.horizontal.large,
                padding.bottom.xlarge2,
              ]}>
              <Controller
                control={control}
                name="uri"
                rules={{required: 'Video is required!'}}
                render={({field: {value}, fieldState: {error}}) => (
                  <View style={[flex.flexCol, gap.default]}>
                    <FormFieldHelper title="Portfolio Video File" />
                    <View style={[flex.flexRow, justify.start]}>
                      <MediaUploader
                        targetFolder="contents"
                        options={{
                          mediaType: 'video',
                        }}
                        showUploadProgress
                        onUploadSuccess={imageSelected}>
                        <View
                          className="overflow-hidden"
                          style={[
                            dimension.height.xlarge14,
                            dimension.width.xlarge10,
                            rounded.default,
                          ]}>
                          {value ? (
                            <FastImage
                              className=""
                              style={[dimension.full]}
                              source={{
                                uri: value,
                              }}
                            />
                          ) : (
                            <View
                              style={[
                                dimension.full,
                                flex.flexRow,
                                justify.center,
                                items.center,
                                background(COLOR.background.neutral.med),
                                error &&
                                  border({
                                    borderWidth: 1,
                                    color: COLOR.background.danger.default,
                                  }),
                              ]}>
                              <PhotosIcon
                                width={30}
                                height={30}
                                color={COLOR.text.neutral.high}
                              />
                            </View>
                          )}
                        </View>
                      </MediaUploader>
                    </View>
                    {error && (
                      <Text className="text-xs mt-2 font-medium text-red-500">
                        {`${error?.message}`}
                      </Text>
                    )}
                  </View>
                )}
              />
              <View style={[flex.flexCol, gap.default]}>
                <FormFieldHelper title="Your video description" />
                <CustomTextInput
                  placeholder="Video description"
                  name="description"
                  type="textarea"
                  rules={{
                    required: 'Description is required',
                  }}
                />
              </View>
              <CustomButton
                text="Submit"
                rounded="max"
                minimumWidth
                disabled={
                  !isValidField(getFieldState('description', formState)) ||
                  !watch('uri')
                }
                onPress={handleSubmit(onSubmit)}
              />
            </View>
          </KeyboardAvoidingContainer>
        </ScrollView>
      </PageWithBackButton>
    </FormProvider>
  );
};

export default UploadVideoScreen;
