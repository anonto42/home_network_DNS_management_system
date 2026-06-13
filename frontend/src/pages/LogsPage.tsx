import LogsPageFeature from '@/features/logs/components/LogsPage'
import { PageTransition } from '@/components/shared/PageTransition'

export default function LogsPage() {
  return (
    <PageTransition>
      <LogsPageFeature />
    </PageTransition>
  )
}
