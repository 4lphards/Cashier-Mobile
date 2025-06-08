// This file is for type reference only. See https://github.com/Swapnil1104/react-native-gifted-charts#props for full prop list.

export interface BarChartPropsType {
  data: { value: number; label?: string }[];
  width?: number;
  height?: number;
  yAxisColor?: string;
  xAxisColor?: string;
  frontColor?: string;
  xAxisLabelTextStyle?: object;
  yAxisTextStyle?: object;
  showValuesAsBarLabel?: boolean;
  // ...other props
}

export interface LineChartPropsType {
  data: { value: number; label?: string }[];
  width?: number;
  height?: number;
  areaChart?: boolean;
  yAxisColor?: string;
  xAxisColor?: string;
  color?: string;
  hideDataPoints?: boolean;
  showVerticalLines?: boolean;
  showXAxisIndices?: boolean;
  xAxisLabelTextStyle?: object;
  yAxisTextStyle?: object;
  // ...other props
}
