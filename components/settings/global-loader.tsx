"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface GlobalLoaderProps {
  text: string;
}

export default function GlobalLoader({ text }: GlobalLoaderProps) {
  /*
   * MUHIM:
   *
   * Birinchi render doim false.
   *
   * Shuning uchun Server HTML
   * va Client HTML 100% bir xil bo'ladi.
   */
  const [isLowPower, setIsLowPower] = useState(false);

  useEffect(() => {
    const connection = (
      navigator as Navigator & {
        connection?: {
          saveData?: boolean;
          effectiveType?: string;
        };
      }
    ).connection;

    const memory = (
      navigator as Navigator & {
        deviceMemory?: number;
      }
    ).deviceMemory;

    const cores = navigator.hardwareConcurrency || 8;

    const isSlowConnection =
      connection?.saveData === true ||
      connection?.effectiveType === "slow-2g" ||
      connection?.effectiveType === "2g";

    const isLowMemory = typeof memory === "number" && memory <= 4;

    const isLowCpu = cores <= 4;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    const lowPower =
      isSlowConnection || isLowMemory || isLowCpu || (isMobile && cores <= 6);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLowPower(lowPower);
  }, []);

  /*
   * Faqat browser mount bo'lgandan keyin
   * true bo'lishi mumkin.
   */
  const reduced = isLowPower;

  return (
    <div className="fixed inset-0 flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* ================================================= */}
      {/* BACKGROUND */}
      {/* ================================================= */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* MAIN GLOW */}

        {reduced ? (
          <div className="absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500 opacity-[0.05] blur-[90px]" />
        ) : (
          <motion.div
            animate={{
              scale: [1, 1.12, 1],
              opacity: [0.04, 0.1, 0.04],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500 blur-[150px]"
          />
        )}

        {/* SECONDARY GLOW */}

        {reduced ? (
          <div className="absolute left-[10%] top-[10%] h-[200px] w-[200px] rounded-full bg-indigo-500 opacity-[0.025] blur-[80px]" />
        ) : (
          <motion.div
            animate={{
              x: [-40, 40, -40],
              y: [-20, 30, -20],
              opacity: [0.02, 0.06, 0.02],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute left-[10%] top-[10%] h-[280px] w-[280px] rounded-full bg-indigo-500 blur-[130px]"
          />
        )}

        {/* THIRD GLOW */}

        {reduced ? (
          <div className="absolute bottom-[10%] right-[10%] h-[220px] w-[220px] rounded-full bg-purple-500 opacity-[0.025] blur-[80px]" />
        ) : (
          <motion.div
            animate={{
              x: [40, -30, 40],
              y: [20, -30, 20],
              opacity: [0.02, 0.06, 0.02],
            }}
            transition={{
              duration: 5.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute bottom-[10%] right-[10%] h-[300px] w-[300px] rounded-full bg-purple-500 blur-[140px]"
          />
        )}

        {/* GRID */}

        <div className="absolute inset-0 opacity-[0.025] [background-image:linear-gradient(to_right,#64748b_1px,transparent_1px),linear-gradient(to_bottom,#64748b_1px,transparent_1px)] [background-size:55px_55px]" />
      </div>

      {/* ================================================= */}
      {/* CONTENT */}
      {/* ================================================= */}

      <div className="relative z-10 flex flex-col items-center">
        {/* LOGO */}

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.75,
            y: 10,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          transition={{
            duration: 0.55,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative"
        >
          {/* LOGO GLOW */}

          {reduced ? (
            <div className="absolute inset-0 rounded-[1.35rem] bg-blue-500 opacity-20 blur-xl" />
          ) : (
            <motion.div
              animate={{
                opacity: [0.2, 0.6, 0.2],
                scale: [0.9, 1.15, 0.9],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 rounded-[1.35rem] bg-blue-500 blur-2xl"
            />
          )}

          {/* ROTATING RING */}

          {reduced ? (
            <div className="absolute -inset-2 rounded-[1.45rem] border border-blue-500/20" />
          ) : (
            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute -inset-2 rounded-[1.45rem] border border-blue-500/20 border-t-blue-500/70"
            />
          )}

          {/* LOGO */}

          <motion.div
            animate={
              reduced
                ? undefined
                : {
                    scale: [1, 1.045, 1],
                  }
            }
            transition={{
              duration: 1.6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative h-20 w-20 overflow-hidden rounded-[1.25rem] border border-white/10 bg-white shadow-2xl shadow-blue-500/20 dark:bg-slate-900"
          >
            <img
              src="/MI.jpg"
              alt="MIDEM"
              className="h-full w-full object-cover"
            />
          </motion.div>
        </motion.div>

        {/* MIDEM */}

        <motion.h1
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.15,
            duration: 0.45,
          }}
          className="mt-6 text-2xl font-black tracking-[-0.04em] text-slate-950 dark:text-white"
        >
          MIDEM
        </motion.h1>

        {/* PLATFORM */}

        <motion.div
          initial={{
            opacity: 0,
            y: 5,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.25,
            duration: 0.45,
          }}
          className="mt-1 text-[10px] font-bold uppercase tracking-[0.3em] text-blue-500"
        >
          GAME PLATFORM
        </motion.div>

        {/* PROGRESS */}

        <div className="mt-7 h-1 w-36 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          {reduced ? (
            <div className="h-full w-1/2 translate-x-[50%] rounded-full bg-blue-500 opacity-80" />
          ) : (
            <motion.div
              animate={{
                x: ["-120%", "280%"],
              }}
              transition={{
                duration: 1.15,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="h-full w-1/2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/40"
            />
          )}
        </div>

        {/* TEXT */}

        <motion.p
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.4,
            duration: 0.4,
          }}
          className="mt-4 text-xs font-medium text-slate-500 dark:text-slate-400"
        >
          {text}
        </motion.p>

        {/* DOTS */}

        <div className="mt-3 flex items-center gap-1.5">
          {[0, 1, 2].map((index) =>
            reduced ? (
              <span
                key={index}
                className="h-1.5 w-1.5 rounded-full bg-blue-500 opacity-70"
              />
            ) : (
              <motion.span
                key={index}
                animate={{
                  opacity: [0.25, 1, 0.25],
                  scale: [0.85, 1, 0.85],
                }}
                transition={{
                  duration: 1.1,
                  repeat: Infinity,
                  delay: index * 0.18,
                  ease: "easeInOut",
                }}
                className="h-1.5 w-1.5 rounded-full bg-blue-500"
              />
            ),
          )}
        </div>
      </div>
    </div>
  );
}
