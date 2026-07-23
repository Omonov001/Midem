"use client";

import { useState } from "react"; // 1. useState'ni import qildik
import { ChildProps } from "@/types";
import Navbar from "../_components/navbar";
import Sidebar from "../_components/sidebar";
import { developerMenuItems } from "@/constants";

function Layout({ children }: ChildProps) {
  // 2. Mobil menyu holati uchun state yaratdik
  const [isOpen, setIsOpen] = useState(false);

  return (
    // min-h-screen - ekranni kamida 100% balandlikda ushlaydi
    <div className="flex w-full min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      {/* 3. Navbar'ga proplarni berdik */}
      <Navbar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="flex flex-1 w-full relative">
        {/* 4. Sidebar'ga proplarni berdik */}
        <Sidebar
          navItems={developerMenuItems}
          title="Profile"
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        />

        {/* Children qismi */}
        <main className="flex-1 flex flex-col w-full pl-72 max-md:pl-0 transition-all duration-300">
          {/* flex-1: Ortiqcha joyni to'liq egallaydi
            p-4 yoki p-6: Kontent devorga yopishib qolmasligi uchun padding
          */}
          <div className="w-full h-full p-6 md:p-10">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default Layout;
