import { BotanicalCornerDecorations } from "./botanical-corner-decorations";
import { cn } from "@/lib/cn";

export interface BotanicalLayerProps {
  className?: string;
  showTopLeft?: boolean;
  showTopRight?: boolean;
  showBottomLeft?: boolean;
  showBottomRight?: boolean;
}

export function BotanicalLayer({
  className = "",
  showTopLeft = true,
  showTopRight = true,
  showBottomLeft = true,
  showBottomRight = true,
}: BotanicalLayerProps) {
  return (
    <BotanicalCornerDecorations
      className={className}
      showTopLeft={showTopLeft}
      showTopRight={showTopRight}
      showBottomLeft={showBottomLeft}
      showBottomRight={showBottomRight}
    />
  );
}

