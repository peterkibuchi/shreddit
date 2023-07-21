import { createNextRouteHandler } from "uploadthing/next";

import { ourFileRouter } from "~/app/api/uploadthing/core";

// Export routes for Next App Router
export const { GET, POST } = createNextRouteHandler({
  router: ourFileRouter,
});
