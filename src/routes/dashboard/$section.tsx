import { createFileRoute, notFound } from '@tanstack/react-router'
import { DashboardApp } from '@/components/dashboard-app'
const sections = ['projects', 'api-keys', 'sdk-downloads', 'analytics', 'conversations', 'integrations', 'team', 'billing', 'settings', 'support']
export const Route = createFileRoute('/dashboard/$section')({ beforeLoad: ({ params }) => { if (!sections.includes(params.section)) throw notFound() }, component: Section })
function Section() { const { section } = Route.useParams(); return <DashboardApp section={section} /> }
