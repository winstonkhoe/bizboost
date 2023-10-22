import React from 'react';
import {Control, useFieldArray} from 'react-hook-form';
import {Pressable, Text, View} from 'react-native';
import {CampaignFormData} from '../../screens/CreateCampaignScreen';
import {CustomTextInput} from '../atoms/Input';
type Props = {
  control: Control<CampaignFormData>;
  title: string;
  parentName: any; // string
  childName: string;
  placeholder?: string;
};
const FieldArray = ({
  control,
  title,
  parentName,
  childName,
  placeholder,
}: Props) => {
  const {fields, append, remove} = useFieldArray({
    name: parentName,
    control,
  });
  return (
    <View>
      <View className="flex flex-row justify-between items-center">
        <Text>{title}</Text>

        <Pressable onPress={() => append({value: ''})}>
          <Text className="font-bold text-md">+</Text>
        </Pressable>
      </View>
      {fields.map((f, index) => (
        <View key={f.id} className="mt-3">
          <CustomTextInput
            label={`${index + 1}`}
            placeholder={placeholder ?? `Add ${parentName}`}
            name={`${parentName}.${index}.${childName}`}
            rules={{
              required: `${parentName} ${childName} is required`,
            }}
          />
        </View>
      ))}
    </View>
  );
};

export default FieldArray;
