"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

import { Icons } from "~/components/icons";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

type UserAuthFormProps = React.HTMLAttributes<HTMLDivElement>;

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loginWithGitHub = async () => {
    setIsLoading(true);

    try {
      await signIn("github");
    } catch (error) {
      console.error(error);
      toast.error("Error", {
        description: "There was an error logging in with GitHub",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex justify-center", className)} {...props}>
      <Button
        className="w-full"
        type="button"
        size="sm"
        disabled={isLoading}
        isLoading={isLoading}

        onClick={loginWithGitHub}
      >
        {isLoading ? null : <Icons.gitHub className="mr-2 h-4 w-4" />}
        Proceed with GitHub
      </Button>
    </div>
  );
}
