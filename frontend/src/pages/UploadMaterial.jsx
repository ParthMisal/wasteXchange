import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ImagePlus, X } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Input from '../components/ui/Input.jsx'
import Select from '../components/ui/Select.jsx'
import Button from '../components/ui/Button.jsx'
import LocationInput from '../components/LocationInput.jsx'
import { createMaterial, getMaterial, updateMaterial } from '../api/materials.js'
import { useAuth } from '../context/AuthContext.jsx'

const categories = ['Plastic', 'Metal', 'Chemical', 'Textile', 'Wood', 'E-waste', 'Paper', 'Glass', 'Rubber', 'Organic', 'Construction', 'Other']
const units = ['kg', 'tonnes', 'units', 'litres']
const conditions = ['New / unused', 'Used - good condition', 'Used - fair condition', 'Scrap / end of life']

const initialState = {
  name: '',
  category: '',
  subcategory: '',
  quantity: '',
  unit: 'kg',
  price: '',
  purity: '',
  condition: '',
  description: '',
  location: '',
}

export default function UploadMaterial() {
  const { user, canSell } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')
  const fileInputRef = useRef(null)

  const [form, setForm] = useState(() => ({
    ...initialState,
    location: user?.location || user?.city || user?.address || '',
  }))
  const [coords, setCoords] = useState(null)
  const [images, setImages] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const objectUrlsRef = useRef([])

  const isFormValid =
    Boolean(form.name.trim()) &&
    Boolean(form.category) &&
    form.quantity !== '' &&
    Number(form.quantity) > 0 &&
    form.price !== '' &&
    Number(form.price) >= 0

  useEffect(() => {
    if (!editId) return
    let active = true
    getMaterial(editId)
      .then((m) => {
        if (!active) return
        setForm({
          name: m.name || '',
          category: m.category || '',
          subcategory: m.subcategory || '',
          quantity: m.quantity ?? '',
          unit: m.unit || 'kg',
          price: m.price ?? '',
          purity: m.purity || '',
          condition: m.condition || '',
          description: m.description || '',
          location: m.location || '',
        })
        if (m.latitude != null) setCoords({ latitude: m.latitude, longitude: m.longitude })
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || err.message || 'Failed to load listing.')
      })
    return () => {
      active = false
    }
  }, [editId])

  useEffect(() => {
    if (!canSell) navigate('/dashboard/buyer', { replace: true })
  }, [canSell, navigate])

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const addFiles = useCallback((files) => {
    const next = Array.from(files).map((file) => {
      const url = URL.createObjectURL(file)
      objectUrlsRef.current.push(url)
      return { file, preview: url }
    })
    setImages((prev) => [...prev, ...next])
  }, [])

  const handleDrop = (e) => {
    e.preventDefault()
    addFiles(e.dataTransfer.files)
  }

  const removeImage = (index) => {
    setImages((prev) => {
      const url = prev[index]?.preview
      if (url) {
        objectUrlsRef.current = objectUrlsRef.current.filter((u) => u !== url)
        URL.revokeObjectURL(url)
      }
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isFormValid) return

    setError('')
    setSubmitting(true)
    try {
      if (editId) {
        await updateMaterial(editId, {
          name: form.name.trim(),
          category: form.category,
          subcategory: form.subcategory.trim(),
          quantity: Number(form.quantity),
          unit: form.unit,
          price: Number(form.price),
          purity: form.purity.trim(),
          condition: form.condition.trim(),
          description: form.description.trim(),
          location: form.location.trim(),
          latitude: coords?.latitude ?? null,
          longitude: coords?.longitude ?? null,
        })
        setMessage('Listing updated successfully!')
      } else {
        const fd = new FormData()
        fd.append('name', form.name.trim())
        fd.append('category', form.category)
        fd.append('subcategory', form.subcategory.trim())
        fd.append('quantity', form.quantity)
        fd.append('unit', form.unit)
        fd.append('price', form.price)
        fd.append('purity', form.purity.trim())
        fd.append('condition', form.condition.trim())
        fd.append('description', form.description.trim())
        fd.append('location', form.location.trim())
        if (coords?.latitude != null) fd.append('latitude', coords.latitude)
        if (coords?.longitude != null) fd.append('longitude', coords.longitude)
        images.forEach(({ file }) => fd.append('images', file))

        await createMaterial(fd)
        setMessage('Material listed successfully!')
      }
      setTimeout(() => navigate('/dashboard/seller'), 1000)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save material.')
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-start justify-center bg-surface px-6 py-12">
      <Card className="w-full max-w-2xl">
        <h1 className="font-heading text-2xl font-bold text-ink">
          {editId ? 'Edit Surplus Material' : 'List Surplus Material'}
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          {editId
            ? 'Update the details so buyers can keep finding your surplus.'
            : 'Share details so buyers can find and match with your surplus.'}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <Input
            id="name"
            name="name"
            label="Material name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Recycled PET flakes"
          />

          <Select
            id="category"
            name="category"
            label="Category"
            value={form.category}
            onChange={handleChange}
          >
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>

          <Input
            id="subcategory"
            name="subcategory"
            label="Subcategory"
            value={form.subcategory}
            onChange={handleChange}
            placeholder="e.g. HDPE, Copper shavings"
          />

          <div className="flex gap-4">
            <div className="w-full">
              <Input
                id="quantity"
                name="quantity"
                label="Quantity"
                type="number"
                min="0"
                value={form.quantity}
                onChange={handleChange}
                placeholder="e.g. 500"
              />
            </div>
            <div className="w-full">
              <Select
                id="unit"
                name="unit"
                label="Unit"
                value={form.unit}
                onChange={handleChange}
              >
                {units.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <Input
            id="price"
            name="price"
            label="Price per unit (INR)"
            type="number"
            min="0"
            value={form.price}
            onChange={handleChange}
            placeholder="e.g. 45"
          />

          <div className="flex flex-col gap-5 sm:flex-row">
            <div className="w-full">
              <Input
                id="purity"
                name="purity"
                label="Purity / Grade (optional)"
                value={form.purity}
                onChange={handleChange}
                placeholder="e.g. 95% pure"
              />
            </div>
            <div className="w-full">
              <Select
                id="condition"
                name="condition"
                label="Condition (optional)"
                value={form.condition}
                onChange={handleChange}
              >
                <option value="">Select condition</option>
                {conditions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="mb-2 block text-sm font-medium text-ink">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows="4"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe condition, packaging, availability, etc."
              className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary"
            />
          </div>

          {!editId && (
            <div>
              <span className="mb-2 block text-sm font-medium text-ink">Images</span>
              <div
                role="button"
                tabIndex={0}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click()
                }}
                className="cursor-pointer rounded-lg border-2 border-dashed border-stone-300 bg-surface p-8 text-center transition-colors hover:border-primary"
              >
                <ImagePlus className="mx-auto h-10 w-10 text-ink-faint" />
                <p className="mt-3 text-sm font-medium text-ink">
                  Drag &amp; drop images here or click to browse
                </p>
                <p className="mt-1 text-xs text-ink-muted">Multiple images supported</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    addFiles(e.target.files)
                    e.target.value = ''
                  }}
                />
              </div>
              {images.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-3">
                  {images.map((img, i) => (
                    <div
                      key={img.preview}
                      className="relative h-20 w-20 overflow-hidden rounded-lg border border-stone-200"
                    >
                      <img
                        src={img.preview}
                        alt={`Preview ${i + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        title="Remove image"
                        onClick={() => removeImage(i)}
                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink/70 text-white transition-colors hover:bg-danger"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <LocationInput
            value={form.location}
            onChange={(value) => setForm((prev) => ({ ...prev, location: value }))}
            onLocationChange={(loc) => setCoords(loc)}
            required
            placeholder="e.g. Mumbai, Maharashtra"
          />

          {message && (
            <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {message}
            </p>
          )}
          {error && <p className="text-sm text-danger">{error}</p>}

          <Button
            type="submit"
            className={`w-full ${isFormValid ? '' : 'cursor-not-allowed opacity-50'}`}
            disabled={!isFormValid || submitting}
          >
            {submitting ? 'Saving…' : editId ? 'Update Listing' : 'List Material'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
