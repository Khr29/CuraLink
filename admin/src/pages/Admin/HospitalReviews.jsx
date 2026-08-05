import React from 'react'
import { Building2 } from 'lucide-react'
import ReviewsPanel from '../../components/ReviewsPanel'

// Hospital reviews are moderated entirely separately from doctor reviews —
// see DoctorReviews.jsx for the counterpart. Both share ReviewsPanel but
// each hard-filters to its own review type so the two never mix.
const HospitalReviews = () => (
  <ReviewsPanel
    reviewType="hospital"
    icon={Building2}
    title="Hospital Reviews"
    description="Moderate patient reviews written for hospitals."
    targetLabel="Hospital"
  />
)

export default HospitalReviews
