"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

export type PlatformFilter = "all" | "windows" | "android" | "ios";
export type SortFilter = "all" | "newest" | "oldest";

interface Props {
  one?: string;
  two?: string;
  three?: string;
  four?: string;

  newest?: string;
  oldest?: string;

  className?: string;

  onPlatformSelect?: (filter: PlatformFilter) => void;
  onSortSelect?: (filter: SortFilter) => void;
}

function FillterData({
  one,
  two,
  three,
  four,
  newest = "Yangilar",
  oldest = "Eskilar",
  className,
  onPlatformSelect,
  onSortSelect,
}: Props) {
  const [selectedPlatform, setSelectedPlatform] =
    useState<PlatformFilter>("all");

  const [selectedSort, setSelectedSort] = useState<SortFilter>("all");

  const platformButtons: {
    text: string;
    value: PlatformFilter;
  }[] = [
    ...(one ? [{ text: one, value: "all" as const }] : []),
    ...(two
      ? [
          {
            text: two,
            value: "windows" as const,
          },
        ]
      : []),
    ...(three
      ? [
          {
            text: three,
            value: "android" as const,
          },
        ]
      : []),
    ...(four
      ? [
          {
            text: four,
            value: "ios" as const,
          },
        ]
      : []),
  ];

  const sortButtons: {
    text: string;
    value: SortFilter;
  }[] = [
    {
      text: "Barchasi",
      value: "all",
    },
    {
      text: newest,
      value: "newest",
    },
    {
      text: oldest,
      value: "oldest",
    },
  ];

  const handlePlatformSelect = (value: PlatformFilter) => {
    setSelectedPlatform(value);
    onPlatformSelect?.(value);
  };

  const handleSortSelect = (value: SortFilter) => {
    setSelectedSort(value);
    onSortSelect?.(value);
  };

  return (
    <div
      className={cn(
        className,
        "flex w-full flex-wrap items-center justify-center gap-2 md:justify-end",
      )}
    >
      {/* PLATFORM FILTERS */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {platformButtons.map((button) => {
          const isActive = selectedPlatform === button.value;

          return (
            <Button
              key={button.value}
              type="button"
              onClick={() => handlePlatformSelect(button.value)}
              className={cn(
                "cursor-pointer rounded-xl border-2 px-4 py-2 font-bold transition-all duration-200 active:scale-95",
                isActive
                  ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "border-blue-600 bg-transparent text-blue-600 hover:bg-blue-600/10",
              )}
            >
              {button.text}
            </Button>
          );
        })}
      </div>

      {/* SORT FILTERS */}
      <div
        className={cn(
          "h-6 w-px mx-1 hidden sm:block",
          "bg-slate-300 dark:bg-white/10",
        )}
      />

      <div className="flex flex-wrap items-center justify-center gap-2">
        {sortButtons.map((button) => {
          const isActive = selectedSort === button.value;

          return (
            <Button
              key={button.value}
              type="button"
              onClick={() => handleSortSelect(button.value)}
              className={cn(
                "cursor-pointer rounded-xl border-2 px-4 py-2 font-bold transition-all duration-200 active:scale-95",
                isActive
                  ? "border-purple-600 bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                  : "border-purple-600 bg-transparent text-purple-600 hover:bg-purple-600/10",
              )}
            >
              {button.text}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

export default FillterData;
