import SettingsPageFeature from "@/features/settings/components/SettingsPage"
import { PageTransition } from "@/components/shared/PageTransition"

export default function SettingsPage() {
  return (
    <PageTransition>
      <SettingsPageFeature />
    </PageTransition>
  )
}
