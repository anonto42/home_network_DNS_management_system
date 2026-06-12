import ProfilePageFeature from "@/features/profile/components/ProfilePage"
import { PageTransition } from "@/components/shared/PageTransition"

export default function ProfilePage() {
  return (
    <PageTransition>
      <ProfilePageFeature />
    </PageTransition>
  )
}
