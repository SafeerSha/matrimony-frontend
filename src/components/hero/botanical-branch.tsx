import type { SVGProps } from "react";
import { cn } from "@/lib/cn";

export interface BotanicalBranchProps extends SVGProps<SVGSVGElement> {
  variant?: "curved-left" | "curved-right" | "upward-left" | "spray-small" | "foreground-cluster";
  depth?: "foreground" | "middle" | "background";
  className?: string;
}

export function BotanicalBranch({
  variant = "curved-left",
  depth = "middle",
  className = "",
  style,
  ...props
}: BotanicalBranchProps) {
  // Richer opacity levels so leaves are clearly visible, lush, and vibrant
  const depthClass =
    depth === "foreground"
      ? "opacity-85 filter blur-[1px]"
      : depth === "background"
      ? "opacity-65 filter blur-[1.5px]"
      : "opacity-95 filter-none";

  if (variant === "curved-left") {
    // Lush arching branch entering from top-left with natural side twigs and 25+ leaves
    return (
      <svg
        viewBox="0 0 340 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("pointer-events-none transition-opacity", depthClass, className)}
        style={style}
        aria-hidden="true"
        {...props}
      >
        <defs>
          <linearGradient id="stem-grad-left" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--botanical-deep)" />
            <stop offset="100%" stopColor="var(--botanical-primary)" />
          </linearGradient>
          <linearGradient id="leaf-grad-rich-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--botanical-rich)" />
            <stop offset="100%" stopColor="var(--botanical-deep)" />
          </linearGradient>
          <linearGradient id="leaf-grad-sage-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--botanical-primary)" />
            <stop offset="100%" stopColor="var(--botanical-sage)" />
          </linearGradient>
          <linearGradient id="leaf-grad-soft-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--botanical-soft)" />
            <stop offset="100%" stopColor="var(--botanical-deep)" />
          </linearGradient>
        </defs>

        {/* Main curved branch stem */}
        <path
          d="M0,15 Q110,45 200,120 T315,235"
          stroke="url(#stem-grad-left)"
          strokeWidth="2.8"
          strokeLinecap="round"
        />

        {/* Side twig 1 (Upper offshoot) */}
        <path
          d="M95,58 Q125,40 160,28"
          stroke="url(#stem-grad-left)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Side twig 2 (Middle offshoot) */}
        <path
          d="M185,115 Q225,95 258,82"
          stroke="url(#stem-grad-left)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Side twig 3 (Lower offshoot) */}
        <path
          d="M245,168 Q280,160 305,152"
          stroke="url(#stem-grad-left)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />

        {/* --- LEAF CLUSTER 1: Origin & Base Leaves --- */}
        {/* Leaf 1 */}
        <path d="M22,22 C36,10 54,16 56,32 C42,38 28,34 22,22 Z" fill="url(#leaf-grad-rich-1)" />
        <path d="M26,24 Q38,26 48,31" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" strokeLinecap="round" />

        {/* Leaf 2 */}
        <path d="M38,32 C44,14 62,8 74,18 C70,34 54,40 38,32 Z" fill="url(#leaf-grad-sage-1)" />
        <path d="M44,30 Q56,22 66,20" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" strokeLinecap="round" />

        {/* Leaf 3 */}
        <path d="M52,42 C68,34 86,44 88,60 C72,64 56,56 52,42 Z" fill="url(#leaf-grad-soft-1)" />
        <path d="M58,45 Q70,49 80,56" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" strokeLinecap="round" />

        {/* Leaf 4 */}
        <path d="M68,28 C78,12 96,14 102,30 C94,44 78,42 68,28 Z" fill="url(#leaf-grad-rich-1)" />

        {/* --- LEAF CLUSTER 2: Upper Twig 1 Leaves --- */}
        {/* Leaf 5 */}
        <path d="M110,48 C122,32 140,36 142,50 C128,56 116,54 110,48 Z" fill="url(#leaf-grad-sage-1)" />
        {/* Leaf 6 */}
        <path d="M125,35 C132,18 150,18 156,32 C146,42 134,40 125,35 Z" fill="url(#leaf-grad-rich-1)" />
        {/* Leaf 7 */}
        <path d="M142,26 C152,10 170,14 174,28 C162,36 148,34 142,26 Z" fill="url(#leaf-grad-soft-1)" />
        {/* Leaf 8 (Terminal of twig 1) */}
        <path d="M160,26 C176,14 192,24 188,38 C174,40 164,34 160,26 Z" fill="url(#leaf-grad-rich-1)" />

        {/* --- LEAF CLUSTER 3: Main Mid-Stem Pairs --- */}
        {/* Leaf 9 */}
        <path d="M96,68 C116,56 138,66 140,84 C120,90 102,82 96,68 Z" fill="url(#leaf-grad-rich-1)" />
        <path d="M102,72 Q118,74 132,80" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" strokeLinecap="round" />

        {/* Leaf 10 */}
        <path d="M118,80 C128,62 148,54 160,66 C152,82 134,90 118,80 Z" fill="url(#leaf-grad-sage-1)" />

        {/* Leaf 11 */}
        <path d="M138,92 C158,80 180,90 182,108 C162,114 144,106 138,92 Z" fill="url(#leaf-grad-soft-1)" />
        <path d="M144,96 Q160,98 172,104" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" strokeLinecap="round" />

        {/* Leaf 12 */}
        <path d="M152,106 C162,88 182,82 192,96 C186,112 168,118 152,106 Z" fill="url(#leaf-grad-rich-1)" />

        {/* --- LEAF CLUSTER 4: Twig 2 Offshoot Leaves --- */}
        {/* Leaf 13 */}
        <path d="M200,105 C216,92 234,98 236,112 C222,118 208,114 200,105 Z" fill="url(#leaf-grad-sage-1)" />
        {/* Leaf 14 */}
        <path d="M220,95 C230,78 248,82 252,98 C240,106 226,104 220,95 Z" fill="url(#leaf-grad-rich-1)" />
        {/* Leaf 15 */}
        <path d="M238,86 C250,70 268,76 270,92 C256,98 244,94 238,86 Z" fill="url(#leaf-grad-soft-1)" />
        {/* Leaf 16 (Terminal twig 2) */}
        <path d="M256,80 C272,68 288,78 286,94 C270,96 260,90 256,80 Z" fill="url(#leaf-grad-rich-1)" />

        {/* --- LEAF CLUSTER 5: Lower Main Stem Pairs --- */}
        {/* Leaf 17 */}
        <path d="M192,132 C214,122 234,134 236,152 C214,156 196,148 192,132 Z" fill="url(#leaf-grad-rich-1)" />
        <path d="M198,136 Q214,140 226,147" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" strokeLinecap="round" />

        {/* Leaf 18 */}
        <path d="M210,146 C220,126 242,122 250,138 C242,154 224,158 210,146 Z" fill="url(#leaf-grad-sage-1)" />

        {/* Leaf 19 */}
        <path d="M230,165 C250,154 270,164 272,180 C252,184 236,176 230,165 Z" fill="url(#leaf-grad-soft-1)" />

        {/* Leaf 20 (On Twig 3) */}
        <path d="M265,160 C278,144 296,148 298,164 C284,170 272,168 265,160 Z" fill="url(#leaf-grad-rich-1)" />
        {/* Leaf 21 (On Twig 3) */}
        <path d="M285,152 C300,138 316,146 316,162 C302,166 292,160 285,152 Z" fill="url(#leaf-grad-sage-1)" />

        {/* --- LEAF CLUSTER 6: Graceful Terminal Leaves --- */}
        {/* Leaf 22 */}
        <path d="M260,192 C280,182 298,194 298,210 C280,214 266,204 260,192 Z" fill="url(#leaf-grad-rich-1)" />
        <path d="M266,196 Q280,200 290,206" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" strokeLinecap="round" />

        {/* Leaf 23 */}
        <path d="M276,204 C286,188 304,186 312,200 C306,216 290,218 276,204 Z" fill="url(#leaf-grad-sage-1)" />

        {/* Leaf 24 */}
        <path d="M294,218 C312,210 326,222 324,236 C310,238 298,230 294,218 Z" fill="url(#leaf-grad-rich-1)" />

        {/* Leaf 25 (Delicate tip) */}
        <path d="M312,232 C328,225 338,234 336,246 C324,248 316,242 312,232 Z" fill="var(--botanical-sage)" />
      </svg>
    );
  }

  if (variant === "curved-right") {
    // Lush arching branch entering from top-right with natural side twigs and 25+ leaves
    return (
      <svg
        viewBox="0 0 350 270"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("pointer-events-none transition-opacity", depthClass, className)}
        style={style}
        aria-hidden="true"
        {...props}
      >
        <defs>
          <linearGradient id="stem-grad-right" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--botanical-deep)" />
            <stop offset="100%" stopColor="var(--botanical-primary)" />
          </linearGradient>
          <linearGradient id="leaf-grad-rich-right" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--botanical-rich)" />
            <stop offset="100%" stopColor="var(--botanical-deep)" />
          </linearGradient>
          <linearGradient id="leaf-grad-sage-right" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--botanical-primary)" />
            <stop offset="100%" stopColor="var(--botanical-sage)" />
          </linearGradient>
        </defs>

        {/* Main stem entering from top-right, sweeping inward and down */}
        <path
          d="M350,15 Q240,48 150,122 T30,240"
          stroke="url(#stem-grad-right)"
          strokeWidth="2.8"
          strokeLinecap="round"
        />

        {/* Twig 1 (Upper offshoot) */}
        <path
          d="M255,60 Q225,40 188,30"
          stroke="url(#stem-grad-right)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Twig 2 (Middle offshoot) */}
        <path
          d="M165,118 Q125,98 90,85"
          stroke="url(#stem-grad-right)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Twig 3 (Lower offshoot) */}
        <path
          d="M100,172 Q65,162 40,155"
          stroke="url(#stem-grad-right)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />

        {/* --- LEAVES: Origin & Base --- */}
        <path d="M328,24 C314,12 296,18 294,34 C308,40 322,36 328,24 Z" fill="url(#leaf-grad-rich-right)" />
        <path d="M324,26 Q312,28 302,33" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" strokeLinecap="round" />

        <path d="M312,34 C306,16 288,10 276,20 C280,36 296,42 312,34 Z" fill="url(#leaf-grad-sage-right)" />
        <path d="M298,44 C282,36 264,46 262,62 C278,66 294,58 298,44 Z" fill="url(#leaf-grad-rich-right)" />
        <path d="M282,30 C272,14 254,16 248,32 C256,46 272,44 282,30 Z" fill="url(#leaf-grad-sage-right)" />

        {/* --- Twig 1 Leaves --- */}
        <path d="M240,50 C228,34 210,38 208,52 C222,58 234,56 240,50 Z" fill="url(#leaf-grad-rich-right)" />
        <path d="M225,38 C218,20 200,20 194,34 C204,44 216,42 225,38 Z" fill="url(#leaf-grad-sage-right)" />
        <path d="M208,28 C198,12 180,16 176,30 C188,38 202,36 208,28 Z" fill="url(#leaf-grad-rich-right)" />
        <path d="M190,28 C174,16 158,26 162,40 C176,42 186,36 190,28 Z" fill="url(#leaf-grad-sage-right)" />

        {/* --- Mid-Stem Leaves --- */}
        <path d="M254,70 C234,58 212,68 210,86 C230,92 248,84 254,70 Z" fill="url(#leaf-grad-rich-right)" />
        <path d="M248,74 Q232,76 218,82" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" strokeLinecap="round" />

        <path d="M232,82 C222,64 202,56 190,68 C198,84 216,92 232,82 Z" fill="url(#leaf-grad-sage-right)" />
        <path d="M212,94 C192,82 170,92 168,110 C188,116 206,108 212,94 Z" fill="url(#leaf-grad-rich-right)" />
        <path d="M198,108 C188,90 168,84 158,98 C164,114 182,120 198,108 Z" fill="url(#leaf-grad-sage-right)" />

        {/* --- Twig 2 Leaves --- */}
        <path d="M150,108 C134,94 116,100 114,114 C128,120 142,116 150,108 Z" fill="url(#leaf-grad-rich-right)" />
        <path d="M130,98 C120,80 102,84 98,100 C110,108 124,106 130,98 Z" fill="url(#leaf-grad-sage-right)" />
        <path d="M112,88 C100,72 82,78 80,94 C94,100 106,96 112,88 Z" fill="url(#leaf-grad-rich-right)" />
        <path d="M94,82 C78,70 62,80 64,96 C80,98 90,92 94,82 Z" fill="url(#leaf-grad-sage-right)" />

        {/* --- Lower Stem Leaves --- */}
        <path d="M158,134 C136,124 116,136 114,154 C136,158 154,150 158,134 Z" fill="url(#leaf-grad-rich-right)" />
        <path d="M152,138 Q136,142 124,149" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" strokeLinecap="round" />

        <path d="M140,148 C130,128 108,124 100,140 C108,156 126,160 140,148 Z" fill="url(#leaf-grad-sage-right)" />
        <path d="M120,168 C100,156 80,166 78,182 C98,186 114,178 120,168 Z" fill="url(#leaf-grad-rich-right)" />

        {/* --- Twig 3 Leaves --- */}
        <path d="M85,162 C72,146 54,150 52,166 C66,172 78,170 85,162 Z" fill="url(#leaf-grad-sage-right)" />
        <path d="M65,154 C50,140 34,148 34,164 C48,168 58,162 65,154 Z" fill="url(#leaf-grad-rich-right)" />

        {/* --- Terminal Leaves --- */}
        <path d="M90,195 C70,184 52,196 52,212 C70,216 84,206 90,195 Z" fill="url(#leaf-grad-rich-right)" />
        <path d="M84,199 Q70,203 60,209" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" strokeLinecap="round" />

        <path d="M74,206 C64,190 46,188 38,202 C44,218 60,220 74,206 Z" fill="url(#leaf-grad-sage-right)" />
        <path d="M56,220 C38,212 24,224 26,238 C40,240 52,232 56,220 Z" fill="url(#leaf-grad-rich-right)" />
        <path d="M38,235 C22,228 12,236 14,248 C26,250 34,244 38,235 Z" fill="var(--botanical-sage)" />
      </svg>
    );
  }

  if (variant === "upward-left") {
    // Upward ascending botanical vine from bottom-left corner with 20+ leaves
    return (
      <svg
        viewBox="0 0 220 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("pointer-events-none transition-opacity", depthClass, className)}
        style={style}
        aria-hidden="true"
        {...props}
      >
        <defs>
          <linearGradient id="upward-stem-grad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--botanical-deep)" />
            <stop offset="100%" stopColor="var(--botanical-primary)" />
          </linearGradient>
          <linearGradient id="upward-leaf-grad-1" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--botanical-deep)" />
            <stop offset="100%" stopColor="var(--botanical-rich)" />
          </linearGradient>
          <linearGradient id="upward-leaf-grad-2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--botanical-sage)" />
            <stop offset="100%" stopColor="var(--botanical-primary)" />
          </linearGradient>
        </defs>

        {/* Main ascending stem */}
        <path
          d="M10,300 Q35,190 95,110 T175,15"
          stroke="url(#upward-stem-grad)"
          strokeWidth="2.6"
          strokeLinecap="round"
        />

        {/* Side twig ascending */}
        <path
          d="M48,205 Q75,175 105,155"
          stroke="url(#upward-stem-grad)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Side twig upper */}
        <path
          d="M105,100 Q135,78 162,65"
          stroke="url(#upward-stem-grad)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />

        {/* Lower leaves */}
        <path d="M22,260 C40,248 58,260 56,276 C38,278 24,270 22,260 Z" fill="url(#upward-leaf-grad-1)" />
        <path d="M25,270 Q38,268 48,272" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" strokeLinecap="round" />

        <path d="M34,240 C52,228 68,238 66,254 C48,258 36,250 34,240 Z" fill="url(#upward-leaf-grad-2)" />
        <path d="M30,225 C24,208 38,195 54,200 C55,216 42,226 30,225 Z" fill="url(#upward-leaf-grad-1)" />
        <path d="M48,212 C66,200 84,210 82,226 C64,230 50,222 48,212 Z" fill="url(#upward-leaf-grad-2)" />

        {/* Twig 1 leaves */}
        <path d="M65,188 C82,176 98,186 96,202 C78,206 66,198 65,188 Z" fill="url(#upward-leaf-grad-1)" />
        <path d="M84,172 C100,160 116,170 114,186 C98,190 85,182 84,172 Z" fill="url(#upward-leaf-grad-2)" />
        <path d="M102,156 C118,142 134,152 132,168 C116,172 104,164 102,156 Z" fill="url(#upward-leaf-grad-1)" />

        {/* Mid-stem pairs */}
        <path d="M58,168 C78,154 98,164 96,182 C76,186 60,178 58,168 Z" fill="url(#upward-leaf-grad-1)" />
        <path d="M52,152 C44,134 58,120 74,124 C76,140 64,152 52,152 Z" fill="url(#upward-leaf-grad-2)" />
        <path d="M84,128 C104,114 124,124 122,142 C102,146 86,138 84,128 Z" fill="url(#upward-leaf-grad-1)" />
        <path d="M80,114 C74,96 88,82 104,86 C105,102 92,114 80,114 Z" fill="url(#upward-leaf-grad-2)" />

        {/* Twig 2 leaves */}
        <path d="M120,88 C136,75 152,84 150,100 C134,104 122,96 120,88 Z" fill="url(#upward-leaf-grad-1)" />
        <path d="M138,76 C154,62 170,72 168,88 C152,92 140,84 138,76 Z" fill="url(#upward-leaf-grad-2)" />
        <path d="M158,64 C174,50 190,60 188,76 C172,80 160,72 158,64 Z" fill="url(#upward-leaf-grad-1)" />

        {/* Upper stem & terminal leaves */}
        <path d="M110,82 C128,68 146,78 144,96 C126,100 112,92 110,82 Z" fill="url(#upward-leaf-grad-1)" />
        <path d="M126,58 C144,44 162,54 160,72 C142,76 128,68 126,58 Z" fill="url(#upward-leaf-grad-2)" />
        <path d="M142,38 C158,26 174,34 172,50 C156,54 144,46 142,38 Z" fill="url(#upward-leaf-grad-1)" />
        <path d="M158,22 C172,10 186,18 184,32 C170,36 160,28 158,22 Z" fill="url(#upward-leaf-grad-2)" />
        <path d="M170,14 C182,4 194,10 192,22 C182,24 172,18 170,14 Z" fill="var(--botanical-rich)" />
      </svg>
    );
  }

  if (variant === "spray-small") {
    // Lush 10-leaf spray for left-middle whitespace
    return (
      <svg
        viewBox="0 0 160 130"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("pointer-events-none transition-opacity", depthClass, className)}
        style={style}
        aria-hidden="true"
        {...props}
      >
        <defs>
          <linearGradient id="spray-leaf-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--botanical-rich)" />
            <stop offset="100%" stopColor="var(--botanical-deep)" />
          </linearGradient>
          <linearGradient id="spray-leaf-2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--botanical-primary)" />
            <stop offset="100%" stopColor="var(--botanical-sage)" />
          </linearGradient>
        </defs>

        {/* Main stem */}
        <path d="M10,115 Q60,80 125,25" stroke="var(--botanical-deep)" strokeWidth="2.2" strokeLinecap="round" />
        {/* Side shoot */}
        <path d="M50,85 Q80,72 105,62" stroke="var(--botanical-deep)" strokeWidth="1.6" strokeLinecap="round" />

        {/* Leaf 1 */}
        <path d="M30,95 C46,82 64,88 64,102 C48,108 34,104 30,95 Z" fill="url(#spray-leaf-1)" />
        {/* Leaf 2 */}
        <path d="M45,78 C40,62 54,50 68,56 C68,72 56,82 45,78 Z" fill="url(#spray-leaf-2)" />
        {/* Leaf 3 */}
        <path d="M60,68 C76,54 94,60 94,76 C78,82 64,76 60,68 Z" fill="url(#spray-leaf-1)" />
        {/* Leaf 4 (on shoot) */}
        <path d="M78,74 C94,62 108,68 108,82 C94,88 82,82 78,74 Z" fill="url(#spray-leaf-2)" />
        {/* Leaf 5 (on shoot tip) */}
        <path d="M98,62 C114,50 128,58 126,72 C112,76 102,70 98,62 Z" fill="url(#spray-leaf-1)" />

        {/* Leaf 6 */}
        <path d="M80,52 C74,36 88,26 102,32 C102,48 90,56 80,52 Z" fill="url(#spray-leaf-2)" />
        {/* Leaf 7 */}
        <path d="M92,42 C108,28 126,34 126,50 C110,56 96,50 92,42 Z" fill="url(#spray-leaf-1)" />
        {/* Leaf 8 */}
        <path d="M110,32 C106,16 120,6 132,14 C132,30 120,38 110,32 Z" fill="url(#spray-leaf-2)" />
        {/* Leaf 9 (terminal) */}
        <path d="M120,24 C138,10 154,18 152,34 C138,38 126,32 120,24 Z" fill="url(#spray-leaf-1)" />
        {/* Leaf 10 (delicate tip) */}
        <path d="M136,16 C148,6 158,12 156,22 C146,24 138,20 136,16 Z" fill="var(--botanical-rich)" />
      </svg>
    );
  }

  // foreground-cluster: Layered natural foliage cluster for depth around bottom of hero
  return (
    <svg
      viewBox="0 0 240 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("pointer-events-none transition-opacity", depthClass, className)}
      style={style}
      aria-hidden="true"
      {...props}
    >
      <defs>
        <linearGradient id="fore-leaf-1" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--botanical-deep)" />
          <stop offset="100%" stopColor="var(--botanical-rich)" />
        </linearGradient>
        <linearGradient id="fore-leaf-2" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--botanical-primary)" />
          <stop offset="100%" stopColor="var(--botanical-sage)" />
        </linearGradient>
      </defs>

      {/* Layer of 12 natural foliage leaves */}
      <path d="M15,165 C38,120 85,115 110,135 C88,162 45,172 15,165 Z" fill="url(#fore-leaf-1)" />
      <path d="M50,150 C72,108 120,112 142,136 C118,160 76,164 50,150 Z" fill="url(#fore-leaf-2)" />
      <path d="M85,135 C115,92 165,96 186,122 C158,148 112,152 85,135 Z" fill="url(#fore-leaf-1)" />
      <path d="M120,115 C148,72 195,80 215,108 C185,132 144,132 120,115 Z" fill="url(#fore-leaf-2)" />

      {/* Upper subtle leaves */}
      <path d="M40,125 C62,85 106,90 125,112 C104,134 65,138 40,125 Z" fill="url(#fore-leaf-2)" />
      <path d="M95,100 C122,60 168,68 188,94 C162,118 120,120 95,100 Z" fill="url(#fore-leaf-1)" />
      <path d="M145,85 C170,45 212,55 228,82 C204,104 168,102 145,85 Z" fill="url(#fore-leaf-2)" />
      <path d="M175,65 C198,30 234,40 244,64 C224,82 194,80 175,65 Z" fill="url(#fore-leaf-1)" />
    </svg>
  );
}
