import * as React from "react";
import type { SVGProps } from "react";
const SvgSupport = (props: SVGProps<SVGSVGElement>) => (
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
      fillRule="evenodd"
      d="M21.6 12a9.6 9.6 0 1 1-19.2 0 9.6 9.6 0 0 1 19.2 0m-2.4 0c0 1.192-.29 2.315-.802 3.305l-1.828-1.83a4.8 4.8 0 0 0 .093-2.62l1.875-1.874c.424.918.662 1.939.662 3.019m-6.198 4.696 1.896 1.896c-.913.402-1.9.609-2.898.608a7.2 7.2 0 0 1-3.02-.662l1.875-1.875a4.8 4.8 0 0 0 2.147.033M7.389 13.34a4.8 4.8 0 0 1-.049-2.496l-.096.096L5.408 9.1A7.2 7.2 0 0 0 4.8 12c0 1.145.268 2.227.743 3.188L7.39 13.34zM8.696 5.6A7.2 7.2 0 0 1 12 4.8c1.145 0 2.227.268 3.188.743L13.34 7.39a4.8 4.8 0 0 0-2.815.04L8.695 5.6M14.4 12a2.4 2.4 0 1 1-4.801 0 2.4 2.4 0 0 1 4.8 0"
      clipRule="evenodd"
    />
  </svg>
);
export default SvgSupport;
