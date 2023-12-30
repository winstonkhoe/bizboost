import {View} from 'react-native';
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
import {RemovableChip} from '../../components/atoms/Chip';
import {FormFieldHelper} from '../../components/atoms/FormLabel';

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
            <View style={[flex.flex1]}>
              <FormFieldHelper
                title="Content Territory"
                description="Let business people understand your target audience and content reach"
                type="optional"
              />
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
