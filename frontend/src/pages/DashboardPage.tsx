import DashboardPageFeature from '@/features/dashboard/components/DashboardPage'
import { PageTransition } from '@/components/shared/PageTransition'

export default function DashboardPage() {
  return (
    <PageTransition>
      <DashboardPageFeature />
    </PageTransition>
  )
}
