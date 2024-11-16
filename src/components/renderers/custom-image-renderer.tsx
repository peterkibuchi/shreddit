"use client";

import Image from "next/image";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CustomImageRenderer({ data }: any) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const src = data.file.url;

  return (
    <div className="relative min-h-[15rem] w-full">
      <Image
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        src={src}
        alt="post-image"
        className="object-contain"
        fill
      />
    </div>
  );
}
