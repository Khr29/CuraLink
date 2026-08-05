import React from 'react'
import { Stethoscope } from 'lucide-react'
import ReviewsPanel from '../../components/ReviewsPanel'

// Doctor reviews are moderated entirely separately from hospital reviews —
// see HospitalReviews.jsx for the counterpart. Both share ReviewsPanel but
// each hard-filters to its own review type so the two never mix.
const DoctorReviews = () => (
  <ReviewsPanel
    reviewType="doctor"
    icon={Stethoscope}
    title="Doctor Reviews"
    description="Moderate patient reviews written for doctors."
    targetLabel="Doctor"
  />
)

export default DoctorReviews
