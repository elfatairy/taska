import React, { type SVGProps } from "react";
import * as Icons from "@/components/icons";
import type { IconType } from "@/types/icon-type";
import { cn } from "@/lib/utils";

export type IconProps = SVGProps<SVGSVGElement> & {
  icon: IconType;
  size?: number;
};

export const Icon: React.FC<IconProps> = ({ icon, size, className, ...props }) => {
  const Component = React.createElement(Icons[icon as keyof typeof Icons], { ...props, ...(size && { width: size, height: size }), className });

  return (
    <span className={cn("custom-icon")}>
      {Component}
    </span>
  );
};