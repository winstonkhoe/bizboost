import {View} from 'react-native';
import {BackButtonLabel} from '../../../components/atoms/Header';
import {PageWithBackButton} from '../../../components/templates/PageWithBackButton';
import {CampaignStep} from '../../../model/Campaign';
import {flex, items} from '../../../styles/Flex';
import {FormProvider, useForm} from 'react-hook-form';
import {ScrollView} from 'react-native-gesture-handler';
import {SocialPlatform} from '../../../model/User';
import {StringObject, getStringObjectValue} from '../../../utils/stringObject';
import {useCallback, useEffect, useState} from 'react';
import {Transaction, TransactionContent} from '../../../model/Transaction';
import {
  AuthenticatedNavigation,
  AuthenticatedStack,
  NavigationStackProps,
} from '../../../navigation/StackNavigation';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {LoadingScreen} from '../../LoadingScreen';
import {Text} from 'react-native';
import {COLOR} from '../../../styles/Color';
import {gap} from '../../../styles/Gap';
import {padding} from '../../../styles/Padding';
import {font, text} from '../../../styles/Font';
import FieldArray from '../../../components/organisms/FieldArray';
import {campaignTaskToString} from '../../../utils/campaign';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {size} from '../../../styles/Size';
import {PlatformIcon} from '../../../components/atoms/Icon';
import {textColor} from '../../../styles/Text';
import {Seperator} from '../../../components/atoms/Separator';
import {showToast} from '../../../helpers/toast';
import {ToastType} from '../../../providers/ToastProvider';
import {useNavigation} from '@react-navigation/native';
import {CustomAlert} from '../../../components/molecules/CustomAlert';

type Props = NativeStackScreenProps<
  AuthenticatedStack,
  AuthenticatedNavigation.SubmitContentCreation
>;

type SubmissionFormData = {
  submission: {
    platform: SocialPlatform;
    tasks: StringObject[][];
  }[];
};

const ModalSubmitContentCreation = ({route}: Props) => {
  const {transactionId} = route.params;
  const safeAreaInsets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<NavigationStackProps>();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const methods = useForm<SubmissionFormData>({
    defaultValues: {
      submission: [],
    },
  });
  const {reset, getValues, control, watch} = methods;

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
    return Transaction.getById(transactionId, setTransaction);
  }, [transactionId]);

  const submitContentCreation = () => {
    setIsLoading(true);
    const data = getValues();
    const transactionContent: TransactionContent[] = data.submission.map(
      submission => {
        return {
          platform: submission.platform,
          tasks: submission.tasks.map(task => {
            return {
              uri: task.map(getStringObjectValue),
            };
          }),
        };
      },
    );
    transaction
      ?.submitContent(transactionContent)
      .then(() => {
        showToast({
          message: 'Engagement result submitted',
          type: ToastType.success,
        });
        setIsLoading(false);
        if (navigation.canGoBack()) {
          navigation.goBack();
          return;
        }
        if (transaction.campaignId) {
          navigation.navigate(AuthenticatedNavigation.CampaignTimeline, {
            campaignId: transaction?.campaignId,
          });
          return;
        }
      })
      .catch(err => {
        showToast({
          message: "There's an error. Please try again.",
          type: ToastType.danger,
        });
        setIsLoading(false);
        console.log('submitContentCreation err: ', err);
      });
  };

  if (!transaction) {
    return <LoadingScreen />;
  }

  if (transaction.platformTasks) {
    console.log(
      'platformtasks',
      transaction.platformTasks.filter(
        (platform, platformIndex) =>
          platform.tasks?.filter(
            (task, taskIndex) =>
              getValues(`submission.${platformIndex}.tasks.${taskIndex}`)
                ?.length < task.quantity,
          ).length > 0,
      ),
    );
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
          <BackButtonLabel text={CampaignStep.ContentCreation} />
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
                            style={[
                              font.size[40],
                              font.weight.bold,
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
                            <FieldArray
                              key={taskIndex}
                              title={`${platform.name} · ${campaignTaskToString(
                                task,
                              )}`}
                              description={task.description}
                              placeholder="Add url"
                              maxFieldLength={0}
                              helperText={`Make sure url is publicly accessible.\nEx. https://drive.google.com/file/d/1Go0RYsRgia9ZoMy10O8XBrfnIWMCopHs/view?usp=sharing`}
                              control={control}
                              fieldType="textarea"
                              type="required"
                              rules={{
                                required: 'URL is required',
                                pattern: {
                                  value: /^(http|https):\/\/[^ "]+$/,
                                  message: 'Invalid URL',
                                },
                              }}
                              parentName={`submission.${platformIndex}.tasks.${taskIndex}`}
                              childName="value"
                            />
                          ))}
                        </View>
                      </View>
                    ),
                  )}
                </View>
              </ScrollView>
              <View style={[padding.horizontal.default]}>
                <CustomAlert
                  text="Submit"
                  onApprove={submitContentCreation}
                  rejectButtonText="Adjust again"
                  approveButtonText="Submit"
                  confirmationText={
                    <Text
                      style={[font.size[30], text.center, font.weight.medium]}>
                      Please review your submission carefully. Once you submit
                      your task's content,{' '}
                      <Text style={[font.weight.bold]}>
                        you will not be able to edit it.
                      </Text>
                    </Text>
                  }
                  disabled={
                    !transaction ||
                    !transaction.platformTasks ||
                    transaction.platformTasks.some((platform, platformIndex) =>
                      platform.tasks.some((task, taskIndex) => {
                        const taskValues = watch(
                          `submission.${platformIndex}.tasks.${taskIndex}`,
                        );
                        return !taskValues || taskValues.length < task.quantity;
                      }),
                    )
                  }
                />
              </View>
            </View>
          </FormProvider>
        </View>
      </PageWithBackButton>
    </>
  );
};

export default ModalSubmitContentCreation;
