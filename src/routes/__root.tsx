import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { TanStackDevtools } from "@tanstack/react-devtools"
import { ConvexProvider } from "convex/react"

import appCss from "../styles.css?url"
import { RootProviders } from "@/components/RootProviders"
import { convexReactClient } from "@/lib/convexClient"
import {
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_TAGLINE,
  getSiteOrigin,
} from "@/lib/siteMeta"

export const Route = createRootRoute({
  head: () => {
    const origin = getSiteOrigin()
    const ogImage =
      origin !== "" ? `${origin}/og.png` : "/og.png"
    const canonical = origin !== "" ? `${origin}/` : undefined

    return {
      meta: [
        { charSet: "utf-8" },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1",
        },
        { name: "theme-color", content: "#000000" },
        { name: "color-scheme", content: "light" },
        { name: "application-name", content: SITE_NAME },
        { name: "apple-mobile-web-app-title", content: SITE_NAME },
        { title: SITE_NAME },
        { name: "description", content: SITE_DESCRIPTION },
        { name: "keywords", content: SITE_KEYWORDS },
        { name: "robots", content: "index, follow" },
        { name: "author", content: "ireoluwa.ssh" },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: SITE_NAME },
        { property: "og:locale", content: "en_US" },
        { property: "og:title", content: `${SITE_NAME} — ${SITE_TAGLINE}` },
        { property: "og:description", content: SITE_DESCRIPTION },
        { property: "og:image", content: ogImage },
        { property: "og:image:type", content: "image/png" },
        {
          property: "og:image:alt",
          content: `${SITE_NAME} — ${SITE_TAGLINE}. ${SITE_DESCRIPTION}`,
        },
        ...(canonical != null
          ? ([
              { property: "og:url", content: canonical },
            ] as const)
          : []),
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: `${SITE_NAME} — ${SITE_TAGLINE}` },
        { name: "twitter:description", content: SITE_DESCRIPTION },
        { name: "twitter:image", content: ogImage },
        {
          name: "twitter:image:alt",
          content: `${SITE_NAME} — ${SITE_TAGLINE}`,
        },
      ],
      links: [
        { rel: "stylesheet", href: appCss },
        { rel: "icon", href: "/favicon.ico", sizes: "any" },
        {
          rel: "icon",
          type: "image/png",
          sizes: "32x32",
          href: "/favicon-32x32.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "16x16",
          href: "/favicon-16x16.png",
        },
        { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
        { rel: "manifest", href: "/manifest.json" },
        ...(canonical != null ? ([{ rel: "canonical", href: canonical }] as const) : []),
      ],
    }
  },
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
