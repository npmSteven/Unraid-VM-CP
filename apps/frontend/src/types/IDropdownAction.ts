import { IconTypes } from "solid-icons";
import { JSX } from "solid-js";

export type IDropdownAction = {
  text: string
  Icon: IconTypes;
  onClick: JSX.ButtonHTMLAttributes<HTMLButtonElement>['onClick']
}
