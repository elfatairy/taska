import * as React from "react";
import type { SVGProps } from "react";
const SvgSwap = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    {...props}
  >
    <g
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    >
      <path d="M21 7.5H8m13 0L16.667 3M21 7.5 16.667 12M4 16.5h13m-13 0L8.333 21M4 16.5 8.333 12" />
    </g>
  </svg>
);
export default SvgSwap;
