declare module "react-native-check-box" {
  import React from "react";
  import { ViewStyle } from "react-native";

  interface CheckBoxProps {
    onClick: () => void;
    isChecked: boolean;
    leftText?: string;
    rightText?: string;
    leftTextStyle?: object;
    rightTextStyle?: object;
    checkBoxColor?: string;
    checkedImage?: React.ReactNode;
    unCheckedImage?: React.ReactNode;
    style?: ViewStyle;
  }

  export default class CheckBox extends React.Component<CheckBoxProps> {}
}
