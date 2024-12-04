"use client";

// This component displays a toast notification when draft mode is enabled.
// It provides an action to disable draft mode and refresh the page to reflect live content.

import {
  useDraftModeEnvironment,
  useIsPresentationTool,
} from "next-sanity/hooks";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { toast } from "sonner";
import { disableDraftMode } from "@/app/actions";

export default function DraftModeToast() {
  // Check if we're in the Presentation Tool or draft mode environment
  const isPresentationTool = useIsPresentationTool();
  const env = useDraftModeEnvironment();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (isPresentationTool === false) {
      /**
       * Display a persistent toast notification when draft mode is enabled.
       * The toast includes an action button to disable draft mode.
       */
      const toastId = toast("Draft Mode Enabled", {
        description:
          env === "live"
            ? "Content is live, refreshing automatically"
            : "Refresh manually to see changes",
        duration: Infinity,
        action: {
          label: "Disable",
          onClick: () => {
            // Disable draft mode and refresh the page
            disableDraftMode().then(() => {
              startTransition(() => {
                router.refresh();
              });
            });
          },
        },
      });

      // Cleanup the toast notification when the component unmounts
      return () => {
        toast.dismiss(toastId);
      };
    }
  }, [env, router, isPresentationTool]);

  useEffect(() => {
    if (pending) {
      // Show a loading toast while the page refresh is in progress
      const toastId = toast.loading("Disabling draft mode...");
      return () => {
        toast.dismiss(toastId);
      };
    }
  }, [pending]);

  return null; // This component doesn't render any visible UI
}
