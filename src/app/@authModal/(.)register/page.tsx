import { SignUp } from "~/components";
import { Dialog, DialogContent } from "~/components/ui/dialog";

export default function Register() {
  return (
    <Dialog defaultOpen>
      <DialogContent>
        <div className="relative h-fit w-full rounded-lg px-2 py-20">
          <SignUp />
        </div>
      </DialogContent>
    </Dialog>
  );
}
