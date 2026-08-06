import React from 'react'

// Shared premium empty state (icon in a soft badge + title + subtitle),
// mirrors admin/src/components/EmptyState.jsx so both apps feel identical.
// Reused wherever a list has no data instead of plain "No X found" text.
const EmptyState = ({ icon: Icon, title, subtitle, compact = false }) => (
  <div className={`text-center ${compact ? 'py-10 px-6' : 'py-16 px-6'}`}>
    <div
      className={`mx-auto mb-4 flex items-center justify-center rounded-2xl bg-primary-light ${compact ? 'w-14 h-14 !rounded-xl' : 'w-16 h-16'
        }`}
    >
      <Icon className={compact ? 'w-6 h-6' : 'w-7 h-7'} color="#0D9488" strokeWidth={1.75} />
    </div>
    <h3 className={`font-bold text-text-primary ${compact ? 'text-sm' : 'text-lg'} mb-1`}>{title}</h3>
    <p className={`text-text-muted ${compact ? 'text-xs' : 'text-sm'}`}>{subtitle}</p>
  </div>
)

export default EmptyState
