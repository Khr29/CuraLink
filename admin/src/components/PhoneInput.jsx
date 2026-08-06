import React from 'react'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import './PhoneInput.css'

// CuraLink-styled wrapper around react-phone-number-input so every phone
// field (Admin/Doctor/Hospital forms) gets the same country flag + dial
// code + auto-formatting + validation UI. Emits/accepts an E.164 string
// (e.g. "+919876543210") through the same `value`/`onChange` shape a plain
// text input would - stored in the same `phone` field the backend already
// expects a string for, so no backend change is required.
const CuraLinkPhoneInput = ({ value, onChange, placeholder = 'Phone number', defaultCountry = 'IN', className = '', ...rest }) => (
  <div className={`curalink-phone-input ${className}`}>
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
