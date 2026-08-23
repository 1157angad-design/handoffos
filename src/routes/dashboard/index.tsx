import { createFileRoute } from '@tanstack/react-router'
import { DashboardApp } from '@/components/dashboard-app'
export const Route = createFileRoute('/dashboard/')({ component: () => <DashboardApp /> })
