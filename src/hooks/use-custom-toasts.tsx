import Link from "next/link";

import { buttonVariants } from "~/components/ui/button";
import { toast } from "~/components/ui/use-toast";

export const useCustomToasts = () => {
  const loginToast = () => {
    const { dismiss } = toast({
      title: "Login required.",
      description: "You need to be logged in to perform this action.",
      variant: "default",
      action: (
        <Link
          onClick={() => dismiss()}
          href="/login"
          className={buttonVariants()}
        >
          Login
        </Link>
      ),
    });
  };

  return { loginToast };
};
