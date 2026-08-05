// Shared style tokens/handlers for the CuraLink admin form recipe — same
// look as AddDoctor.jsx/AddHospital.jsx's local styles, split out so both
// FormInput.jsx and any page using raw <select>/<textarea> can reuse them.

export const formLabelStyle = {
  fontSize: 12.5,
  fontWeight: 600,
  color: '#475569',
  marginBottom: 6,
  display: 'block',
  letterSpacing: '0.01em'
}

export const formInputStyle = {
  width: '100%',
  height: 48,
  background: '#FFFFFF',
  border: '1.5px solid #CBD5E1',
  borderRadius: 14,
  padding: '0 14px',
  fontSize: 13.5,
  color: '#0F172A',
  outline: 'none',
  fontFamily: 'Inter, sans-serif',
  transition: 'all 0.2s ease',
  boxSizing: 'border-box'
}

export const formFocusHandlers = {
  onFocus: (e) => {
    e.target.style.borderColor = '#2563EB'
    e.target.style.boxShadow = '0 0 0 4px rgba(37,99,235,0.12)'
  },
  onBlur: (e) => {
    e.target.style.borderColor = '#CBD5E1'
    e.target.style.boxShadow = 'none'
  }
}
