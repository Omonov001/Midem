"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

interface Props {
  one: string;
  two: string;
  three: string;
  className?: string;
  onSelect?: (filter: "all" | "newest" | "oldest") => void;
}

function FillterCards({ one, two, three, className, onSelect }: Props) {
  const [selected, setSelected] = useState<"all" | "newest" | "oldest">("all");

  const buttons = [
    { text: one, value: "all" as const },
    { text: two, value: "newest" as const },
    { text: three, value: "oldest" as const },
  ];

  const handleSelect = (value: "all" | "newest" | "oldest") => {
    setSelected(value);
    onSelect?.(value);
  };

  return (
    <div
      className={cn(
        className,
        "flex h-auto w-full flex-wrap items-center justify-center gap-2 md:justify-end",
      )}
    >
      {buttons.map((button) => {
        const isActive = selected === button.value;

        return (
          <Button
            key={button.value}
            onClick={() => handleSelect(button.value)}
            className={cn(
              "cursor-pointer rounded-xl border-2 px-5 py-2 font-bold transition-all active:scale-95",
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
  );
}

export default FillterCards;
