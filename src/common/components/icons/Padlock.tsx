import * as React from "react";
import type { SVGProps } from "react";
const SvgPadlock = (props: SVGProps<SVGSVGElement>) => (
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
      d="M8.182 10.703H6c-.552 0-1 .446-1 .998v7.218C5 21.432 8.886 22 12 22s7-.568 7-3.081V11.7a1 1 0 0 0-1-.998h-2.182m-7.636 0V6.595C8.182 4.745 9.709 3 12 3s3.818 1.746 3.818 3.595v4.108m-7.636 0h7.636"
    />
    <path
      fill="#000"
      fillRule="evenodd"
      d="M13 16.618V18a1 1 0 1 1-2 0v-1.382a1.5 1.5 0 1 1 2 0"
      clipRule="evenodd"
    />
  </svg>
);
export default SvgPadlock;
