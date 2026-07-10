"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";
import { UsernameValidator } from "~/lib/validators/username";
import { type User } from "~/server/db/schema";

type FormData = z.infer<typeof UsernameValidator>;

interface UsernameFormProps extends React.HTMLAttributes<HTMLFormElement> {
  user: Pick<User, "id" | "username">;
}

export function UsernameForm({ user, className, ...props }: UsernameFormProps) {
  const router = useRouter();
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(UsernameValidator),
    defaultValues: {
      name: user?.username ?? "",
    },
  });

  const { mutate: updateUsername, isPending: isLoading } = useMutation({
    mutationFn: async ({ name }: FormData) => {
      const payload: FormData = { name };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { data } = await axios.patch("/api/username", payload);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return data;
    },

    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 409) {
          return toast.error("Username already taken.", {
            description: "Please choose another username.",
          });
        }
      }

      return toast.error("Something went wrong.", {
        description: "Your username was not updated. Please try again.",
      });
    },

    onSuccess: () => {
      toast.success("Your username has been updated.");
      router.refresh();
    },
  });

  return (
    <form
      className={cn(className)}

      onSubmit={handleSubmit((e) => updateUsername(e))}
      {...props}
    >
      <Card>
        <CardHeader>
          <CardTitle>Your username</CardTitle>
          <CardDescription>
            Please enter a display name you are comfortable with.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="relative grid gap-1">
            <div className="absolute top-0 left-0 grid h-10 w-8 place-items-center">
              <span className="text-sm text-zinc-500">u/</span>
            </div>

            <Label className="sr-only" htmlFor="name">
              Username
            </Label>
            <Input
              id="name"
              className="w-[300px] pl-6"
              size={32}
              {...register("name")}
            />

            {errors?.name && (
              <p className="px-1 text-xs text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <Button isLoading={isLoading}>Change username</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
