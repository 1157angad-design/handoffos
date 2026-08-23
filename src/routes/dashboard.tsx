import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { getServerUser } from '@/lib/auth'
export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    const user = await getServerUser()
    if (!user) throw redirect({ to: '/login' })
  },
  component: () => <Outlet />,
})
