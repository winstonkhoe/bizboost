import {Pressable, View} from 'react-native';
import {BackButtonLabel} from '../../../components/atoms/Header';
import {PageWithBackButton} from '../../../components/templates/PageWithBackButton';
import {CampaignStep, CampaignTask} from '../../../model/Campaign';
import {flex, items, justify, self} from '../../../styles/Flex';
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
  useWatch,
} from 'react-hook-form';
import {ScrollView} from 'react-native-gesture-handler';
import {SocialPlatform} from '../../../model/User';
import {StringObject, getStringObjectValue} from '../../../utils/stringObject';
import {useCallback, useEffect, useState} from 'react';
import {Transaction, TransactionEngagement} from '../../../model/Transaction';
import {
  AuthenticatedNavigation,
  AuthenticatedStack,
  NavigationStackProps,
} from '../../../navigation/StackNavigation';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {LoadingScreen} from '../../LoadingScreen';
import {CustomButton} from '../../../components/atoms/Button';
import {CustomModal} from '../../../components/atoms/CustomModal';
import {Text} from 'react-native';
import {COLOR} from '../../../styles/Color';
import {gap} from '../../../styles/Gap';
import {padding} from '../../../styles/Padding';
import {font} from '../../../styles/Font';
import FieldArray from '../../../components/organisms/FieldArray';
import {campaignTaskToString} from '../../../utils/campaign';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {size} from '../../../styles/Size';
import {
  AddIcon,
  PhotoRevisionIcon,
  PlatformIcon,
  UploadIcon,
} from '../../../components/atoms/Icon';
import {textColor} from '../../../styles/Text';
import {Seperator} from '../../../components/atoms/Separator';
import {MediaUploader} from '../../../components/atoms/Input';
import {border} from '../../../styles/Border';
import {dimension} from '../../../styles/Dimension';
import {rounded} from '../../../styles/BorderRadius';
import FastImage from 'react-native-fast-image';
import {background} from '../../../styles/BackgroundColor';
import ImageView from 'react-native-image-viewing';
import {showToast} from '../../../helpers/toast';
import {ToastType} from '../../../providers/ToastProvider';
import {useNavigation} from '@react-navigation/native';

type Props = NativeStackScreenProps<
  AuthenticatedStack,
  AuthenticatedNavigation.SubmitEngagementResult
>;

type SubmissionFormData = {
  submission: {
    platform: SocialPlatform;
    tasks: {
      uri: StringObject[];
      attachment: StringObject[];
    }[];
  }[];
};

const guidelines = {
  engagements: [
    require('../../../assets/images/guidelines/engagement-1.png'),
    require('../../../assets/images/guidelines/engagement-2.png'),
    require('../../../assets/images/guidelines/engagement-3.png'),
  ],
};

const ModalSubmitEngagementResult = ({route}: Props) => {
  const {transactionId} = route.params;
  const safeAreaInsets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const navigation = useNavigation<NavigationStackProps>();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const methods = useForm<SubmissionFormData>({
    defaultValues: {
      submission: [],
    },
  });
  const {reset, control, getValues, watch} = methods;

  const resetOriginalField = useCallback(() => {
    reset({
      submission: transaction?.platformTasks?.map(platformTask => {
        return {
          platform: platformTask.name,
          tasks: [],
        };
      }),
    });
  }, [reset, transaction]);

  useEffect(() => {
    if (transaction) {
      resetOriginalField();
    }
  }, [transaction, resetOriginalField]);

  useEffect(() => {
    Transaction.getById(transactionId, setTransaction);
  }, [transactionId]);

  const submitEngagement = () => {
    setIsConfirmModalOpen(false);
    setIsLoading(true);
    const data = getValues();
    const transactionEngagements: TransactionEngagement[] = data.submission.map(
      submission => {
        return {
          platform: submission.platform,
          tasks: submission.tasks.map(task => {
            return {
              uri: task.uri.map(getStringObjectValue),
              attachments: task.attachment.map(getStringObjectValue),
            };
          }),
        };
      },
    );
    transaction
      ?.submitEngagement(transactionEngagements)
      .then(() => {
        showToast({
          message: 'Engagement result submitted',
          type: ToastType.success,
        });
        navigation.goBack();
      })
      .catch(err => {
        showToast({
          message: "There's an error. Please try again.",
          type: ToastType.danger,
        });
        console.log('submitEngagement err: ', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  if (!transaction) {
    return <LoadingScreen />;
  }

  return (
    <>
      {isLoading && <LoadingScreen />}

      <PageWithBackButton
        icon="close"
        fullHeight
        enableSafeAreaContainer
        threshold={0}
        backButtonPlaceholder={
          <BackButtonLabel text={CampaignStep.EngagementResultSubmission} />
        }>
        <View
          style={[
            flex.flex1,
            flex.flexCol,
            padding.top.xlarge3,
            {
              paddingBottom: Math.max(safeAreaInsets.bottom, size.large),
            },
          ]}>
          <FormProvider {...methods}>
            <View style={[flex.grow, flex.flexCol, gap.medium]}>
              <ScrollView style={[flex.flex1]} bounces={false}>
                <View style={[flex.flex1, flex.flexCol, gap.xlarge2]}>
                  {transaction?.platformTasks?.map(
                    (platform, platformIndex) => (
                      <View
                        key={platform.name}
                        style={[flex.flexCol, gap.medium]}>
                        {platformIndex > 0 && <Seperator />}
                        <View
                          style={[
                            flex.flexRow,
                            gap.small,
                            items.center,
                            padding.horizontal.default,
                          ]}>
                          <PlatformIcon
                            platform={platform.name}
                            size="medium"
                          />
                          <Text
                            className="font-bold"
                            style={[
                              font.size[40],
                              textColor(COLOR.text.neutral.high),
                            ]}>
                            {platform.name}
                          </Text>
                        </View>
                        <View
                          style={[
                            flex.flexCol,
                            gap.medium,
                            padding.horizontal.default,
                          ]}>
                          {platform.tasks.map((task, taskIndex) => (
                            <TaskFields
                              key={taskIndex}
                              platformIndex={platformIndex}
                              task={task}
                              taskIndex={taskIndex}
                            />
                          ))}
                        </View>
                      </View>
                    ),
                  )}
                </View>
              </ScrollView>
              <View style={[padding.horizontal.default]}>
                <CustomButton
                  text="Submit"
                  disabled={
                    transaction?.platformTasks &&
                    transaction.platformTasks.filter(
                      (platform, platformIndex) =>
                        platform.tasks?.filter((task, taskIndex) => {
                          const taskValues = watch(
                            `submission.${platformIndex}.tasks.${taskIndex}`,
                          );
                          console.log(taskValues);
                          return (
                            (taskValues?.uri?.length || 0) < task.quantity ||
                            (taskValues?.attachment?.length || 0) < 1
                          );
                        }).length > 0,
                    ).length > 0
                  }
                  onPress={() => {
                    setIsConfirmModalOpen(true);
                  }}
                />
              </View>
            </View>
          </FormProvider>
        </View>
      </PageWithBackButton>
      <CustomModal transparent={true} visible={isConfirmModalOpen}>
        <View style={[flex.flexCol, padding.default, gap.large]}>
          <View style={[flex.flexRow, justify.center, padding.medium]}>
            <Text className="text-center font-medium" style={[font.size[30]]}>
              Please review your submission carefully. Once you submit your
              engagement result,{' '}
              <Text className="font-bold">
                you will not be able to edit it.
              </Text>
            </Text>
          </View>
          <View style={[flex.flexRow, gap.large, justify.center]}>
            <CustomButton
              text="Adjust again"
              type="tertiary"
              customTextColor={{
                default: COLOR.text.danger.default,
                disabled: COLOR.red[10],
              }}
              onPress={() => {
                setIsConfirmModalOpen(false);
              }}
            />
            <CustomButton text="Submit" onPress={submitEngagement} />
          </View>
        </View>
      </CustomModal>
    </>
  );
};

interface TaskFieldsProps {
  task: CampaignTask;
  platformIndex: number;
  taskIndex: number;
}

const TaskFields = ({task, platformIndex, taskIndex}: TaskFieldsProps) => {
  const safeAreaInsets = useSafeAreaInsets();
  const {control} = useFormContext();
  const attachmentFieldName = `submission.${platformIndex}.tasks.${taskIndex}.attachment`;
  const [activeImageIndex, setActiveImageIndex] = useState(-1);
  const {append: appendAttachment, remove: removeAttachment} = useFieldArray({
    name: attachmentFieldName,
    control,
  });
  const attachments = useWatch({
    name: attachmentFieldName,
    defaultValue: [],
  });
  return (
    <>
      <ImageView
        images={attachments.map((attachment: StringObject) => {
          console.log('loop attachment', attachment);
          return {
            uri: attachment.value,
          };
        })}
        imageIndex={activeImageIndex}
        doubleTapToZoomEnabled
        visible={activeImageIndex >= 0}
        onRequestClose={() => {
          setActiveImageIndex(-1);
        }}
        FooterComponent={({imageIndex}) => (
          <View
            style={[
              padding.horizontal.default,
              {
                paddingBottom: Math.max(safeAreaInsets.bottom, size.large),
              },
            ]}>
            <CustomButton
              customBackgroundColor={COLOR.background.danger}
              text="Remove"
              onPress={() => {
                removeAttachment(imageIndex);
                if (attachments.length === 1) {
                  setActiveImageIndex(-1);
                }
              }}
            />
          </View>
        )}
      />
      <View style={[flex.flexCol, gap.default]}>
        <FieldArray
          title={`${campaignTaskToString(task)}`}
          description={task.description}
          placeholder="Add posted campaign content url"
          maxFieldLength={0}
          helperText={`Make sure url is publicly accessible.\nEx. https://www.instagram.com/s/aGlnaGxpZ2h0OjE4MjkxMzUyNjAzMTg3ODYz?story_media_id=3052840378257863317&igshid=MzRlODBiNWFlZA==`}
          control={control}
          fieldType="textarea"
          type="required"
          rules={{
            required: 'Posted content URL is required',
            pattern: {
              value: /^(http|https):\/\/[^ "]+$/,
              message: 'Invalid URL',
            },
          }}
          titleSize={30}
          descriptionSize={20}
          parentName={`submission.${platformIndex}.tasks.${taskIndex}.uri`}
          childName="value"
        />
        {attachments.length > 0 && (
          <ScrollView
            horizontal
            contentContainerStyle={[
              flex.flexRow,
              gap.default,
              padding.top.xsmall,
            ]}>
            {attachments.map(
              (attachment: StringObject, attachmentIndex: number) => (
                <View key={attachmentIndex} className="relative">
                  <Pressable
                    className="overflow-hidden"
                    style={[
                      dimension.width.xlarge4,
                      {
                        aspectRatio: 1 / 1.3,
                      },
                      rounded.default,
                    ]}
                    onPress={() => {
                      setActiveImageIndex(attachmentIndex);
                    }}>
                    <FastImage
                      style={[dimension.full]}
                      source={{
                        uri: attachment.value,
                      }}
                    />
                  </Pressable>
                  <Pressable
                    className="absolute -top-2 -right-2"
                    style={[
                      background(COLOR.black[0]),
                      padding.xsmall,
                      rounded.max,
                    ]}
                    onPress={() => {
                      removeAttachment(attachmentIndex);
                    }}>
                    <View
                      className="rotate-45"
                      style={[
                        background(COLOR.red[50]),
                        rounded.max,
                        padding.xsmall2,
                      ]}>
                      <AddIcon color={COLOR.black[0]} size="medium" />
                    </View>
                  </Pressable>
                </View>
              ),
            )}
          </ScrollView>
        )}
        <MediaUploader
          options={{
            cropping: false,
          }}
          targetFolder="engagement-result"
          showUploadProgress
          onUploadSuccess={url => {
            appendAttachment({value: url});
          }}>
          <View
            style={[
              flex.flexRow,
              justify.center,
              items.center,
              gap.small,
              padding.default,
              rounded.default,
              {
                borderWidth: 2,
                borderStyle: 'dashed',
                borderColor: COLOR.green[20],
              },
            ]}>
            <UploadIcon color={COLOR.green[50]} size="medium" />
            <Text
              className="font-bold"
              style={[font.size[30], textColor(COLOR.green[50])]}>
              Upload Engagement
            </Text>
          </View>
        </MediaUploader>
      </View>
    </>
  );
};

export default ModalSubmitEngagementResult;
