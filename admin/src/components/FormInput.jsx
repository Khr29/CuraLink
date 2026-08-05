import React from 'react'
import { formLabelStyle, formInputStyle, formFocusHandlers } from './formStyles'

// Shared labeled text input — same recipe as AddDoctor.jsx/AddHospital.jsx's
// local InputField, extracted for reuse across the Hospital portal's forms.
const FormInput = (props) => {
  const Icon = props.icon
  const { label, type = 'text', value, onChange, placeholder, required = false, step } = props
  return (
    <div>
      <label style={formLabelStyle}>{label}</label>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {Icon && (
          <div style={{ position: 'absolute', left: 14, pointerEvents: 'none', color: '#94A3B8' }}>
            <Icon size={18} />
          </div>
        )}
        <input
          type={type}
          value={value}
          step={step}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          style={{ ...formInputStyle, paddingLeft: Icon ? 42 : 14 }}
          {...formFocusHandlers}
        />
      </div>
    </div>
  )
}

export default FormInput
