import * as React from "react";
import type { SVGProps } from "react";
const SvgMenu = (props: SVGProps<SVGSVGElement>) => (
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
      fillRule="evenodd"
      d="M.2 2A1.4 1.4 0 0 1 1.6.6h16.8a1.4 1.4 0 0 1 0 2.8H1.6A1.4 1.4 0 0 1 .2 2m0 7a1.4 1.4 0 0 1 1.4-1.4H10a1.4 1.4 0 0 1 0 2.8H1.6A1.4 1.4 0 0 1 .2 9m0 7a1.4 1.4 0 0 1 1.4-1.4h16.8a1.4 1.4 0 0 1 0 2.8H1.6A1.4 1.4 0 0 1 .2 16"
      clipRule="evenodd"
    />
  </svg>
);
export default SvgMenu;
