import * as React from "react";
import type { SVGProps } from "react";
const SvgChartPie = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="#0E9F6E"
      d="M2.4 12A9.6 9.6 0 0 1 12 2.4V12h9.6a9.6 9.6 0 1 1-19.2 0"
    />
    <path fill="#0E9F6E" d="M14.4 2.702A9.62 9.62 0 0 1 21.297 9.6H14.4z" />
  </svg>
);
export default SvgChartPie;
