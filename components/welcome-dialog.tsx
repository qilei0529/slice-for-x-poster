"use client";

import { useEffect, useState } from "react";
import {
  DialogBackdrop,
  DialogHead,
  DialogPopup,
  DialogPortal,
  DialogRoot,
  DialogViewport,
} from "@/components/ui/dialog";

const WELCOME_KEY = "slice-for-x:welcome";

export function WelcomeDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(WELCOME_KEY) == null) setOpen(true);
  }, []);

  function onOpenChange(next: boolean) {
    if (!next) localStorage.setItem(WELCOME_KEY, "1");
    setOpen(next);
  }

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogBackdrop />
        <DialogViewport>
          <DialogPopup>
            <DialogHead
              title="Slice for X"
              description="Slice one picture into portrait tiles for an X post."
              showClose
            />
            <img
              src="/welcome.png"
              alt=""
              className="max-h-[min(420px,50vh)] w-full rounded-panel object-contain"
            />
          </DialogPopup>
        </DialogViewport>
      </DialogPortal>
    </DialogRoot>
  );
}
