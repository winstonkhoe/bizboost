import {Pressable, Text, View} from 'react-native';
import {textColor} from '../../styles/Text';
import {COLOR} from '../../styles/Color';
import {flex} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import Carousel, {ICarouselInstance} from 'react-native-reanimated-carousel';
import {Dimensions} from 'react-native';
import ContentCreator from '../../assets/vectors/content-creator.svg';
import BusinessPeople from '../../assets/vectors/business-people.svg';
import {SvgProps} from 'react-native-svg';
import {UserRole} from '../../model/User';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {background} from '../../styles/BackgroundColor';
import {shadow} from '../../styles/Shadow';
import {rounded} from '../../styles/BorderRadius';
import {HorizontalPadding} from '../../components/atoms/ViewPadding';
import {useEffect, useRef, useState} from 'react';
import {font} from '../../styles/Font';

interface RoleCard {
  role: UserRole;
  description: string;
  asset: React.FC<SvgProps>;
}

const data: RoleCard[] = [
  {
    role: UserRole.BusinessPeople,
    description: 'You seek to promote your business through content creation',
    asset: BusinessPeople,
  },
  {
    role: UserRole.ContentCreator,
    description: 'You seek to sell content creation service',
    asset: ContentCreator,
  },
];

interface ChooseRoleProps {
  onChangeRole: (role: UserRole) => void;
}

export const ChooseRole = ({onChangeRole}: ChooseRoleProps) => {
  const carouselRef = useRef<ICarouselInstance>(null);
  const updateRoleCarouselIndexRef = useRef<boolean>(true);
  const [activeCarouselIndex, setActiveCarouselIndex] = useState<number>(0);
  const width = Dimensions.get('window').width;

  useEffect(() => {
    onChangeRole(data[activeCarouselIndex].role);
  }, [activeCarouselIndex, onChangeRole]);

  const scrollToRole = (index: number) => {
    carouselRef.current?.scrollTo({
      index: index,
      animated: true,
    });
  };

  return (
    <View className="items-center" style={[flex.flexCol, gap.medium]}>
      <Text
        className="font-bold"
        style={[textColor(COLOR.text.neutral.high), font.size[70]]}>
        Choose your Role
      </Text>
      <Carousel
        ref={carouselRef}
        loop={false}
        width={width}
        mode="parallax"
        height={width * 1.25}
        data={data}
        scrollAnimationDuration={300}
        modeConfig={{
          parallaxScrollingScale: 0.75,
          parallaxScrollingOffset: 180,
        }}
        onSnapToItem={index => {
          setActiveCarouselIndex(index);
        }}
        onProgressChange={(offsetProgress, absoluteProgress) => {
          if (
            updateRoleCarouselIndexRef.current &&
            absoluteProgress % 1 !== 0
          ) {
            setActiveCarouselIndex(activeCarouselIndex === 0 ? 1 : 0);
            updateRoleCarouselIndexRef.current = false;
          }
          if (absoluteProgress % 1 === 0) {
            updateRoleCarouselIndexRef.current = true;
          }
        }}
        renderItem={({index, item}) => (
          <Pressable
            key={index}
            onPress={() => scrollToRole(index)}
            style={[flex.flex1]}>
            <RoleCard
              index={index}
              roleCard={item}
              activeIndex={activeCarouselIndex}
            />
          </Pressable>
        )}
      />
    </View>
  );
};

interface RoleCardProps {
  roleCard: RoleCard;
  index: number;
  activeIndex: number;
}

const RoleCard = ({roleCard, index, activeIndex}: RoleCardProps) => {
  const progress = useSharedValue(activeIndex);

  useEffect(() => {
    progress.value = withTiming(activeIndex, {duration: 300});
  }, [activeIndex, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      borderColor: interpolateColor(
        progress.value,
        [0.3, 0.7],
        [...Array(2)].map((_, i) =>
          i === index ? COLOR.green[20] : COLOR.background.neutral.disabled,
        ),
      ),
    };
  });

  const animatedScale = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(
            progress.value,
            [0, 1],
            [...Array(2)].map((_, i) => (i === index ? 1.3 : 1)),
          ),
        },
        {
          translateY: interpolate(
            progress.value,
            [0, 1],
            [...Array(2)].map((_, i) => (i === index ? 0 : 40)),
          ),
        },
      ],
    };
  });

  return (
    <Animated.View
      className="flex-1 relative"
      style={[
        {
          justifyContent: 'center',
          borderWidth: 5,
        },
        animatedStyle,
        background(COLOR.black[0]),
        shadow.medium,
        rounded.xlarge,
      ]}>
      <View
        className="flex-1"
        style={[
          flex.flexCol,
          activeIndex !== index && {
            opacity: 0.5,
          },
          gap.xlarge,
        ]}>
        <Animated.View
          className="justify-center"
          style={[flex.flexRow, animatedScale]}>
          <roleCard.asset width={300} height={300} />
        </Animated.View>
        <HorizontalPadding>
          <View className="items-center mt-6" style={[flex.flexCol, gap.small]}>
            <Text
              className="text-2xl font-bold"
              style={[textColor(COLOR.text.neutral.high)]}>
              {roleCard.role}
            </Text>
            <Text
              className="text-lg font-semibold text-center"
              style={[textColor(COLOR.text.neutral.med)]}>
              {roleCard.description}
            </Text>
          </View>
        </HorizontalPadding>
      </View>
    </Animated.View>
  );
};
