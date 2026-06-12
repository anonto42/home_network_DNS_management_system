import SteeringPageFeature from "@/features/steering/components/SteeringPage"
import { PageTransition } from "@/components/shared/PageTransition"

export default function SteeringPage() {
  return (
    <PageTransition>
      <SteeringPageFeature />
    </PageTransition>
  )
}
