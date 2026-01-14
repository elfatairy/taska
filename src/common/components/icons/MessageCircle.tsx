import * as React from "react";
import type { SVGProps } from "react";
const SvgMessageCircle = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    {...props}
  >
    <path
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="m15.695 19.232 3.408 1.136a1 1 0 0 0 1.265-1.265l-1.136-3.408M15.3 19.1s-1.215.9-3.8.9a8.5 8.5 0 1 1 8.5-8.5c0 2.5-.9 3.8-.9 3.8"
    />
  </svg>
);
export default SvgMessageCircle;
