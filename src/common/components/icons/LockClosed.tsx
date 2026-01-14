import * as React from "react";
import type { SVGProps } from "react";
const SvgLockClosed = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 18 20"
    {...props}
  >
    <path
      fill="#111827"
      fillRule="evenodd"
      d="M3 8.8V6.4a6 6 0 0 1 12 0v2.4a2.4 2.4 0 0 1 2.4 2.4v6a2.4 2.4 0 0 1-2.4 2.4H3a2.4 2.4 0 0 1-2.4-2.4v-6A2.4 2.4 0 0 1 3 8.8m9.6-2.4v2.4H5.4V6.4a3.6 3.6 0 1 1 7.2 0"
      clipRule="evenodd"
    />
  </svg>
);
export default SvgLockClosed;
