import { CloseModal, SignUp } from "~/components";

export default function Register() {
  return (
    <div className="fixed inset-0 z-10">
      <div className="container mx-auto flex h-full max-w-lg items-center">
        <div className="relative h-fit w-full rounded-lg bg-secondary px-2 py-20">
          <div className="absolute right-4 top-4">
            <CloseModal />
          </div>

          <SignUp />
        </div>
      </div>
    </div>
  );
}
