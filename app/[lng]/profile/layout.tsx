"use client";

import { useState } from "react";
import { ChildProps } from "@/types";
import Navbar from "../_components/navbar";
import Sidebar from "../_components/sidebar";
import { profileMenuItems } from "@/constants";

function Layout({ children }: ChildProps) {
  // 1. Statelni umumiy ota-onaga ko'tardik
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex w-full min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      {/* 2. Navbar'ga state va uni o'zgartiruvchi funksiyani beramiz */}
      <Navbar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="flex flex-1 w-full relative">
        {/* 3. Sidebar'ga state va uni o'zgartiruvchi funksiyani beramiz */}
        <Sidebar
          navItems={profileMenuItems}
          title="Profile"
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        />

        <main className="flex-1 flex flex-col w-full pl-72 max-md:pl-0 transition-all duration-300">
          <div className="w-full h-full p-6 md:p-10">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default Layout;
