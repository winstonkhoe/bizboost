import {View} from 'react-native';
import {BackButtonLabel} from '../../../components/atoms/Header';
import {PageWithBackButton} from '../../../components/templates/PageWithBackButton';
import {CampaignStep} from '../../../model/Campaign';
import {flex, items, justify} from '../../../styles/Flex';
import {FormProvider, useForm} from 'react-hook-form';
import {ScrollView} from 'react-native-gesture-handler';
import {SocialPlatform} from '../../../model/User';
import {StringObject, getStringObjectValue} from '../../../utils/stringObject';
import {useCallback, useEffect, useState} from 'react';
import {BrainstormContent, Transaction} from '../../../model/Transaction';
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
import {campaignTaskToString} from '../../../utils/campaign';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {size} from '../../../styles/Size';
import {PlatformIcon} from '../../../components/atoms/Icon';
import {textColor} from '../../../styles/Text';
import {Seperator} from '../../../components/atoms/Separator';
import {CustomTextInput} from '../../../components/atoms/Input';
import {showToast} from '../../../helpers/toast';
import {ToastType} from '../../../providers/ToastProvider';
import {useNavigation} from '@react-navigation/native';

type Props = NativeStackScreenProps<
  AuthenticatedStack,
  AuthenticatedNavigation.SubmitBrainstorm
>;

type SubmissionFormData = {
  submission: {
    platform: SocialPlatform;
    tasks: StringObject[];
  }[];
};

const rules = {
  brainstorm: {
    min: 100,
    max: 1000,
  },
};

const ModalSubmitBrainstorm = ({route}: Props) => {
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
  const {reset, getValues, watch} = methods;

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

  const submitBrainstorm = () => {
    setIsConfirmModalOpen(false);
    setIsLoading(true);
    const data = getValues();
    const brainstormContents: BrainstormContent[] = data.submission.map(
      submission => {
        return {
          platform: submission.platform,
          tasks: submission.tasks.map(getStringObjectValue),
        };
      },
    );
    transaction
      ?.submitBrainstorm(brainstormContents)
      .then(() => {
        showToast({
          message: 'Brainstorm submitted successfully',
          type: ToastType.success,
        });
        setIsLoading(false);
        navigation.goBack();
      })
      .catch(err => {
        showToast({
          message: "There's an error. Please try again.",
          type: ToastType.danger,
        });
        setIsLoading(false);
        console.log('submitBrainstorm err: ', err);
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
        withoutScrollView
        backButtonPlaceholder={
          <BackButtonLabel text={CampaignStep.Brainstorming} />
        }>
        <FormProvider {...methods}>
          <View
            style={[
              flex.flex1,
              flex.flexCol,
              gap.medium,
              padding.top.xlarge3,
              {
                paddingBottom: Math.max(safeAreaInsets.bottom, size.large),
              },
            ]}>
            <ScrollView bounces={false}>
              <View style={[flex.flexCol, gap.xlarge2]}>
                {transaction?.platformTasks?.map((platform, platformIndex) => (
                  <View key={platform.name} style={[flex.flexCol, gap.default]}>
                    {platformIndex > 0 && <Seperator />}
                    <View
                      style={[
                        flex.flexRow,
                        gap.small,
                        items.center,
                        padding.horizontal.default,
                      ]}>
                      <PlatformIcon platform={platform.name} size="medium" />
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
                        gap.default,
                        padding.horizontal.default,
                      ]}>
                      {platform.tasks.map((task, taskIndex) => (
                        <View
                          style={[flex.flexCol, gap.xsmall]}
                          key={taskIndex}>
                          <Text
                            className="font-semibold"
                            style={[
                              font.size[20],
                              textColor(COLOR.text.neutral.high),
                            ]}>
                            {campaignTaskToString(task)}
                          </Text>
                          {task.description && (
                            <Text
                              style={[
                                font.size[20],
                                textColor(COLOR.text.neutral.med),
                              ]}>
                              {task.description}
                            </Text>
                          )}
                          <CustomTextInput
                            rules={{
                              required: 'Brainstorm must not be empty',
                              minLength: rules.brainstorm.min,
                            }}
                            counter
                            description={`Min. ${rules.brainstorm.min} characters, Max. ${rules.brainstorm.max} characters`}
                            placeholder="Type your brainstorm here"
                            max={rules.brainstorm.max}
                            name={`submission.${platformIndex}.tasks.${taskIndex}.value`}
                            type="textarea"
                          />
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
            <View style={[padding.horizontal.default]}>
              <CustomButton
                text="Submit"
                disabled={
                  transaction?.platformTasks &&
                  transaction.platformTasks.filter(
                    (platform, platformIndex) =>
                      platform.tasks?.filter((_, taskIndex) => {
                        const taskValues = watch(
                          `submission.${platformIndex}.tasks.${taskIndex}`,
                        );
                        return (
                          !taskValues ||
                          !taskValues.value ||
                          taskValues?.value?.length < rules.brainstorm.min
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
      </PageWithBackButton>
      <CustomModal transparent={true} visible={isConfirmModalOpen}>
        <View style={[flex.flexCol, padding.default, gap.large]}>
          <View style={[flex.flexRow, justify.center, padding.medium]}>
            <Text className="text-center font-medium" style={[font.size[30]]}>
              Please review your submission carefully. Once you submit your
              brainstorm,{' '}
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
            <CustomButton text="Submit" onPress={submitBrainstorm} />
          </View>
        </View>
      </CustomModal>
    </>
  );
};

export default ModalSubmitBrainstorm;
