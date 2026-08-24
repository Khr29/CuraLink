import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import AdminContextProvider from './context/AdminContext.jsx'
import DoctorContextProvider from './context/DoctorContext.jsx'
import HospitalContextProvider from './context/HospitalContext.jsx'
import PharmacyContextProvider from './context/PharmacyContext.jsx'
import AppContextProvider from './context/AppContext.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <AdminContextProvider>
    <DoctorContextProvider>
      <HospitalContextProvider>
        <PharmacyContextProvider>
          <AppContextProvider>
             <App />
          </AppContextProvider>
        </PharmacyContextProvider>
      </HospitalContextProvider>
    </DoctorContextProvider>
  </AdminContextProvider>
  </BrowserRouter>


)
