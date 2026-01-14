import * as React from "react";
import type { SVGProps } from "react";
const SvgChartPie = (props: SVGProps<SVGSVGElement>) => (
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
      <path d="M19.95 17.95 15 13h7a6.98 6.98 0 0 1-2.05 4.95M20 10a7 7 0 0 0-7-7v7zM2 12a8 8 0 0 0 13.657 5.657L10 12V4a8 8 0 0 0-8 8" />
    </g>
  </svg>
);
export default SvgChartPie;
