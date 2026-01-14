import * as React from "react";
import type { SVGProps } from "react";
const SvgListCheck = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    {...props}
  >
    <g
      stroke="#292D32"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    >
      <path d="M12.37 8.88h5.25M6.38 8.88l.75.75 2.25-2.25M12.37 15.88h5.25M6.38 15.88l.75.75 2.25-2.25" />
      <path d="M9 22h6c5 0 7-2 7-7V9c0-5-2-7-7-7H9C4 2 2 4 2 9v6c0 5 2 7 7 7" />
    </g>
  </svg>
);
export default SvgListCheck;
