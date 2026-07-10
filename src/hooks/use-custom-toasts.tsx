import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useCustomToasts = () => {
  const router = useRouter();

  const loginToast = () => {
    toast("Login required.", {
      description: "You need to be logged in to perform this action.",
      action: {
        label: "Login",
        onClick: () => router.push("/login"),
      },
    });
  };

  return { loginToast };
};
