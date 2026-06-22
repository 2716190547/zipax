import { CircleCheck, Code, FileZipper, FolderArrowDown } from "@gravity-ui/icons";
import type { ComponentType, SVGProps } from "react";

export type IconName = "compress" | "folderSync" | "codeOpen" | "update";

type IconProps = {
  name: IconName;
  className?: string;
  size?: number;
};

const icons: Record<IconName, ComponentType<SVGProps<SVGSVGElement>>> = {
  compress: FileZipper,
  folderSync: FolderArrowDown,
  codeOpen: Code,
  update: CircleCheck,
};

export function Icon({ name, className, size = 24 }: IconProps) {
  const Glyph = icons[name];
  return <Glyph className={className} width={size} height={size} aria-hidden="true" />;
}
