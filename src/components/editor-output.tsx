"use client";

import dynamic from "next/dynamic";

import { CustomCodeRenderer } from "~/components/renderers/custom-code-renderer";
import { CustomImageRenderer } from "~/components/renderers/custom-image-renderer";

interface EditorOutputProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any;
}

const Output = dynamic(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
  async () => (await import("editorjs-react-renderer")).default,
  { ssr: false },
);

const renderers = {
  code: CustomCodeRenderer,
  image: CustomImageRenderer,
};

const style = {
  paragraph: {
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  },
};

export function EditorOutput({ content }: EditorOutputProps) {
  return (
    <Output
      className="text-sm"
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data={content}
      renderers={renderers}
      style={style}
    />
  );
}
