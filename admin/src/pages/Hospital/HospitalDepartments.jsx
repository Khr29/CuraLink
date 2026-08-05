import React, { useContext, useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { HospitalContext } from '../../context/HospitalContext'
import {
  Building2, HeartPulse, Activity, Stethoscope, Baby, Syringe, Sparkles,
  Eye, Microscope, Check, Plus, X, Loader2
} from 'lucide-react'
import PageHero from '../../components/PageHero'

const DEPARTMENT_LIST = [
  { name: 'Cardiology', icon: HeartPulse },
  { name: 'Neurology', icon: Activity },
  { name: 'Orthopedics', icon: Stethoscope },
  { name: 'Pediatrics', icon: Baby },
  { name: 'Oncology', icon: Syringe },
  { name: 'Dermatology', icon: Sparkles },
  { name: 'General Medicine', icon: Building2 },
  { name: 'ENT', icon: Eye },
  { name: 'Urology', icon: Microscope },
  { name: 'Ophthalmology', icon: Eye },
  { name: 'Gastroenterology', icon: Microscope },
  { name: 'Pulmonology', icon: Activity },
]

const PageLoader = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
    <div style={{ width: 44, height: 44, border: '3px solid #E2E8F0', borderTopColor: '#14B8A6', borderRadius: '50%', animation: 'curalink-spin .7s linear infinite' }} />
  </div>
)

const HospitalDepartments = () => {
  const { hToken, backendUrl, hospitalProfile, getHospitalProfile } = useContext(HospitalContext)
  const [selected, setSelected] = useState(null)
  const [customInput, setCustomInput] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (hToken) getHospitalProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hToken])

  useEffect(() => {
    if (hospitalProfile && selected === null) setSelected(hospitalProfile.departments || [])
  }, [hospitalProfile, selected])

  const toggle = useCallback((name) => {
    setSelected((prev) => (prev.includes(name) ? prev.filter((d) => d !== name) : [...prev, name]))
  }, [])

  const addCustom = () => {
    const value = customInput.trim()
    if (!value) return
    if (!selected.includes(value)) setSelected((prev) => [...prev, value])
    setCustomInput('')
  }

  const save = async () => {
    setSaving(true)
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/hospital/self/profile`,
        { departments: selected },
        { headers: { htoken: hToken } }
      )
      if (data.success) {
        toast.success('Departments updated')
        getHospitalProfile()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setSaving(false)
    }
  }

  if (!hospitalProfile || selected === null) return <PageLoader />

  const customDepartments = selected.filter((d) => !DEPARTMENT_LIST.some((dep) => dep.name === d))

  return (
    <div className="curalink-fade-in" style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF6FF 100%)', padding: '36px 24px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>

        <PageHero icon={Building2} title="Departments" description="Choose which departments your hospital offers." />

        <div style={{ background: '#FFFFFF', borderRadius: 24, border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(15,23,42,0.04)', padding: '28px 32px', marginBottom: 24 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
            Common Departments
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 28 }}>
            {DEPARTMENT_LIST.map((dept) => {
              const Icon = dept.icon
              const name = dept.name
              const isSelected = selected.includes(name)
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggle(name)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 999,
                    border: `1.5px solid ${isSelected ? '#2563EB' : '#CBD5E1'}`,
                    background: isSelected ? '#2563EB' : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : '#334155',
                    fontSize: 13, fontWeight: isSelected ? 600 : 500, cursor: 'pointer',
                    boxShadow: isSelected ? '0 4px 14px rgba(37,99,235,0.25)' : 'none',
                    transition: 'all 0.2s ease', fontFamily: 'Inter, sans-serif'
                  }}
                >
                  <Icon size={15} color={isSelected ? '#FFFFFF' : '#64748B'} />
                  <span>{name}</span>
                  {isSelected && <Check size={14} color="#FFFFFF" style={{ marginLeft: 'auto' }} />}
                </button>
              )
            })}
          </div>

          <p style={{ fontSize: 13, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
            Custom Departments
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {customDepartments.map((name) => (
              <span key={name} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#F0FDFA', color: '#0D9488', padding: '7px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600 }}>
                {name}
                <button type="button" onClick={() => toggle(name)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: '#0D9488' }}>
                  <X size={13} />
                </button>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustom() } }}
              placeholder="Add a department not listed above..."
              style={{ flex: 1, height: 44, border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '0 14px', fontSize: 13.5, outline: 'none', fontFamily: 'Inter, sans-serif' }}
            />
            <button
              type="button"
              onClick={addCustom}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#EFF6FF', border: 'none', borderRadius: 12, padding: '0 18px', color: '#2563EB', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
            >
              <Plus size={15} /> Add
            </button>
          </div>
        </div>

        <button
          onClick={save}
          disabled={saving}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '13px 28px', borderRadius: 14, border: 'none',
            background: saving ? '#94A3B8' : 'linear-gradient(135deg, #2563EB, #14B8A6)',
            color: '#FFFFFF', fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
            boxShadow: saving ? 'none' : '0 10px 30px rgba(37,99,235,0.25)', fontFamily: 'Inter, sans-serif'
          }}
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          {saving ? 'Saving…' : 'Save Departments'}
        </button>
      </div>
    </div>
  )
}

export default HospitalDepartments
