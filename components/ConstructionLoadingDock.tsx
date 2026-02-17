"use client";
 
import { motion, AnimatePresence } from "framer-motion";
import {
  IconMapPin,
  IconClock,
  IconCash,
  IconFileText,
  IconAlertTriangle,
} from "@tabler/icons-react";
 
type Props = {
  activeStep: number;
  status: "loading" | "failed";
};
 
const STEPS = [
  { label: "Location", icon: IconMapPin },
  { label: "Timeline", icon: IconClock },
  { label: "Budget", icon: IconCash },
  { label: "Documents", icon: IconFileText },
];
 
const STATUS_MAP: Record<string, string> = {
  Location: "Validating site coordinates",
  Timeline: "Calculating project duration",
  Budget: "Running cost analysis",
  Documents: "Verifying compliance files",
};
 
export default function ConstructionLoadingDock({
  activeStep,
  status,
}: Props) {
  const StepIcon = STEPS[activeStep]?.icon;
  const stepLabel = STEPS[activeStep]?.label;
  const isFailed = status === "failed";
 
  return (
    <div className="flex flex-col items-center py-16">
      {/* Icon Area */}
      <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden">
 
        {/* ROTATING RING → ONLY WHEN LOADING */}
        {!isFailed && (
          <motion.div
            className="absolute inset-2 rounded-full border border-dashed border-neutral-300"
            animate={{ rotate: 360 }}
            transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
          />
        )}
 
        {/* SCAN PULSE → ONLY WHEN LOADING */}
        {!isFailed && (
          <motion.div
            className="absolute inset-0"
            animate={{ opacity: [0.08, 0.18, 0.08] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
          </motion.div>
        )}
 
        {/* ICON */}
        <AnimatePresence mode="wait">
          <motion.div
            key={status + activeStep}
            className={`relative z-10 ${
              isFailed
                ? "text-red-500 drop-shadow-[0_6px_12px_rgba(239,68,68,0.35)]"
                : "text-blue-600 drop-shadow-[0_6px_12px_rgba(37,99,235,0.35)]"
            }`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={
              isFailed
                ? { opacity: 1, x: [-4, 4, -4, 4, 0] } // error shake
                : { opacity: 1, scale: 1 }
            }
            exit={{ opacity: 0 }}
            transition={{
              duration: isFailed ? 0.45 : 0.4,
              ease: "easeInOut",
            }}
          >
            {isFailed ? (
              <IconAlertTriangle size={28} strokeWidth={1.6} />
            ) : (
              <StepIcon size={28} strokeWidth={1.6} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
 
      {/* STATUS LOG */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={status + stepLabel}
          className={`mt-6 text-xs tracking-wide ${
            isFailed ? "text-red-500" : "text-neutral-500"
          }`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {isFailed
            ? `Failed while processing ${stepLabel}.`
            : `${STATUS_MAP[stepLabel]}…`}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
 
 