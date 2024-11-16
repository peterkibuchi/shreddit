import { DialogWrapper, SignUp } from "~/components";

export default function Register() {
  return (
    <DialogWrapper>
      <div className="relative h-fit w-full rounded-lg px-2 py-20">
        <SignUp />
      </div>
    </DialogWrapper>
  );
}
