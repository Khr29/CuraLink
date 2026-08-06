import React from 'react'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import './PhoneInput.css'

// CuraLink-styled wrapper around react-phone-number-input, mirroring the
// same component in the admin app so the phone field feels identical
// everywhere. Emits/accepts an E.164 string (e.g. "+919876543210") - stored
// in the same `phone` / `emergencyContactPhone` fields the backend already
// expects a plain string for, so no backend change is required.
const CuraLinkPhoneInput = ({ value, onChange, placeholder = 'Phone number', defaultCountry = 'IN', className = '', error = false, ...rest }) => (
  <div className={`curalink-phone-input ${error ? 'curalink-phone-input--error' : ''} ${className}`}>
    <PhoneInput
      international
      defaultCountry={defaultCountry}
      countryCallingCodeEditable={false}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      numberInputProps={{ autoComplete: 'tel' }}
      {...rest}
    />
  </div>
)

export default CuraLinkPhoneInput
