import * as React from "react";
import type { SVGProps } from "react";
const SvgGame = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    {...props}
  >
    <path
      fill="#080341"
      fillRule="evenodd"
      d="M12.75 6V3.75h-1.5V6H9a5.25 5.25 0 0 0-5.25 5.25v6.659a2.341 2.341 0 0 0 3.996 1.655l3.065-3.064h2.378l3.065 3.064a2.34 2.34 0 0 0 3.996-1.655V11.25C20.25 8.35 17.9 6 15 6zm6 5.25A3.75 3.75 0 0 0 15 7.5H9a3.75 3.75 0 0 0-3.75 3.75v6.659a.841.841 0 0 0 1.436.595L10.189 15h3.622l3.503 3.504a.841.841 0 0 0 1.436-.595zm-12 1.5v-1.5h1.5v-1.5h1.5v1.5h1.5v1.5h-1.5v1.5h-1.5v-1.5zM15 10.875a1.125 1.125 0 1 1-2.25 0 1.125 1.125 0 0 1 2.25 0m1.125 3.375a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25"
      clipRule="evenodd"
    />
  </svg>
);
export default SvgGame;
