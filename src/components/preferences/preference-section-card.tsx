'use client';

import React from 'react';
import { IconEdit, IconCheck, IconChevronRight } from '@tabler/icons-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';

interface PreferenceSectionCardProps {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  preview: React.ReactNode;
  onEdit: () => void;
  className?: string;
  chips?: string[];
  statusText?: string;
}

export function PreferenceSectionCard({
  id,
  icon,
  title,
  subtitle,
  preview,
  onEdit,
  className,
  chips,
  statusText,
}: PreferenceSectionCardProps) {
  return (
    <Card
      onClick={onEdit}
      className={cn(
        'group relative overflow-hidden rounded-3xl border border-[#E9DDE0] bg-white p-5 sm:p-6 transition-all duration-200 hover:border-[#7A1835]/40 hover:shadow-md cursor-pointer',
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left Icon & Heading */}
        <div className="flex items-start gap-3.5">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#FAF3EC] text-[#7A1835] border border-[#EAD8C7] group-hover:scale-105 group-hover:bg-[#7A1835] group-hover:text-white transition-all duration-300">
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-editorial-title text-base sm:text-lg font-bold text-[#211B1E] group-hover:text-[#7A1835] transition-colors">
                {title}
              </h3>
              {statusText && (
                <span className="text-[10px] font-bold text-[#7A1835] bg-[#FAF3EC] px-2 py-0.5 rounded-full border border-[#EAD8C7]">
                  {statusText}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-[#766B6F] leading-relaxed">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Edit Button */}
        <div className="shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="rounded-xl text-xs font-bold text-[#7A1835] hover:bg-[#FAF3EC] hover:text-[#5C1027] h-8 px-2.5 sm:px-3 gap-1.5"
          >
            <IconEdit className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Edit</span>
          </Button>
        </div>
      </div>

      {/* Main Preview Content */}
      <div className="mt-4 pt-4 border-t border-[#E9DDE0]/70">
        {preview}

        {/* Chips list if provided */}
        {chips && chips.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {chips.map((chip, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 rounded-xl bg-[#FFF9F6] border border-[#E9DDE0] px-2.5 py-1 text-xs font-semibold text-[#211B1E] group-hover:border-[#7A1835]/20 transition-colors"
              >
                <IconCheck className="h-3 w-3 text-[#7A1835]" />
                {chip}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Subtle indicator bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#7A1835]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </Card>
  );
}
