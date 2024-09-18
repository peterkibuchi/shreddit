"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

import { Icons } from "~/components/icons";
import { Button } from "~/components/ui/button";
import { useToast } from "~/components/ui/use-toast";
import { cn } from "~/lib/utils";

type UserAuthFormProps = React.HTMLAttributes<HTMLDivElement>;

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loginWithGitHub = async () => {
    setIsLoading(true);

    try {
      await signIn("github");
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "There was an error logging in with GitHub",
        variant: "destructive",
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
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onClick={loginWithGitHub}
      >
        {isLoading ? null : <Icons.gitHub className="mr-2 h-4 w-4" />}
        Proceed with GitHub
      </Button>
    </div>
  );
}
