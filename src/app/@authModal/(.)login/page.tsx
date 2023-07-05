import { SignIn } from "~/components";
import { Dialog, DialogContent } from "~/components/ui/dialog";

export default function Login() {
  return (
    <Dialog defaultOpen>
      <DialogContent>
        <div className="relative h-fit w-full rounded-lg px-2 py-20">
          <SignIn />
        </div>
      </DialogContent>
    </Dialog>
  );
}
