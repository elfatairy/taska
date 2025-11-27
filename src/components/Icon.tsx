import React, { type SVGProps } from "react";
import * as Icons from "@/components/icons";
import type { IconType } from "@/types/icon-type";

export type IconProps = SVGProps<SVGSVGElement> & {
  icon: IconType;
  size?: number;
};

export const Icon: React.FC<IconProps> = ({ icon, size, ...props }) => {
  const Component = React.createElement(Icons[icon as keyof typeof Icons], { ...props, ...(size && { width: size, height: size }) });

  return (
    <span className="custom-icon">
      {Component}
    </span>
  );
};