import type { ReactNode, CSSProperties, FC } from "react";

export interface LogoLoopNodeItem {
  node: ReactNode;
  title?: string;
  ariaLabel?: string;
  href?: string;
}

export interface LogoLoopImageItem {
  src: string;
  srcSet?: string;
  sizes?: string;
  width?: number;
  height?: number;
  alt?: string;
  title?: string;
  href?: string;
}

export type LogoLoopItem = LogoLoopNodeItem | LogoLoopImageItem;

export interface LogoLoopProps {
  logos: LogoLoopItem[];
  speed?: number;
  direction?: "left" | "right" | "up" | "down";
  width?: number | string;
  logoHeight?: number;
  gap?: number;
  pauseOnHover?: boolean;
  hoverSpeed?: number;
  fadeOut?: boolean;
  fadeOutColor?: string;
  scaleOnHover?: boolean;
  renderItem?: (item: LogoLoopItem, key: string) => ReactNode;
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
}

declare const LogoLoop: FC<LogoLoopProps>;
export default LogoLoop;
