import Image from "next/image";
import { CheckCircle2, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

export interface HeroProfile {
  name: string;
  age: number;
  profession: string;
  location: string;
  image: string;
  matchScore?: string;
  verified?: boolean;
  highlight?: string;
}

export interface HeroProfileCardProps {
  profile: HeroProfile;
  animationVariant?: "float-1" | "float-2" | "none";
  className?: string;
}

export function HeroProfileCard({
  profile,
  animationVariant = "none",
  className = "",
}: HeroProfileCardProps) {
  const animationClass =
    animationVariant === "float-1"
      ? "animate-float-1"
      : animationVariant === "float-2"
      ? "animate-float-2"
      : "";

  return (
    <Card
      className={cn(
        "flex items-center gap-3.5 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 p-3 sm:p-3.5 shadow-[0_16px_36px_var(--card-shadow)] backdrop-blur-md transition-shadow hover:shadow-[0_20px_45px_var(--hero-shadow)]",
        animationClass,
        className
      )}
    >
      <div className="relative shrink-0">
        <div className="relative h-12 w-12 sm:h-13 sm:w-13 overflow-hidden rounded-full ring-2 ring-[var(--primary-light)]">
          <Image
            src={profile.image}
            alt={`${profile.name}, ${profile.age} years old, ${profile.profession}`}
            width={56}
            height={56}
            className="h-full w-full object-cover"
          />
        </div>
        {profile.verified && (
          <span
            className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--surface)] text-[var(--primary)] ring-1 ring-[var(--border)]"
            title="Verified Profile"
            aria-label="Verified Profile"
          >
            <CheckCircle2 className="h-3.5 w-3.5 fill-[var(--primary-light)]" aria-hidden="true" />
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold text-[var(--foreground)]">
            {profile.name}, {profile.age}
          </p>
          {profile.matchScore && (
            <Badge tone="success" className="shrink-0 text-[10px] font-semibold px-2 py-0.5">
              <Heart className="mr-1 h-2.5 w-2.5 fill-current inline" aria-hidden="true" />
              {profile.matchScore}
            </Badge>
          )}
        </div>
        <p className="truncate text-xs text-[var(--muted)]">
          {profile.profession}
        </p>
        <p className="truncate text-[11px] text-[var(--subtle-foreground)]">
          {profile.location}
        </p>
      </div>
    </Card>
  );
}
