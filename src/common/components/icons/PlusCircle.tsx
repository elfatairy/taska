import * as React from "react";
import type { SVGProps } from "react";
const SvgPlusCircle = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 512 512"
    width="1em"
    height="1em"
    {...props}
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M256 85.333c94.257 0 170.667 76.41 170.667 170.667S350.257 426.667 256 426.667 85.333 350.257 85.333 256 161.743 85.333 256 85.333M256 128c-70.692 0-128 57.308-128 128s57.308 128 128 128 128-57.308 128-128-57.308-128-128-128m21.333 42.667v64h64v42.666h-64v64h-42.666v-64h-64v-42.666h64v-64z"
    />
  </svg>
);
export default SvgPlusCircle;
