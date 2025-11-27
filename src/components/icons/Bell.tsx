import * as React from "react";
import type { SVGProps } from "react";
const SvgBell = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 24 25"
    {...props}
  >
    <path
      fill="#111827"
      d="M12 2.9a7.2 7.2 0 0 0-7.2 7.2v4.303l-.848.849A1.2 1.2 0 0 0 4.8 17.3h14.4a1.2 1.2 0 0 0 .848-2.048l-.848-.849V10.1A7.2 7.2 0 0 0 12 2.9m0 19.2a3.6 3.6 0 0 1-3.6-3.6h7.2a3.6 3.6 0 0 1-3.6 3.6"
    />
  </svg>
);
export default SvgBell;
