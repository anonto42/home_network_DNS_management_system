import RecordManager from "@/features/records/components/RecordManager"
import { PageTransition } from "@/components/shared/PageTransition"

export default function RecordsPage() {
  return (
    <PageTransition>
      <RecordManager />
    </PageTransition>
  )
}
