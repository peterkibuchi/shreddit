/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-var-requires */
import Code from "@editorjs/code";
import Embed from "@editorjs/embed";
import ImageTool from "@editorjs/image";
import InlineCode from "@editorjs/inline-code";
import LinkTool from "@editorjs/link";
import List from "@editorjs/list";
import Table from "@editorjs/table";

import { uploadFiles } from "~/lib/uploadthing";

const Header = require("@editorjs/header");
const Quote = require("@editorjs/quote");

export const editorTools = {
  code: Code,
  embed: Embed,
  header: Header,
  image: {
    class: ImageTool,
    config: {
      uploader: {
        async uploadByFile(file: File) {
          // Upload to uploadthing
          const [res] = await uploadFiles({
            endpoint: "imageUploader",
            files: [file],
          });

          if (res) {
            return {
              success: 1,
              file: {
                url: res.fileUrl,
              },
            };
          }
        },
      },
    },
  },
  inlineCode: InlineCode,
  linkTool: {
    class: LinkTool,
    config: {
      endpoint: "/api/link",
    },
  },
  list: List,
  quote: Quote,
  table: Table,
};
