import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { HospitalContext } from '../../context/HospitalContext'
import { Images, UploadCloud, Trash2, Loader2, Image as ImageIcon } from 'lucide-react'
import PageHero from '../../components/PageHero'
import FormCard from '../../components/FormCard'
import ImageUploadSlot from '../../components/ImageUploadSlot'
import ConfirmDialog from '../../components/ConfirmDialog'

const PageLoader = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
    <div style={{ width: 44, height: 44, border: '3px solid #E2E8F0', borderTopColor: '#14B8A6', borderRadius: '50%', animation: 'curalink-spin .7s linear infinite' }} />
  </div>
)

const HospitalGallery = () => {
  const { hToken, backendUrl, hospitalProfile, getHospitalProfile } = useContext(HospitalContext)
  const [banner, setBanner] = useState(null)
  const [logo, setLogo] = useState(null)
  const [coverImage, setCoverImage] = useState(null)
  const [bannerRemoved, setBannerRemoved] = useState(false)
  const [logoRemoved, setLogoRemoved] = useState(false)
  const [coverRemoved, setCoverRemoved] = useState(false)
  const [galleryFiles, setGalleryFiles] = useState([])
  const [saving, setSaving] = useState(false)
  const [deletingUrl, setDeletingUrl] = useState(null)

  useEffect(() => {
    if (hToken) getHospitalProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hToken])

  const hasChanges = banner || logo || coverImage || galleryFiles.length > 0 || bannerRemoved || logoRemoved || coverRemoved

  const handleSave = async () => {
    // Cover image is required — a removal with no replacement can't be
    // persisted, so block save instead of silently discarding the removal.
    if (coverRemoved && !coverImage) {
      toast.error('Please upload a new cover image before saving, or cancel the removal by uploading one back.')
      return
    }
    setSaving(true)
    try {
      const formData = new FormData()
      if (banner) formData.append('banner', banner)
      else if (bannerRemoved) formData.append('removeBanner', 'true')
      if (logo) formData.append('logo', logo)
      else if (logoRemoved) formData.append('removeLogo', 'true')
      if (coverImage) formData.append('image', coverImage)
      galleryFiles.forEach((file) => formData.append('galleryImages', file))

      const { data } = await axios.post(`${backendUrl}/api/hospital/self/media`, formData, { headers: { htoken: hToken } })
      if (data.success) {
        toast.success('Media updated')
        setBanner(null); setLogo(null); setCoverImage(null); setGalleryFiles([])
        setBannerRemoved(false); setLogoRemoved(false); setCoverRemoved(false)
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

  const [galleryDeleteTarget, setGalleryDeleteTarget] = useState(null)

  const confirmDeleteGalleryImage = async () => {
    const url = galleryDeleteTarget
    if (!url) return
    setDeletingUrl(url)
    try {
      const { data } = await axios.post(`${backendUrl}/api/hospital/self/gallery/delete`, { url }, { headers: { htoken: hToken } })
      if (data.success) {
        toast.success('Photo removed')
        getHospitalProfile()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setDeletingUrl(null)
      setGalleryDeleteTarget(null)
    }
  }

  if (!hospitalProfile) return <PageLoader />

  return (
    <div className="curalink-fade-in" style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF6FF 100%)', padding: '36px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        <PageHero icon={Images} title="Gallery" description="Manage your hospital's banner, logo, cover image, and photo gallery." />

        <FormCard title="Brand Images" icon={ImageIcon}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
            <ImageUploadSlot
              label="Banner" hint="Shown behind your dashboard header (wide)" aspect="16/9"
              current={hospitalProfile.banner} file={banner} removed={bannerRemoved} uploading={saving}
              onSelect={(f) => { setBanner(f); setBannerRemoved(false) }}
              onRemove={() => { setBanner(null); setBannerRemoved(true) }}
            />
            <ImageUploadSlot
              label="Logo" hint="Square logo used across CuraLink" aspect="1/1"
              current={hospitalProfile.logo} file={logo} removed={logoRemoved} uploading={saving}
              onSelect={(f) => { setLogo(f); setLogoRemoved(false) }}
              onRemove={() => { setLogo(null); setLogoRemoved(true) }}
            />
            <ImageUploadSlot
              label="Cover Image" hint="Main photo on your hospital card" aspect="4/3" required
              current={hospitalProfile.image} file={coverImage} removed={coverRemoved} uploading={saving}
              onSelect={(f) => { setCoverImage(f); setCoverRemoved(false) }}
              onRemove={() => { setCoverImage(null); setCoverRemoved(true) }}
            />
          </div>
        </FormCard>

        <div style={{ height: 24 }} />

        <FormCard title="Photo Gallery" icon={Images}>
          {hospitalProfile.gallery?.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 14, marginBottom: 20 }}>
              {hospitalProfile.gallery.map((url) => (
                <div key={url} style={{ position: 'relative', aspectRatio: '1/1', borderRadius: 14, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                  <img src={url} alt="Gallery" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    type="button"
                    onClick={() => setGalleryDeleteTarget(url)}
                    disabled={deletingUrl === url}
                    style={{
                      position: 'absolute', top: 6, right: 6, width: 26, height: 26, borderRadius: '50%',
                      background: 'rgba(239,68,68,0.9)', border: 'none', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                    }}
                  >
                    {deletingUrl === url ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                  </button>
                </div>
              ))}
            </div>
          )}

          <label htmlFor="gallery-add" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            padding: '14px 20px', borderRadius: 14, border: '2px dashed #CBD5E1',
            background: '#F8FAFC', cursor: 'pointer', transition: 'all 0.2s ease'
          }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.background = '#EFF6FF' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.background = '#F8FAFC' }}
          >
            <UploadCloud size={18} color="#2563EB" />
            <span style={{ fontSize: 13.5, fontWeight: 600, color: '#0F172A' }}>
              {galleryFiles.length > 0 ? `${galleryFiles.length} photo(s) ready to upload` : 'Add photos to your gallery'}
            </span>
          </label>
          <input id="gallery-add" type="file" hidden multiple accept="image/*" onChange={(e) => setGalleryFiles(Array.from(e.target.files))} />
        </FormCard>

        <div style={{ marginTop: 24 }}>
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '13px 28px', borderRadius: 14, border: 'none',
              background: (saving || !hasChanges) ? '#94A3B8' : 'linear-gradient(135deg, #2563EB, #14B8A6)',
              color: '#FFFFFF', fontSize: 14, fontWeight: 700, cursor: (saving || !hasChanges) ? 'not-allowed' : 'pointer',
              boxShadow: (saving || !hasChanges) ? 'none' : '0 10px 30px rgba(37,99,235,0.25)', fontFamily: 'Inter, sans-serif'
            }}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
            {saving ? 'Uploading…' : 'Save Changes'}
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(galleryDeleteTarget)}
        title="Remove this photo?"
        message="This photo will be permanently removed from your gallery."
        confirmLabel="Remove"
        destructive
        loading={Boolean(deletingUrl)}
        onConfirm={confirmDeleteGalleryImage}
        onClose={() => setGalleryDeleteTarget(null)}
      />
    </div>
  )
}

export default HospitalGallery
