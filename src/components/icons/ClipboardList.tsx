import * as React from "react";
import type { SVGProps } from "react";
const SvgClipboardList = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="#111827"
      d="M10.8 2.4a1.2 1.2 0 1 0 0 2.4h2.4a1.2 1.2 0 1 0 0-2.4z"
    />
    <path
      fill="#111827"
      fillRule="evenodd"
      d="M4.8 6a2.4 2.4 0 0 1 2.4-2.4 3.6 3.6 0 0 0 3.6 3.6h2.4a3.6 3.6 0 0 0 3.6-3.6A2.4 2.4 0 0 1 19.2 6v13.2a2.4 2.4 0 0 1-2.4 2.4H7.2a2.4 2.4 0 0 1-2.4-2.4zm3.6 4.8a1.2 1.2 0 1 0 0 2.4h.012a1.2 1.2 0 0 0 0-2.4zm3.6 0a1.2 1.2 0 0 0 0 2.4h3.6a1.2 1.2 0 0 0 0-2.4zm-3.6 4.8a1.2 1.2 0 1 0 0 2.4h.012a1.2 1.2 0 0 0 0-2.4zm3.6 0a1.2 1.2 0 0 0 0 2.4h3.6a1.2 1.2 0 0 0 0-2.4z"
      clipRule="evenodd"
    />
  </svg>
);
export default SvgClipboardList;
