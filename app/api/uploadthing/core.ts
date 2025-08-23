import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  avatarUploader: f({ image: { maxFileSize: "2MB" } }).onUploadComplete(
    async () => {
      // upload complete but nothing to handle
    }
  ),

  variantUploader: f({
    image: { maxFileCount: 10, maxFileSize: "8MB" },
  })
    .onUploadError(async ({ error }) => {
      console.log(error);
      console.log("errorrr");
    })
    .onUploadComplete(async ({ file: _file, metadata: _metadata }) => {
      // No-op: file and metadata available if needed later
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;