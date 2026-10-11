import Image from "next/image";
import { cn } from "@/lib/cn";

export interface BotanicalCornerDecorationsProps {
  className?: string;
  showTopLeft?: boolean;
  showTopRight?: boolean;
  showBottomLeft?: boolean;
  showBottomRight?: boolean;
}

/**
 * BotanicalCornerDecorations renders the user-provided high-resolution
 * transparent PNG images ("green-leafs" / "green-leaves.png" and "pink cherry" / "pink-cherry.png")
 * perfectly positioned and animated in the landing page corners.
 */
export function BotanicalCornerDecorations({
  className = "",
  showTopLeft = true,
  showTopRight = true,
  showBottomLeft = true,
  showBottomRight = true,
}: BotanicalCornerDecorationsProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden select-none z-0",
        className
      )}
      aria-hidden="true"
    >
      {/* 1. Atmospheric Ambient Tint Glows for the Burgundy & Rose Corners (hidden on mobile for high FPS scrolling) */}
      {/* Burgundy Ambient Glow (Top-Left) */}
      <div
        className="pointer-events-none absolute -top-24 -left-24 hidden sm:block h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,rgba(122,24,53,0.09)_0%,transparent_70%)] blur-3xl opacity-80"
        aria-hidden="true"
      />
      {/* Soft Blush Rose Blossom Glow (Top-Right) */}
      <div
        className="pointer-events-none absolute -top-24 -right-24 hidden sm:block h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,rgba(199,122,139,0.08)_0%,transparent_68%)] blur-3xl opacity-80"
        aria-hidden="true"
      />
      {/* Warm Champagne Gold Glow (Bottom-Left) */}
      <div
        className="pointer-events-none absolute bottom-8 -left-16 hidden sm:block h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,rgba(216,178,140,0.10)_0%,transparent_70%)] blur-3xl"
        aria-hidden="true"
      />
      {/* Soft Rose Glow (Bottom-Right) */}
      <div
        className="pointer-events-none absolute bottom-8 -right-16 hidden sm:block h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(199,122,139,0.07)_0%,transparent_70%)] blur-3xl"
        aria-hidden="true"
      />

      {/* 2. TOP-LEFT CORNER: Lush Green Leaves Branch */}
      {/* Extends from the true top-left corner, draping gracefully behind the "Curated for intentional matrimony" badge */}
      {showTopLeft && (
        <div
          className={cn(
            "pointer-events-none absolute top-0 left-0 z-[2]",
            "-translate-x-[20%] -translate-y-[20%]",
            "w-20 sm:w-28 md:w-32 lg:w-40 xl:w-48 2xl:w-56",
            "origin-top-left",
            "opacity-75 sm:opacity-80 xl:opacity-85",
            "transition-opacity duration-700"
          )}
        >
          <div className="relative aspect-[3/2] w-full drop-shadow-[0_14px_28px_rgba(10,50,30,0.16)] animate-botanical-float-left">
            <Image
              src="/images/green-leaves.png"
              alt=""
              width={960}
              height={640}
              priority
              quality={92}
              sizes="(max-width: 640px) 192px, (max-width: 1024px) 320px, 480px"
              className="h-full w-full object-contain object-top-left"
            />
          </div>
        </div>
      )}


      {/* 3. TOP-RIGHT CORNER: Romantic Pink Cherry Blossom Branch */}
      {/* Hugs the top-right corner elegantly, flowers cascading along the right margin */}
      {showTopRight && (
        <div
          className={cn(
            "pointer-events-none absolute top-0 right-0",
            "translate-x-[20%] -translate-y-[20%]",
            "w-16 sm:w-20 md:w-24 lg:w-32 xl:w-40 2xl:w-48",
            "origin-top-right",
            "opacity-75 sm:opacity-80 xl:opacity-85",
            "transition-opacity duration-700"
          )}
        >
          <div className="animate-botanical-float-right">
            <div
              className="relative aspect-square w-full drop-shadow-[0_12px_24px_rgba(200,60,90,0.15)]"
              style={{
                transform: "rotate(155deg)",
                transformOrigin: "center center",
              }}
            >
              <Image
                src="/images/pink-cherry.png"
                alt=""
                width={800}
                height={800}
                priority
                quality={90}
                sizes="(max-width: 640px) 144px, (max-width: 1024px) 272px, 432px"
                className="h-full w-full object-contain object-top-right"
              />
            </div>
          </div>
        </div>
      )}


      {/* 4. BOTTOM-LEFT CORNER: Subtle Botanical Green Leaf Accent */}
      {/* Anchored at bottom-left corner to frame the lower hero border */}
      {showBottomLeft && (
        <div
          className={cn(
            "pointer-events-none absolute bottom-8 -left-4 sm:bottom-12 sm:-left-6 lg:bottom-16 lg:-left-8 z-[2]",
            "w-28 sm:w-40 md:w-52 lg:w-60 xl:w-68",
            "hidden sm:block origin-bottom-left animate-botanical-sway-3 opacity-75 sm:opacity-85 lg:opacity-90"
          )}
        >
          <div
            className="relative aspect-[3/2] w-full drop-shadow-[0_10px_20px_rgba(10,50,30,0.13)]"
            style={{
              transform: "rotate(-25deg) scaleY(-1)",
              transformOrigin: "center center",
            }}
          >
            <Image
              src="/images/green-leaves.png"
              alt=""
              width={640}
              height={426}
              quality={85}
              sizes="(max-width: 640px) 112px, (max-width: 1024px) 208px, 272px"
              className="h-full w-full object-contain object-bottom-left"
            />
          </div>
        </div>
      )}

      {/* 5. BOTTOM-RIGHT CORNER: Romantic Pink Cherry Blossom Accent */}
      {/* Flipped same as green leaf so the woody stick is hidden off the right/bottom edge and blossoms emerge inward */}
      {showBottomRight && (
        <div
          className={cn(
            "pointer-events-none absolute -bottom-8 -right-8 sm:-bottom-12 sm:-right-12 lg:-bottom-16 lg:-right-16 z-[2]",
            "translate-x-[20%] translate-y-[20%]",
            "w-20 sm:w-28 md:w-32 lg:w-40 xl:w-48",
            "hidden sm:block origin-bottom-right animate-botanical-sway-1 opacity-75 sm:opacity-85 lg:opacity-90"
          )}
        >
          <div
            className="relative aspect-square w-full drop-shadow-[0_12px_24px_rgba(200,60,90,0.14)]"
            style={{
              transform: "scaleX(1) rotate(-15deg)",
              transformOrigin: "center center",
            }}
          >
            <Image
              src="/images/pink-cherry.png"
              alt=""
              width={720}
              height={720}
              quality={90}
              sizes="(max-width: 640px) 144px, (max-width: 1024px) 240px, 336px"
              className="h-full w-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}


