import BlocklistManager from "@/features/blocklist/components/BlocklistManager"
import { PageTransition } from "@/components/shared/PageTransition"

export default function BlocklistPage() {
  return (
    <PageTransition>
      <BlocklistManager />
    </PageTransition>
  )
}
