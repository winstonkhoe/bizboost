import {Text, View, useWindowDimensions} from 'react-native';
import {flex, items, justify} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import {
  Control,
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
} from 'react-hook-form';
import {FormFieldHelper} from '../atoms/FormLabel';
import {SocialPlatform} from '../../model/User';
import SelectableTag from '../atoms/SelectableTag';
import {CampaignPlatform} from '../../model/Campaign';
import {font} from '../../styles/Font';
import {textColor} from '../../styles/Text';
import {COLOR} from '../../styles/Color';
import {useEffect, useMemo, useState} from 'react';
import {CustomButton} from '../atoms/Button';
import {
  FormlessCustomNumberInput,
  FormlessCustomTextInput,
} from '../atoms/Input';
import {padding} from '../../styles/Padding';
import {SheetModal} from '../../containers/SheetModal';
import {BottomSheetModalWithTitle} from '../templates/BottomSheetModalWithTitle';
import {FieldArrayLabel} from './FieldArrayLabel';
import {campaignTaskToString} from '../../utils/campaign';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {InternalLink} from '../atoms/Link';

interface SocialTaskOptions {
  name: string;
  types?: string[];
}

interface SocialTask {
  name: SocialPlatform;
  tasks: SocialTaskOptions[];
}

const taskTypes: SocialTask[] = [
  {
    name: SocialPlatform.Instagram,
    tasks: [
      {
        name: 'Feed Post',
        types: [
          'Photo',
          'Video',
          'Carousel Photo',
          'Carousel Video',
          'Carousel Mix',
        ],
      },
      {
        name: 'Story',
        types: ['Photo', 'Video'],
      },
      {
        name: 'Reels',
      },
    ],
  },
  {
    name: SocialPlatform.Tiktok,
    tasks: [
      {
        name: 'Post',
      },
    ],
  },
];

interface TaskFieldArrayProps {
  defaultValue?: CampaignPlatform[];
  isInitiallyEditable?: boolean;
  onChange: (platformTasks: CampaignPlatform[]) => void;
}

type CampaignFormData = {
  platforms: CampaignPlatform[];
};

export const TaskFieldArray = ({
  defaultValue = [],
  isInitiallyEditable = true,
  onChange,
}: TaskFieldArrayProps) => {
  const [isDisabled, setIsDisabled] = useState(!isInitiallyEditable);
  const methods = useForm<CampaignFormData>({
    mode: 'all',
    defaultValues: {
      platforms: defaultValue,
    },
  });
  const {control, watch, reset} = methods;
  const {fields, append, remove} = useFieldArray({
    name: 'platforms',
    control: control,
  });
  useEffect(() => {
    console.log('useeffecttaskfieldarray');
    const subscription = watch(data => {
      if (data?.platforms) {
        const platforms = data.platforms.filter(
          (platform): platform is CampaignPlatform => platform !== undefined,
        );
        onChange(platforms);
      } else {
        onChange([]);
      }
    });

    return () => subscription.unsubscribe();
  }, [onChange, watch]);
  return (
    <FormProvider {...methods}>
      <View style={[flex.flexCol, gap.xlarge]}>
        <Controller
          control={control}
          name="platforms"
          rules={{required: 'Platform is required!'}}
          render={({field: {value: platforms}, fieldState: {error}}) => (
            <View style={[flex.flexCol, gap.default]}>
              <View
                style={[flex.flex1, flex.flexRow, justify.between, gap.medium]}>
                <FormFieldHelper
                  title="Campaign platforms"
                  description="Choose platforms for the campaign tasks."
                />
                {!isInitiallyEditable && (
                  <InternalLink
                    text={isDisabled ? 'Modify' : 'Reset'}
                    onPress={() => {
                      if (isDisabled) {
                        setIsDisabled(false);
                        return;
                      }
                      reset();
                    }}
                  />
                )}
              </View>
              <View style={[flex.flexRow, gap.default]}>
                {Object.values(SocialPlatform).map(
                  (value: SocialPlatform, index) => (
                    <View key={index}>
                      <SelectableTag
                        text={value}
                        isSelected={
                          platforms.find((p: any) => p.name === value) !==
                          undefined
                        }
                        isDisabled={isDisabled}
                        onPress={() => {
                          const searchIndex = platforms.findIndex(
                            p => p.name === value,
                          );
                          if (searchIndex !== -1) {
                            remove(searchIndex);
                          } else {
                            append({
                              name: value,
                              tasks: [],
                            });
                          }
                        }}
                      />
                    </View>
                  ),
                )}
              </View>
              {error && (
                <Text
                  style={[
                    font.size[10],
                    textColor(COLOR.text.danger.default),
                    font.weight.medium,
                  ]}>
                  Platform is required!
                </Text>
              )}
            </View>
          )}
        />
        {fields.map((fp, index) => (
          <View key={fp.id}>
            <SocialFieldArray
              platform={fp.name}
              control={control}
              title={`${fp.name}'s Task`}
              fieldType="textarea"
              maxFieldLength={150}
              parentName={`platforms.${index}.tasks`}
              helperText='Ex. "minimum 30s / story"'
              placeholder="Add task"
              isDisabled={isDisabled}
            />
          </View>
        ))}
      </View>
    </FormProvider>
  );
};

type SocialFieldArrayProps = {
  control: Control<any>;
  platform: SocialPlatform;
  title: string;
  parentName: any; // string
  childName?: string;
  placeholder?: string;
  fieldType?: 'default' | 'textarea';
  maxFieldLength?: number;
  helperText?: string;
  isDisabled?: boolean;
};
export const SocialFieldArray = ({
  control,
  platform,
  title,
  parentName,
  childName,
  placeholder,
  fieldType = 'default',
  maxFieldLength = 40,
  helperText,
  isDisabled = false,
}: SocialFieldArrayProps) => {
  const safeAreaInsets = useSafeAreaInsets();
  const windowDimension = useWindowDimensions();
  const [taskQuantity, setTaskQuantity] = useState<number>(1);
  const [taskName, setTaskName] = useState<string>('');
  const [taskType, setTaskType] = useState<string>('');
  const [temporaryText, setTemporaryText] = useState<string>('');
  const currentTask = useMemo(() => {
    return taskTypes.find(t => t.name === platform);
  }, [platform]);
  const currentTaskTypes = useMemo(() => {
    return currentTask?.tasks.filter(task => task.name === taskName)?.[0]
      ?.types;
  }, [currentTask, taskName]);
  const [updateIndex, setUpdateIndex] = useState<number | null>(null);
  const [isModalOpened, setIsModalOpened] = useState(false);
  const {getValues} = useFormContext();
  const {fields, append, remove} = useFieldArray({
    name: parentName,
    control,
  });

  const updateText = (text: string) => {
    setTemporaryText(text);
  };

  useEffect(() => {
    if (isModalOpened === false) {
      setUpdateIndex(null);
      setTemporaryText('');
      setTaskName('');
      setTaskType('');
      setTaskQuantity(1);
    }
  }, [isModalOpened]);

  useEffect(() => {
    if (updateIndex !== null) {
      const currentTask = getValues(
        `${parentName}.${updateIndex}${childName ? `.${childName}` : ''}`,
      );
      setTaskName(currentTask?.name);
      setTaskType(currentTask?.type);
      setTaskQuantity(currentTask?.quantity);
    }
  }, [updateIndex, getValues, parentName, childName]);

  const addNewEntry = () => {
    append({
      name: taskName,
      type:
        taskType !== '' && currentTaskTypes?.find(t => t === taskType)
          ? taskType
          : undefined,
      description: temporaryText,
      quantity: taskQuantity,
    });
    setIsModalOpened(false);
  };

  const updateEntry = (onChange: (...event: any[]) => void) => {
    onChange({
      name: taskName,
      type:
        taskType !== '' && currentTaskTypes?.find(t => t === taskType)
          ? taskType
          : undefined,
      description: temporaryText,
      quantity: taskQuantity,
    });
    setIsModalOpened(false);
  };

  return (
    <>
      <View style={[flex.flexCol, gap.default]}>
        <FormFieldHelper title={title} />
        <View style={[flex.flexCol, gap.medium]}>
          {fields.length > 0 && (
            <View style={[flex.flexCol, gap.small]}>
              {fields.map((f, index) => (
                <View key={f.id} style={[flex.flexRow, justify.start]}>
                  <Controller
                    control={control}
                    name={`${parentName}.${index}${
                      childName ? `.${childName}` : ''
                    }`}
                    render={({field: {value}}) => (
                      <FieldArrayLabel
                        type="field"
                        text={campaignTaskToString({
                          name: value?.name,
                          type: value?.type,
                          description: value?.description,
                          quantity: value?.quantity,
                        })}
                        isDisabled={isDisabled}
                        onPress={() => {
                          setUpdateIndex(index);
                          setIsModalOpened(true);
                        }}
                        onRemovePress={() => remove(index)}
                      />
                    )}
                  />
                </View>
              ))}
            </View>
          )}
          {!isDisabled && (
            <View style={[flex.flexRow, justify.start]}>
              <FieldArrayLabel
                type="add"
                text={placeholder ? placeholder : 'Add'}
                isDisabled={isDisabled}
                onPress={() => {
                  setIsModalOpened(true);
                }}
              />
            </View>
          )}
        </View>
      </View>
      <SheetModal
        fullHeight
        snapPoints={[windowDimension.height - safeAreaInsets.top]}
        open={isModalOpened}
        onDismiss={() => {
          setIsModalOpened(false);
        }}
        enableDynamicSizing={false}>
        <BottomSheetModalWithTitle fullHeight title={title}>
          <Controller
            control={control}
            name={`${parentName}.${updateIndex}${
              childName ? `.${childName}` : ''
            }`}
            render={({field: {value, onChange}}) => (
              <View
                style={[
                  flex.flex1,
                  flex.flexCol,
                  gap.medium,
                  padding.horizontal.large,
                ]}>
                {currentTask && (
                  <View style={[flex.flexCol, gap.default]}>
                    <FormFieldHelper title="Task type" disableFlex />
                    <View style={[flex.flexRow, gap.default]}>
                      {currentTask.tasks.map((task, index) => (
                        <View key={index}>
                          <SelectableTag
                            text={task.name}
                            isSelected={taskName === task.name}
                            isDisabled={isDisabled}
                            onPress={() => {
                              setTaskName(task.name);
                            }}
                          />
                        </View>
                      ))}
                    </View>
                  </View>
                )}
                {taskName && taskName.length > 0 && currentTaskTypes && (
                  <View style={[flex.flexCol, gap.default]}>
                    <FormFieldHelper title={`${taskName} type`} disableFlex />
                    <View style={[flex.flexRow, flex.wrap, gap.default]}>
                      {currentTaskTypes?.map((types, index) => (
                        <View key={index}>
                          <SelectableTag
                            text={types}
                            isSelected={taskType === types}
                            isDisabled={isDisabled}
                            onPress={() => {
                              setTaskType(types);
                            }}
                          />
                        </View>
                      ))}
                    </View>
                  </View>
                )}
                <View style={[flex.flexCol, gap.default, items.start]}>
                  <FormFieldHelper
                    title="Description"
                    type="optional"
                    disableFlex
                  />
                  <View style={[flex.flexRow, gap.default, items.end]}>
                    <View style={[flex.flex1, padding.top.default]}>
                      <FormlessCustomTextInput
                        counter
                        type={fieldType}
                        max={maxFieldLength}
                        defaultValue={`${value?.description || ''}`}
                        placeholder={placeholder ?? `Add ${parentName}`}
                        description={helperText}
                        onChange={updateText}
                      />
                    </View>
                    <FormlessCustomNumberInput
                      min={1}
                      max={5}
                      type="field"
                      onChange={setTaskQuantity}
                    />
                  </View>
                </View>
                <CustomButton
                  disabled={
                    taskQuantity < 1 ||
                    taskName?.length === 0 ||
                    (currentTaskTypes &&
                      currentTaskTypes?.length > 0 &&
                      taskType?.length === 0)
                  }
                  text={updateIndex !== null ? 'Update' : 'Save'}
                  onPress={() => {
                    if (updateIndex !== null) {
                      updateEntry(onChange);
                    } else {
                      addNewEntry();
                    }
                  }}
                />
              </View>
            )}
          />
        </BottomSheetModalWithTitle>
      </SheetModal>
    </>
  );
};
