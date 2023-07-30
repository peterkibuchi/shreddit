"use client";

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type EditorJS from "@editorjs/editorjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useForm } from "react-hook-form";
import TextareaAutosize from "react-textarea-autosize";
import { type z } from "zod";

import { toast } from "~/components/ui/use-toast";
import { editorTools } from "~/lib/editor-tools";
import { PostValidator, type PostCreationRequest } from "~/lib/validators/post";

type FormData = z.infer<typeof PostValidator>;

interface PostFormProps {
  subredditId: string;
}

export function PostForm({ subredditId }: PostFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(PostValidator),
    defaultValues: {
      content: null,
      subredditId,
      title: "",
    },
  });

  const ref = useRef<EditorJS>();
  const _titleRef = useRef<HTMLTextAreaElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  const { mutate: createPost } = useMutation({
    mutationFn: async ({
      content,
      subredditId,
      title,
    }: PostCreationRequest) => {
      const payload: PostCreationRequest = { content, subredditId, title };
      const { data } = await axios.post("/api/subreddit/post/create", payload);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return data;
    },

    onError: () => {
      return toast({
        title: "Something went wrong.",
        description: "Your post was not published. Please try again.",
        variant: "destructive",
      });
    },

    onSuccess: () => {
      // Convert pathname `/r/community/submit` into `/r/community`
      const newPathname = pathname.split("/").slice(0, -1).join("/");
      router.push(newPathname);
      router.refresh();

      return toast({
        description: "Your post has been published.",
      });
    },
  });

  const initializeEditor = useCallback(async () => {
    const EditorJS = (await import("@editorjs/editorjs")).default;

    if (!ref.current) {
      const editor = new EditorJS({
        holder: "editor",
        onReady() {
          ref.current = editor;
        },
        data: { blocks: [] },
        inlineToolbar: true,
        placeholder: "Start typing here to create your post...",
        tools: editorTools,
      });
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMounted(true);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await initializeEditor();

      // Set focus on title
      setTimeout(() => {
        _titleRef.current?.focus();
      }, 0);
    };

    if (isMounted) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      init();

      return () => {
        ref.current?.destroy();
        ref.current = undefined;
      };
    }
  }, [isMounted, initializeEditor]);

  useEffect(() => {
    if (Object.keys(errors).length) {
      for (const value of Object.values(errors)) {
        value;
        toast({
          title: "Something went wrong.",
          description: (value as { message: string }).message,
          variant: "destructive",
        });
      }
    }
  }, [errors]);

  async function onSubmit(data: FormData) {
    const blocks = await ref.current?.save();

    const payload: PostCreationRequest = {
      content: blocks,
      subredditId,
      title: data.title,
    };

    createPost(payload);
  }

  if (!isMounted) {
    return null;
  }

  const { ref: titleRef, ...rest } = register("title");

  return (
    <div className="w-full rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:bg-slate-800">
      <form
        id="subreddit-post-form"
        className="w-fit"
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="prose prose-stone dark:prose-invert">
          <TextareaAutosize
            ref={(e) => {
              titleRef(e);

              // @ts-expect-error Cannot assign to current because it is a read-only property
              _titleRef.current = e;
            }}
            {...rest}
            placeholder="Title"
            className="w-full resize-none appearance-none overflow-hidden bg-transparent text-5xl font-bold focus:outline-none"
          />

          <div id="editor" className="min-h-[500px]" />

          <p className="text-sm text-gray-500">
            Use{" "}
            <kbd className="rounded-md border bg-muted px-1 text-xs uppercase dark:bg-slate-200">
              Tab
            </kbd>{" "}
            to open the command menu.
          </p>
        </div>
      </form>
    </div>
  );
}
