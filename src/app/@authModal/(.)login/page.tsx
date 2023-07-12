import { DialogWrapper, SignIn } from "~/components";

export default function Login() {
  return (
    <DialogWrapper>
      <div className="relative h-fit w-full rounded-lg px-2 py-20">
        <SignIn />
      </div>
    </DialogWrapper>
  );
}
