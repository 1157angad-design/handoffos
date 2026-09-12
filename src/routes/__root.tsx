import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { AuthProvider } from '@/lib/auth'
import { ArchitectChat } from '@/components/architect-chat'
import { DashboardSearch } from '@/components/dashboard-search'
import '../styles.css'
import '../enhancements.css'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'HandoffOS — Seamless conversations. Zero context loss.',
      },
      {
        name: 'description',
        content: 'Enterprise infrastructure for secure, context-rich AI to human and human to AI conversation handoffs.',
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <AuthProvider>{children}<ArchitectChat /><DashboardSearch /></AuthProvider>
        <Scripts />
      </body>
    </html>
  )
}
