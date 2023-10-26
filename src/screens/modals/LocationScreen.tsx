import {Pressable, Text} from 'react-native';
import {CloseModal} from '../../components/atoms/Close';
import SafeAreaContainer from '../../containers/SafeAreaContainer';
import {HorizontalPadding} from '../../components/atoms/ViewPadding';
import {useEffect, useState} from 'react';
import {Location} from '../../model/Location';
import {flex} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import {rounded} from '../../styles/BorderRadius';
import {border} from '../../styles/Border';
import {COLOR} from '../../styles/Color';
import {View} from 'react-native';

const LocationScreen = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  useEffect(() => {
    Location.getAll().then(setLocations);
  }, []);
  return (
    <SafeAreaContainer>
      <CloseModal />
      <HorizontalPadding>
        <Text className="text-lg font-bold">Locations</Text>
        {locations.map((location: Location, index) => (
          <Pressable key={index} style={[flex.flexRow, gap.default]}>
            <View
              style={[
                rounded.small,
                border({
                  borderWidth: 2,
                  color: COLOR.black[100],
                }),
              ]}></View>
            <Text>{location.id}</Text>
          </Pressable>
        ))}
      </HorizontalPadding>
    </SafeAreaContainer>
  );
};

export default LocationScreen;
