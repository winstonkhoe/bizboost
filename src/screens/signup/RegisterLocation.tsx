import {Text, View} from 'react-native';
import {
  HorizontalPadding,
  VerticalPadding,
} from '../../components/atoms/ViewPadding';
import {gap} from '../../styles/Gap';
import {flex, items} from '../../styles/Flex';
import {openLocationModal} from '../../utils/modal';
import {useEffect, useState} from 'react';
import {Location} from '../../model/Location';
import {useNavigation} from '@react-navigation/native';
import {NavigationStackProps} from '../../navigation/StackNavigation';
import {InternalLink} from '../../components/atoms/Link';
import {textColor} from '../../styles/Text';
import {COLOR} from '../../styles/Color';
import {font} from '../../styles/Font';
import {RemovableChip} from '../../components/atoms/Chip';

interface RegisterLocationProps {
  onLocationsChange: (locations: Location[]) => void;
}

export const RegisterLocation = ({
  onLocationsChange,
}: RegisterLocationProps) => {
  const navigation = useNavigation<NavigationStackProps>();
  const [preferredLocations, setPreferredLocations] = useState<Location[]>([]);

  useEffect(() => {
    onLocationsChange(preferredLocations);
  }, [preferredLocations, onLocationsChange]);

  const removeLocation = (location: Location) => {
    setPreferredLocations(prev => {
      return prev.filter(item => item.id !== location.id);
    });
  };

  return (
    <VerticalPadding paddingSize="large">
      <HorizontalPadding paddingSize="large">
        <View style={[flex.flexCol, gap.xlarge]}>
          <View style={[flex.flexRow, items.center]}>
            <View style={[flex.flexCol, flex.growShrink, gap.small]}>
              <Text
                className="font-bold"
                style={[textColor(COLOR.text.neutral.high), font.size[50]]}>
                Preferred Job Location
              </Text>
              <Text
                className="font-semibold"
                style={[textColor(COLOR.text.neutral.med), font.size[30]]}>
                Optimize job recommendations
              </Text>
            </View>
            <InternalLink
              text="Add"
              onPress={() => {
                openLocationModal({
                  preferredLocations: preferredLocations,
                  setPreferredLocations: setPreferredLocations,
                  navigation: navigation,
                });
              }}
            />
          </View>
          <View style={[flex.flexRow, gap.small, flex.wrap]}>
            {preferredLocations.map(location => {
              return (
                <RemovableChip
                  text={location.id}
                  key={location.id}
                  onPress={() => {
                    removeLocation(location);
                  }}
                />
              );
            })}
          </View>
        </View>
      </HorizontalPadding>
    </VerticalPadding>
  );
};
