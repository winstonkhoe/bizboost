import {View} from 'react-native';
import {SizeType, size} from '../../styles/Size';
import {dimension} from '../../styles/Dimension';
import {COLOR} from '../../styles/Color';
import {flex, items, justify} from '../../styles/Flex';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {useEffect} from 'react';
import InstagramMono from '../../assets/vectors/instagram-mono.svg';
import TiktokMono from '../../assets/vectors/tiktok-mono.svg';
import Copy from '../../assets/vectors/copy.svg';
import Open from '../../assets/vectors/open.svg';
import BrokenLink from '../../assets/vectors/broken-link.svg';
import PhotoRevision from '../../assets/vectors/photo-revision.svg';
import Upload from '../../assets/vectors/upload.svg';
import MissingDocument from '../../assets/vectors/document-missing.svg';
import Report from '../../assets/vectors/report.svg';
import Dashboard from '../../assets/vectors/dashboard.svg';
import RatingStar from '../../assets/vectors/rating-star.svg';
import Campaign from '../../assets/vectors/campaign.svg';
import Cooperation from '../../assets/vectors/cooperation.svg';
import Search from '../../assets/vectors/search.svg';
import Date from '../../assets/vectors/date.svg';
import Card from '../../assets/vectors/card.svg';
import CrossMark from '../../assets/vectors/cross-mark-thin.svg';
import Sync from '../../assets/vectors/sync.svg';
import {SocialPlatform} from '../../model/User';
import Svg, {Path, SvgProps} from 'react-native-svg';
import {gap} from '../../styles/Gap';
import {background} from '../../styles/BackgroundColor';
import {rounded} from '../../styles/BorderRadius';
import {processColorsInProps} from 'react-native-reanimated/lib/typescript/reanimated2/Colors';

interface IconProps extends SvgProps {
  size?: SizeType;
  color?: string;
  fill?: string;
  strokeWidth?: number;
}

export const AddIcon = ({
  size = 'default',
  color = COLOR.black[100],
}: IconProps) => {
  const animatedColor = useSharedValue(color);
  useEffect(() => {
    animatedColor.value = withTiming(color, {
      duration: 300,
    });
  }, [animatedColor, color]);

  const animatedStyleColor = useAnimatedStyle(() => {
    return {
      backgroundColor: animatedColor.value,
    };
  });
  return (
    <View className="relative" style={[dimension.square[size]]}>
      <View
        className="absolute top-0 left-0"
        style={[flex.flexRow, dimension.full, justify.center, items.center]}>
        <Animated.View
          style={[
            dimension.width.full,
            dimension.height.xsmall2,
            animatedStyleColor,
          ]}
        />
      </View>
      <View
        className="absolute top-0 left-0"
        style={[flex.flexRow, dimension.full, justify.center, items.center]}>
        <Animated.View
          style={[
            dimension.height.full,
            dimension.width.xsmall2,
            animatedStyleColor,
          ]}
        />
      </View>
    </View>
  );
};

export const MinusIcon = ({
  size = 'default',
  color = COLOR.black[100],
}: IconProps) => {
  const animatedColor = useSharedValue(color);
  useEffect(() => {
    animatedColor.value = withTiming(color, {
      duration: 300,
    });
  }, [animatedColor, color]);

  const animatedStyleColor = useAnimatedStyle(() => {
    return {
      backgroundColor: animatedColor.value,
    };
  });
  return (
    <View className="relative" style={[dimension.square[size]]}>
      <View
        className="absolute top-0 left-0"
        style={[flex.flexRow, dimension.full, justify.center, items.center]}>
        <Animated.View
          style={[
            dimension.width.full,
            dimension.height.xsmall2,
            animatedStyleColor,
          ]}
        />
      </View>
    </View>
  );
};

export const InstagramIcon = ({
  size: sizeType = 'default',
  color = COLOR.black[100],
  ...props
}: IconProps) => {
  return (
    <InstagramMono
      width={size[sizeType]}
      height={size[sizeType]}
      color={color}
      {...props}
    />
  );
};

export const TiktokIcon = ({
  size: sizeType = 'default',
  color = COLOR.black[100],
}: IconProps) => {
  return (
    <TiktokMono width={size[sizeType]} height={size[sizeType]} color={color} />
  );
};

export interface PlatformIconProps extends IconProps {
  platform: SocialPlatform;
}

export const PlatformIcon = ({platform, ...props}: PlatformIconProps) => {
  switch (platform) {
    case SocialPlatform.Instagram:
      return <InstagramIcon {...props} />;
    case SocialPlatform.Tiktok:
      return <TiktokIcon {...props} />;
    default:
      return null;
  }
};

export const ChevronRight = ({
  size: sizeType = 'default',
  color = COLOR.black[100],
  strokeWidth = 1,
}: IconProps) => {
  const dimension = size[sizeType];
  return (
    <Svg
      width={dimension}
      height={dimension}
      viewBox={`0 0 ${dimension * 0.7} ${dimension}`}>
      <Path
        d={`M ${dimension * 0.2} ${dimension * 0.2} L ${dimension * 0.5} ${
          dimension * 0.5
        } ${dimension * 0.2} ${dimension * 0.8}`}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="transparent"
      />
    </Svg>
  );
};

export const ChevronLeft = ({...props}: IconProps) => {
  return (
    <View
      style={[
        {
          transform: [
            {
              rotate: '180deg',
            },
          ],
        },
      ]}>
      <ChevronRight {...props} />
    </View>
  );
};

interface IconArrowProps extends IconProps {
  type?: 'default' | 'singleSided';
}

export const ArrowIcon = ({
  type = 'default',
  size: sizeType = 'default',
  color = COLOR.black[100],
  strokeWidth = 4,
}: IconArrowProps) => {
  const dimension = size[sizeType];
  return (
    <Svg
      height={dimension}
      width={dimension}
      viewBox={`0 0 ${dimension * 2} ${dimension * 2}`}>
      <Path
        d={`M0 12L22 12M15 5l7 7-${type === 'default' ? 7 : 99999} 7`}
        stroke={color}
        fill="transparent"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
};

export const CopyIcon = ({
  size: sizeType = 'default',
  color = COLOR.black[100],
  ...props
}: IconProps) => {
  return (
    <Copy
      width={size[sizeType]}
      height={size[sizeType]}
      color={color}
      {...props}
    />
  );
};

export const OpenIcon = ({
  size: sizeType = 'default',
  color = COLOR.black[100],
  ...props
}: IconProps) => {
  return (
    <Open
      width={size[sizeType]}
      height={size[sizeType]}
      color={color}
      {...props}
    />
  );
};

export const BrokenLinkIcon = ({
  size: sizeType = 'default',
  color = COLOR.black[100],
  ...props
}: IconProps) => {
  return (
    <BrokenLink
      width={size[sizeType]}
      height={size[sizeType]}
      color={color}
      {...props}
    />
  );
};

export const PhotoRevisionIcon = ({
  size: sizeType = 'default',
  color = 'transparent',
  ...props
}: IconProps) => {
  return (
    <PhotoRevision
      width={size[sizeType]}
      height={size[sizeType]}
      color={color}
      {...props}
    />
  );
};

export const UploadIcon = ({
  size: sizeType = 'default',
  color = COLOR.black[100],
  ...props
}: IconProps) => {
  return (
    <Upload
      width={size[sizeType]}
      height={size[sizeType]}
      color={color}
      {...props}
    />
  );
};

export const CircleIcon = ({
  size: sizeType = 'default',
  color = COLOR.black[40],
}: IconProps) => {
  return (
    <View
      style={[dimension.square[sizeType], rounded.max, background(color)]}
    />
  );
};

export const MeatballMenuIcon = ({
  size: sizeType = 'default',
  color = COLOR.black[40],
}: IconProps) => {
  return (
    <View style={[flex.flexRow, gap[sizeType]]}>
      {[...Array(3)].map((_, i) => (
        <CircleIcon key={i} color={color} size={sizeType} />
      ))}
    </View>
  );
};

export const KebabMenuIcon = ({
  size: sizeType = 'default',
  color = COLOR.black[40],
}: IconProps) => {
  return (
    <View style={[flex.flexCol, gap[sizeType]]}>
      {[...Array(3)].map((_, i) => (
        <CircleIcon key={i} color={color} size={sizeType} />
      ))}
    </View>
  );
};

export const MissingDocumentIcon = ({
  size: sizeType = 'default',
  color = COLOR.black[100],
  strokeWidth = 2,
}: IconProps) => {
  return (
    <MissingDocument
      width={size[sizeType]}
      height={size[sizeType]}
      color={color}
      strokeWidth={strokeWidth}
    />
  );
};

export const ReportIcon = ({
  size: sizeType = 'default',
  color = COLOR.red[60],
  strokeWidth = 2,
}: IconProps) => {
  return (
    <Report
      width={size[sizeType]}
      height={size[sizeType]}
      color={color}
      strokeWidth={strokeWidth}
    />
  );
};

export const DashboardIcon = ({
  size: sizeType = 'default',
  color = COLOR.red[60],
  fill = color,
  ...props
}: IconProps) => {
  return (
    <Dashboard
      width={size[sizeType]}
      height={size[sizeType]}
      color={color}
      fill={fill}
      {...props}
    />
  );
};

export const RatingStarIcon = ({
  size: sizeType = 'default',
  color = '#FFDB44',
}: IconProps) => {
  return (
    <RatingStar width={size[sizeType]} height={size[sizeType]} color={color} />
  );
};

export const CampaignIcon = ({
  size: sizeType = 'default',
  color = COLOR.black[100],
  fill = COLOR.black[100],
  strokeWidth = 0,
  ...props
}: IconProps) => {
  return (
    <Campaign
      width={size[sizeType]}
      height={size[sizeType]}
      color={color}
      fill={fill}
      strokeWidth={strokeWidth}
      {...props}
    />
  );
};

export const CooperationIcon = ({
  size: sizeType = 'default',
  color = COLOR.black[100],
  fill = 'transparent',
  strokeWidth = 1,
  ...props
}: IconProps) => {
  return (
    <Cooperation
      width={size[sizeType]}
      height={size[sizeType]}
      color={color}
      fill={fill}
      strokeWidth={strokeWidth}
      {...props}
    />
  );
};

export const SearchIcon = ({
  size: sizeType = 'default',
  color = COLOR.black[100],
  fill = 'transparent',
  strokeWidth = 1.5,
  ...props
}: IconProps) => {
  return (
    <Search
      width={size[sizeType]}
      height={size[sizeType]}
      color={color}
      fill={fill}
      strokeWidth={strokeWidth}
      {...props}
    />
  );
};

export const DateIcon = ({
  size: sizeType = 'default',
  color = COLOR.black[100],
  ...props
}: IconProps) => {
  return (
    <Date
      width={size[sizeType]}
      height={size[sizeType]}
      color={color}
      {...props}
    />
  );
};

export const CardIcon = ({
  size: sizeType = 'default',
  color = COLOR.green[60],
  ...props
}: IconProps) => {
  return (
    <Card
      width={size[sizeType]}
      height={size[sizeType]}
      color={color}
      {...props}
    />
  );
};

export const CrossMarkIcon = ({
  size: sizeType = 'default',
  color = COLOR.black[100],
  ...props
}: IconProps) => {
  return (
    <CrossMark
      width={size[sizeType]}
      height={size[sizeType]}
      color={color}
      {...props}
    />
  );
};

export const SyncIcon = ({
  size: sizeType = 'default',
  color = COLOR.green[50],
  ...props
}: IconProps) => {
  return (
    <Sync
      width={size[sizeType]}
      height={size[sizeType]}
      color={color}
      {...props}
    />
  );
};
