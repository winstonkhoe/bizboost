import {
  Pressable,
  PressableProps,
  Text,
  DeviceEventEmitter,
} from 'react-native';
import {CloseModal} from '../../components/atoms/Close';
import SafeAreaContainer from '../../containers/SafeAreaContainer';
import {
  HorizontalPadding,
  VerticalPadding,
} from '../../components/atoms/ViewPadding';
import {useEffect, useState} from 'react';
import {Location} from '../../model/Location';
import {flex} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import {View} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {
  GeneralNavigation,
  GeneralStack,
  NavigationStackProps,
} from '../../navigation/StackNavigation';
import {Checkbox} from '../../components/atoms/Checkbox';
import {ScrollView} from 'react-native-gesture-handler';
import {textColor} from '../../styles/Text';
import {COLOR} from '../../styles/Color';
import {CustomButton} from '../../components/atoms/Button';
import {closeModal} from '../../utils/modal';
import {useNavigation} from '@react-navigation/native';
import {padding} from '../../styles/Padding';

type Props = StackScreenProps<GeneralStack, GeneralNavigation.LocationModal>;

const ModalLocationScreen = ({route}: Props) => {
  const navigation = useNavigation<NavigationStackProps>();
  const {initialSelectedLocations, eventType} = route.params;
  const [selectedLocations, setSelectedLocations] = useState<Location[]>(
    initialSelectedLocations,
  );
  const [locations, setLocations] = useState<Location[]>([]);
  useEffect(() => {
    Location.getAll().then(setLocations);
  }, []);

  const toggleLocationSelection = (location: Location) => {
    if (selectedLocations.find(loc => loc.id === location.id)) {
      setSelectedLocations(
        selectedLocations.filter(loc => loc.id !== location.id),
      );
    } else {
      setSelectedLocations([...selectedLocations, location]);
    }
  };

  const emitChangesAndClose = () => {
    DeviceEventEmitter.emit(eventType, selectedLocations);
    closeModal({
      navigation: navigation,
      triggerEventOnClose: 'close.location',
    });
  };

  return (
    <SafeAreaContainer>
      <View className="flex-1" style={[flex.flexCol, gap.small]}>
        <View className="items-center" style={[flex.flexRow, gap.default]}>
          <CloseModal closeEventType="location" />
          <Text className="text-lg font-bold">Available Locations</Text>
        </View>
        <ScrollView className="flex-1" contentContainerStyle={{flexGrow: 1}}>
          <VerticalPadding paddingSize="xlarge">
            <HorizontalPadding paddingSize="medium">
              <View style={[flex.flexCol, gap.medium]}>
                {locations.map((location: Location, index) => (
                  <LocationItem
                    key={index}
                    location={location}
                    isSelected={
                      !!selectedLocations.find(loc => loc.id === location.id)
                    }
                    onPress={() => {
                      toggleLocationSelection(location);
                    }}
                  />
                ))}
              </View>
            </HorizontalPadding>
          </VerticalPadding>
        </ScrollView>
        <View style={[flex.flexCol, gap.default, padding.vertical.default]}>
          <HorizontalPadding>
            <CustomButton
              text={
                selectedLocations.length === 0
                  ? 'Choose'
                  : `Choose (${selectedLocations.length})`
              }
              disabled={selectedLocations.length === 0}
              onPress={emitChangesAndClose}
            />
          </HorizontalPadding>
        </View>
      </View>
    </SafeAreaContainer>
  );
};

interface LocationItemProps extends PressableProps {
  location: Location;
  isSelected: boolean;
}

const LocationItem = ({location, isSelected, ...props}: LocationItemProps) => {
  return (
    <Pressable style={[flex.flexRow, gap.default]} {...props}>
      <Checkbox checked={isSelected} />
      <Text
        className="text-xl font-semibold"
        style={[
          isSelected
            ? textColor(COLOR.text.neutral.low)
            : textColor(COLOR.text.neutral.high),
        ]}>
        {location.id}
      </Text>
    </Pressable>
  );
};

export default ModalLocationScreen;
