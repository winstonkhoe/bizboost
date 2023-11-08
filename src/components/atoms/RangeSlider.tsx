import React, {FC, useCallback, useEffect, useState, useRef} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Slider from '@react-native-community/slider';

interface MultiRangeSliderProps {
  min: number;
  max: number;
  onChange: (values: {min: number; max: number}) => void;
}

const MultiRangeSlider: FC<MultiRangeSliderProps> = ({min, max, onChange}) => {
  const [minVal, setMinVal] = useState(min);
  const [maxVal, setMaxVal] = useState(max);
  const minValRef = useRef<Slider>(null);
  const maxValRef = useRef<Slider>(null);
  const range = useRef<View>(null);

  const getPercent = useCallback(
    (value: number) => Math.round(((value - min) / (max - min)) * 100),
    [min, max],
  );

  useEffect(() => {
    if (maxValRef.current) {
      const minPercent = getPercent(minVal);
      const maxPercent = getPercent(maxValRef.current.props.value as number); // Read value from props

      if (range.current) {
        range.current.setNativeProps({
          style: {left: `${minPercent}%`, width: `${maxPercent - minPercent}%`},
        });
      }
    }
  }, [minVal, getPercent]);

  useEffect(() => {
    if (minValRef.current) {
      const minPercent = getPercent(minValRef.current.props.value as number); // Read value from props
      const maxPercent = getPercent(maxVal);

      if (range.current) {
        range.current.setNativeProps({
          style: {width: `${maxPercent - minPercent}%`},
        });
      }
    }
  }, [maxVal, getPercent]);

  useEffect(() => {
    onChange({min: minVal, max: maxVal});
  }, [minVal, maxVal, onChange]);

  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <View style={styles.container}>
        <View style={styles.track} />
        <View ref={range} style={styles.range} />
        <Text style={styles.leftValue}>{minVal}</Text>
        <Text style={styles.rightValue}>{maxVal}</Text>
        <Slider
          style={styles.slider}
          minimumValue={min}
          maximumValue={max}
          value={minVal}
          onValueChange={value => {
            const newValue = Math.min(value, maxVal - 1);
            setMinVal(newValue);
          }}
        />
        <Slider
          style={styles.slider}
          minimumValue={min}
          maximumValue={max}
          value={maxVal}
          onValueChange={value => {
            const newValue = Math.max(value, minVal + 1);
            setMaxVal(newValue);
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: 300,
  },
  track: {
    position: 'absolute',
    width: '100%',
    height: 5,
    backgroundColor: 'gray',
    borderRadius: 3,
  },
  range: {
    position: 'absolute',
    height: 5,
    backgroundColor: 'teal',
    borderRadius: 3,
  },
  leftValue: {
    position: 'absolute',
    fontSize: 12,
    marginTop: 20,
    left: 6,
  },
  rightValue: {
    position: 'absolute',
    fontSize: 12,
    marginTop: 20,
    right: 6,
  },
  slider: {
    position: 'absolute',
    width: '100%',
    zIndex: 1,
  },
});

export default MultiRangeSlider;
