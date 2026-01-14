import * as React from "react";
import type { SVGProps } from "react";
const SvgHorizDots = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    {...props}
  >
    <g fill="currentColor">
      <circle cx={18} cy={12} r={1.5} transform="rotate(90 18 12)" />
      <circle cx={12} cy={12} r={1.5} transform="rotate(90 12 12)" />
      <circle cx={6} cy={12} r={1.5} transform="rotate(90 6 12)" />
    </g>
  </svg>
);
export default SvgHorizDots;
