import React, {useCallback, useEffect, useState} from 'react';
import {ScrollView, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useForm, FormProvider} from 'react-hook-form';
import {flex} from '../styles/Flex';
import {FormFieldHelper} from '../components/atoms/FormLabel';
import {gap} from '../styles/Gap';
import {CustomTextInput} from '../components/atoms/Input';
import {SelectCampaignOffer} from './offers/SelectCampaignOffer';
import {Campaign, CampaignPlatform} from '../model/Campaign';
import {KeyboardAvoidingContainer} from '../containers/KeyboardAvoidingContainer';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  AuthenticatedNavigation,
  AuthenticatedStack,
  NavigationStackProps,
} from '../navigation/StackNavigation';
import {UserRole} from '../model/User';
import {useUser} from '../hooks/user';
import {CustomButton} from '../components/atoms/Button';
import {Offer} from '../model/Offer';
import {PageWithBackButton} from '../components/templates/PageWithBackButton';
import {BackButtonLabel} from '../components/atoms/Header';
import {padding} from '../styles/Padding';
import {showToast} from '../helpers/toast';
import {ToastType} from '../providers/ToastProvider';
import {LoadingScreen} from './LoadingScreen';
import {isValidField} from '../utils/form';
import {TaskFieldArray} from '../components/molecules/TaskFieldArray';
import {Seperator} from '../components/atoms/Separator';

export type MakeOfferFormData = {
  campaign: string;
  fee: number;
  tasks: CampaignPlatform[];
  notes: string;
};

type Props = NativeStackScreenProps<
  AuthenticatedStack,
  AuthenticatedNavigation.MakeOffer
>;
const MakeOfferScreen = ({route}: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const {contentCreatorId, businessPeopleId} = route.params;
  const navigation = useNavigation<NavigationStackProps>();
  const methods = useForm<MakeOfferFormData>({
    mode: 'all',
  });
  const {setValue, watch} = methods;
  const {activeRole} = useUser();
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign>();
  const tasks = watch('tasks');

  const onSubmit = (data: MakeOfferFormData) => {
    if (!selectedCampaign?.id) {
      showToast({
        type: ToastType.info,
        message: 'Please select a campaign first',
      });
      return;
    }

    if (!data.fee) {
      showToast({
        type: ToastType.info,
        message: 'Please input your offer fee',
      });
      return;
    }

    if (!activeRole) {
      showToast({
        type: ToastType.info,
        message: 'Unknown error has occurred',
      });
      return;
    }

    setIsLoading(true);
    const offer = new Offer({
      contentCreatorId: contentCreatorId,
      businessPeopleId: businessPeopleId,
      campaignId: selectedCampaign.id,
      negotiations: [
        {
          tasks: data.tasks,
          createdAt: new Date().getTime(),
          negotiatedBy: UserRole.BusinessPeople,
          notes: data.notes,
          fee: data.fee,
        },
      ],
    });

    offer
      .insert()
      .then(({chat}) => {
        navigation.navigate(AuthenticatedNavigation.ChatDetail, {
          chatId: chat.id,
        });
      })
      .catch(error => {
        showToast({
          type: ToastType.danger,
          message: error,
        });
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (selectedCampaign) {
      setValue('tasks', selectedCampaign.platformTasks);
    }
  }, [selectedCampaign, setValue]);

  const onChangeTasks = useCallback(
    (platformTasks: CampaignPlatform[]) => {
      setValue('tasks', platformTasks);
    },
    [setValue],
  );

  return (
    <>
      {isLoading && <LoadingScreen />}
      <FormProvider {...methods}>
        <PageWithBackButton
          fullHeight
          threshold={0}
          enableSafeAreaContainer
          withoutScrollView
          backButtonPlaceholder={<BackButtonLabel text="Make Offer" />}>
          <View style={[flex.flex1, flex.flexCol, padding.top.xlarge]}>
            <ScrollView contentContainerStyle={[padding.bottom.xlarge]}>
              <KeyboardAvoidingContainer>
                <View style={[flex.flexCol, gap.xlarge, padding.top.large]}>
                  <View style={[padding.horizontal.default]}>
                    <SelectCampaignOffer
                      onCampaignChange={setSelectedCampaign}
                      contentCreatorToOfferId={contentCreatorId}
                    />
                  </View>
                  {tasks && (
                    <View style={[flex.flexCol, gap.medium]}>
                      <Seperator />
                      <View style={[padding.horizontal.default]}>
                        <TaskFieldArray
                          onChange={onChangeTasks}
                          defaultValue={tasks}
                          isInitiallyEditable={false}
                        />
                      </View>
                      <Seperator />
                    </View>
                  )}

                  <View
                    style={[
                      flex.flexCol,
                      gap.default,
                      padding.horizontal.default,
                    ]}>
                    <FormFieldHelper title="Offered Fee" titleSize={40} />
                    <CustomTextInput
                      name="fee"
                      inputType="price"
                      rules={{
                        required: 'Fee is required',
                        validate: value => {
                          return (
                            parseInt(value, 10) >= 50000 ||
                            'Minimum fee is Rp50.000'
                          );
                        },
                      }}
                    />
                  </View>

                  <View
                    style={[
                      flex.flexCol,
                      gap.default,
                      padding.horizontal.default,
                    ]}>
                    <FormFieldHelper
                      title="Important Notes"
                      type="optional"
                      titleSize={40}
                    />
                    <CustomTextInput
                      placeholder="Things to note for your offer"
                      name="notes"
                      type="textarea"
                      max={1000}
                      counter
                      description="Maximum 1000 characters"
                    />
                  </View>
                </View>
              </KeyboardAvoidingContainer>
            </ScrollView>
            <View style={[padding.horizontal.medium]}>
              <CustomButton
                onPress={methods.handleSubmit(onSubmit)}
                text={'Make Offer'}
                disabled={
                  !selectedCampaign ||
                  !isValidField(methods.getFieldState('fee', methods.formState))
                }
              />
            </View>
          </View>
        </PageWithBackButton>
      </FormProvider>
    </>
  );
};

export default MakeOfferScreen;
