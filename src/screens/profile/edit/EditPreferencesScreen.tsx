import {Platform, Pressable, View} from 'react-native';
import {CloseModal} from '../../../components/atoms/Close';
import SafeAreaContainer from '../../../containers/SafeAreaContainer';
import {flex, items, justify} from '../../../styles/Flex';
import {gap} from '../../../styles/Gap';
import {padding} from '../../../styles/Padding';
import {Text} from 'react-native';
import {textColor} from '../../../styles/Text';
import {COLOR} from '../../../styles/Color';
import {FormLabel} from '../../../components/atoms/FormLabel';
import {font} from '../../../styles/Font';
import {StringObject} from '../../../utils/stringObject';
import {useNavigation} from '@react-navigation/native';
import {NavigationStackProps} from '../../../navigation/StackNavigation';
import {Controller, useFieldArray, useForm} from 'react-hook-form';
import {useUser} from '../../../hooks/user';
import {AnimatedPressable} from '../../../components/atoms/AnimatedPressable';
import {useState} from 'react';
import {rounded} from '../../../styles/BorderRadius';
import {border} from '../../../styles/Border';
import {background} from '../../../styles/BackgroundColor';
import {AddIcon} from '../../../components/atoms/Icon';
import {CustomButton} from '../../../components/atoms/Button';
import {User} from '../../../model/User';
import {SheetModal} from '../../../containers/SheetModal';
import {FormlessTextInput} from '../../../components/atoms/Input';
import {useKeyboard} from '../../../hooks/keyboard';

type FormData = {
  preferences: StringObject[];
};

const EditPreferencesScreen = () => {
  const keyboardHeight = useKeyboard();

  const navigation = useNavigation<NavigationStackProps>();
  const {user} = useUser();

  const methods = useForm<FormData>({
    mode: 'all',
    defaultValues: {
      preferences: user?.contentCreator?.preferences.map(p => ({value: p})),
    },
  });

  const {watch, control} = methods;
  const [isPreferencesModalOpened, setIsPreferencesModalOpened] =
    useState(false);
  const [updatePreferenceIndex, setUpdatePreferenceIndex] = useState<
    number | undefined
  >(undefined);
  const {
    fields: fieldsPreferences,
    append: appendPreferences,
    remove: removePreferences,
  } = useFieldArray({
    name: 'preferences',
    control,
  });
  const [temporaryPreference, setTemporaryPreference] = useState<string>('');
  const closePreferenceSheetModal = () => {
    setIsPreferencesModalOpened(false);
  };
  const savePreference = () => {
    appendPreferences({
      value: temporaryPreference,
    });
    closePreferenceSheetModal();
  };

  const updatePreference = (onChange: (...event: any[]) => void) => {
    onChange(temporaryPreference);
    closePreferenceSheetModal();
  };
  const onSubmit = (d: FormData) => {
    const temp = new User({...user});
    temp.contentCreator = {
      ...temp.contentCreator!,
      preferences: d.preferences.map(p => p.value),
    };

    temp.updateUserData().then(() => {
      navigation.goBack();
    });
  };
  return (
    <SafeAreaContainer enable>
      <CloseModal />
      <View
        style={[flex.flexCol, gap.medium, padding.horizontal.default]}
        className="flex-1 justify-between">
        <View style={[flex.flexCol, gap.medium]}>
          <View style={[flex.flexRow, items.center]}>
            <View style={[flex.flexCol, flex.growShrink, gap.small]}>
              <Text
                className="font-bold"
                style={[textColor(COLOR.text.neutral.high), font.size[40]]}>
                Preferences <FormLabel type="optional" />
              </Text>
              <Text
                className="font-medium"
                style={[textColor(COLOR.text.neutral.med), font.size[20]]}>
                Let business people know what you like or things you don't like
              </Text>
            </View>
          </View>
          <View style={[flex.flexCol, gap.medium, items.start]}>
            {fieldsPreferences.length > 0 && (
              <View style={[flex.flexCol, gap.small, items.start]}>
                {fieldsPreferences.map((item, index) => {
                  return (
                    <AnimatedPressable
                      key={item.id}
                      onPress={() => {
                        setUpdatePreferenceIndex(index);
                        setIsPreferencesModalOpened(true);
                      }}>
                      <View
                        style={[
                          flex.flexRow,
                          gap.default,
                          items.center,
                          rounded.default,
                          padding.vertical.small,
                          padding.horizontal.default,
                          border({
                            borderWidth: 1,
                            color: COLOR.green[50],
                          }),
                        ]}>
                        <View style={[flex.flexRow, items.center, gap.small]}>
                          <Text
                            className="font-semibold"
                            style={[textColor(COLOR.green[60]), font.size[30]]}>
                            {watch(`preferences.${index}.value`)}
                          </Text>
                        </View>
                        <Pressable
                          className="rotate-45"
                          style={[
                            rounded.max,
                            background(COLOR.background.danger.high),
                            padding.xsmall,
                          ]}
                          onPress={() => removePreferences(index)}>
                          <AddIcon size="default" color={COLOR.black[0]} />
                        </Pressable>
                      </View>
                    </AnimatedPressable>
                  );
                })}
              </View>
            )}

            <AnimatedPressable
              onPress={() => {
                setIsPreferencesModalOpened(true);
              }}>
              <View
                style={[
                  flex.flexRow,
                  items.center,
                  gap.small,
                  rounded.default,
                  padding.vertical.small,
                  padding.horizontal.default,
                  border({
                    borderWidth: 1,
                    color: COLOR.background.neutral.med,
                  }),
                ]}>
                <Text
                  className="font-semibold"
                  style={[textColor(COLOR.text.neutral.med), font.size[30]]}>
                  Preference
                </Text>
                <View
                  style={[
                    rounded.max,
                    background(COLOR.background.neutral.high),
                    padding.xsmall,
                  ]}>
                  <AddIcon size="default" color={COLOR.black[0]} />
                </View>
              </View>
            </AnimatedPressable>
          </View>
        </View>
        <CustomButton text="Save" onPress={methods.handleSubmit(onSubmit)} />
      </View>
      <SheetModal
        open={isPreferencesModalOpened}
        onDismiss={() => {
          setIsPreferencesModalOpened(false);
        }}>
        <View
          style={[
            flex.flexCol,
            gap.default,
            padding.top.default,
            padding.bottom.xlarge,
            padding.horizontal.default,
          ]}>
          <View style={[flex.flexRow, justify.center]}>
            <Text
              className="font-bold"
              style={[font.size[40], textColor(COLOR.text.neutral.high)]}>
              Add Preference
            </Text>
          </View>
          <View style={[flex.flexRow, justify.center]}>
            {updatePreferenceIndex !== undefined ? (
              <Controller
                control={control}
                name={`preferences.${updatePreferenceIndex}.value`}
                render={({field: {value, onChange}}) => (
                  <View style={[flex.flexCol, gap.medium]}>
                    <FormlessTextInput
                      counter
                      max={30}
                      defaultValue={value}
                      placeholder="Don't accept cigarette campaigns"
                      focus={isPreferencesModalOpened}
                      description="Write things that you want to let business people know about you"
                      onChangeText={setTemporaryPreference}
                    />
                    <CustomButton
                      text="Update"
                      onPress={() => updatePreference(onChange)}
                    />
                  </View>
                )}
              />
            ) : (
              <View style={[flex.flexCol, gap.medium]}>
                <FormlessTextInput
                  counter
                  max={30}
                  placeholder="Don't accept cigarette campaigns"
                  focus={isPreferencesModalOpened}
                  description="Write things that you want to let business people know about you"
                  onChangeText={setTemporaryPreference}
                />
                <CustomButton
                  text="Save"
                  disabled={temporaryPreference.length === 0}
                  onPress={savePreference}
                />
              </View>
            )}
          </View>
          <View
            style={[
              Platform.OS !== 'android' && {
                paddingBottom: keyboardHeight,
              },
            ]}
          />
        </View>
      </SheetModal>
    </SafeAreaContainer>
  );
};

export default EditPreferencesScreen;
