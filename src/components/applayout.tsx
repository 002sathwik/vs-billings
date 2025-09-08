"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "./ui/sidebar";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "~/lib/utils";
import { CreditCard, LayoutDashboard } from "lucide-react";

interface SidebarDemoProps {
  children: React.ReactNode;
}

export function SidebarDemo({ children }: SidebarDemoProps) {
  const links = [
    {
      label: "home",
      href: "/",
      icon: (
        <LayoutDashboard className="text-white dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },

  ];
  const [open, setOpen] = useState(false);
  return (
    <div
      className={cn(
        "rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 max-w-full mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden",
        "h-screen"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10 bg-neutral-900">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2 font-sora text-white ">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
        </SidebarBody>
      </Sidebar>

      <div className="flex-1 overflow-y-auto">
        {/* Ensure children are scrollable with a defined height */}
        <div className="h-full overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

export const Logo = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-grotesk font-bold">
        VP
      </div>       <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-white whitespace-pre font-grotesk "
      >
        VISHNU PRINTERS
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-white py-1 relative z-20"
    >
      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-grotesk font-bold">
        VP
      </div>
    </Link>
  );
};
