import { redirect } from "next/navigation";

import { Icons } from "~/components";
import { Button } from "~/components/ui/button";

export function CloseModal() {
  return (
    <Button
      variant="ghost"
      className="h-6 w-6 rounded-md p-0"
      // onClick={() => redirect("/")}
    >
      <Icons.close aria-label="close modal" className="h-4 w-4" />
    </Button>
  );
}
