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

const WELCOME_KEY = "SLICE_FOR_X:WELCOME";

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
              src="https://pub-8028c1a0b1664149b66de14c14aee4ef.r2.dev/uploads/202610/88a4f93e-6be4-47b5-9d70-3546fb7c21e3.webp"
              alt=""
              className="max-h-[min(520px,60vh)] w-full rounded-panel object-contain"
            />
          </DialogPopup>
        </DialogViewport>
      </DialogPortal>
    </DialogRoot>
  );
}
