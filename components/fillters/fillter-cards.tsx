"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

interface Props {
  one: string;
  two: string;
  three: string;
  four: string;
  className?: string;
  onSelect?: (filterText: string) => void;
}

function FillterCards({ one, two, three, four, className, onSelect }: Props) {
  const [selected, setSelected] = useState<string>(one);

  const handleSelect = (text: string) => {
    setSelected(text);
    if (onSelect) {
      onSelect(text);
    }
  };

  const buttons = [one, two, three, four];

  return (
    <div
      className={cn(
        className,
        "w-full h-auto gap-2 flex items-center justify-center md:justify-end-safe flex-wrap",
      )}
    >
      {buttons.map((btnText, index) => {
        const isActive = selected === btnText;
        return (
          <Button
            key={index}
            onClick={() => handleSelect(btnText)}
            className={cn(
              "cursor-pointer border-2 transition-all font-bold px-5 py-2 rounded-xl active:scale-95",
              isActive
                ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/30"
                : "border-blue-600 bg-transparent text-blue-600 hover:bg-blue-600/10",
            )}
          >
            {btnText}
          </Button>
        );
      })}
    </div>
  );
}

export default FillterCards;
