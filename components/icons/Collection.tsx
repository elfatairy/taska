import * as React from "react";
import type { SVGProps } from "react";
const SvgCollection = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 20 18"
    {...props}
  >
    <path
      fill="#111827"
      d="M6.4.6a1.2 1.2 0 0 0 0 2.4h7.2a1.2 1.2 0 1 0 0-2.4zM2.8 5.4A1.2 1.2 0 0 1 4 4.2h12a1.2 1.2 0 1 1 0 2.4H4a1.2 1.2 0 0 1-1.2-1.2M.4 10.2a2.4 2.4 0 0 1 2.4-2.4h14.4a2.4 2.4 0 0 1 2.4 2.4V15a2.4 2.4 0 0 1-2.4 2.4H2.8A2.4 2.4 0 0 1 .4 15z"
    />
  </svg>
);
export default SvgCollection;
