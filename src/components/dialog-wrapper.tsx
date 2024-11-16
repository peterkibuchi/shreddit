"use client";

import { useRouter } from "next/navigation";

import { Dialog, DialogContent } from "~/components/ui/dialog";

interface DialogWrapperProps {
  children: React.ReactNode;
}

export function DialogWrapper({ children }: DialogWrapperProps) {
  const router = useRouter();

  return (
    <Dialog defaultOpen onOpenChange={() => router.back()}>
      <DialogContent>{children}</DialogContent>
    </Dialog>
  );
}
