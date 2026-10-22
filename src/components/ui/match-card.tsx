"use client";

import React from "react";
import Link from "next/link";
import { IconHeart, IconMapPin, IconCircleCheck, IconMessageCircle, IconUsers } from '@tabler/icons-react';
import { Avatar } from "./avatar";
import { Badge } from "./badge";
import { Button } from "./button";
import { Card } from "./card";
import { cn } from "@/lib/cn";

export interface MatchData {
  id: string;
  name: string;
  age: number;
  city: string;
  profession: string;
  education?: string;
  image?: string;
  compatibility?: number;
  verified?: boolean;
  online?: boolean;
  commonInterests?: string[];
}

export interface MatchCardProps {
  match: MatchData;
  onConnect?: (id: string) => void;
  onShortlist?: (id: string) => void;
  isShortlisted?: boolean;
  className?: string;
}

export function MatchCard({
  match,
  onConnect,
  onShortlist,
  isShortlisted = false,
  className,
}: MatchCardProps) {
  return (
    <Card
      variant="interactive"
      className={cn(
        "group relative overflow-hidden rounded-2xl border-[var(--border)] p-4 sm:p-5",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <Link href={`/app/profile?user=${match.id}`} className="shrink-0 focus-ring rounded-full">
          <Avatar
            src={match.image}
            name={match.name}
            size="lg"
            online={match.online}
            verified={match.verified}
            bordered
          />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <Link
              href={`/app/profile?user=${match.id}`}
              className="truncate font-editorial-title text-base sm:text-lg font-bold text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
            >
              {match.name}, {match.age}
            </Link>

            {match.compatibility && (
              <Badge tone="accent" size="sm" icon={<IconUsers className="h-2.5 w-2.5" />}>
                {match.compatibility}% Match
              </Badge>
            )}
          </div>

          <p className="mt-1 flex items-center gap-1.5 text-xs">
            <IconMapPin className="h-3.5 w-3.5 shrink-0 text-[#B87A28]" />
            <span className="truncate text-[#8F591E] font-semibold">{match.city}</span>
            {match.profession && (
              <>
                <span className="text-[var(--muted)]/40">·</span>
                <span className="text-[var(--foreground)] font-semibold truncate">{match.profession}</span>
              </>
            )}
          </p>

          {match.commonInterests && match.commonInterests.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1">
              {match.commonInterests.slice(0, 2).map((item) => (
                <span
                  key={item}
                  className="rounded-md bg-[var(--surface-muted)] px-2 py-0.5 text-[10px] font-medium text-[var(--muted-strong)]"
                >
                  {item}
                </span>
              ))}
              {match.commonInterests.length > 2 && (
                <span className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] text-[var(--muted)]">
                  +{match.commonInterests.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-[var(--border)] pt-3.5">
        <Link href={`/app/profile?user=${match.id}`} className="flex-1 focus-ring">
          <Button variant="secondary" size="sm" className="w-full text-xs font-semibold">
            View Profile
          </Button>
        </Link>

        {onConnect && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onConnect(match.id)}
            className="flex-1 text-xs font-bold"
          >
            Connect
          </Button>
        )}

        {onShortlist && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onShortlist(match.id)}
            className={cn(
              "hover:text-[var(--primary)] hover:bg-[var(--primary-light)]/40 transition-colors",
              isShortlisted && "text-[var(--primary)]"
            )}
            aria-label={isShortlisted ? "Remove from shortlist" : "Add to shortlist"}
          >
            <IconHeart
              className={cn("h-4 w-4", isShortlisted && "fill-[var(--primary)] text-[var(--primary)]")}
            />
          </Button>
        )}
      </div>
    </Card>
  );
}
