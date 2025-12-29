import * as React from "react";
import type { SVGProps } from "react";
const SvgShine = (props: SVGProps<SVGSVGElement>) => (
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
      d="M12 3a9 9 0 0 1-9 9 9 9 0 0 1 9 9 9 9 0 0 1 9-9 9 9 0 0 1-9-9"
    />
  </svg>
);
export default SvgShine;
