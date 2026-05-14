import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { TanStackDevtools } from "@tanstack/react-devtools"
import { ConvexProvider } from "convex/react"

import appCss from "../styles.css?url"
import { RootProviders } from "@/components/RootProviders"
import { convexReactClient } from "@/lib/convexClient"

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "letterbox",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  notFoundComponent: () => (
    <main className="mx-auto max-w-[1100px] px-6 py-16">
      <h1 className="font-[family-name:var(--font-heading)] text-[48px] font-bold">
        404
      </h1>
      <p className="mt-4 font-medium">page not found.</p>
    </main>
  ),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-svh lowercase antialiased">
        <ConvexProvider client={convexReactClient}>
          <RootProviders>{children}</RootProviders>
        </ConvexProvider>
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
