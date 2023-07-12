"use client";

import { useRouter } from "next/navigation";

import { Dialog, DialogContent } from "~/components/ui/dialog";

interface RootLayoutProps {
  children: React.ReactNode;
}

export function DialogWrapper({ children }: RootLayoutProps) {
  const router = useRouter();

  return (
    <Dialog defaultOpen onOpenChange={() => router.back()}>
      <DialogContent>{children}</DialogContent>
    </Dialog>
  );
}
