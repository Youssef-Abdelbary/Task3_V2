import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = { courseCode: '', rating: 5, comment: '' }

export default function ReviewForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await api.get('/reviews/' + id)
        const review = res.data.review ?? res.data
        if (cancelled) return
        setForm({
          courseCode: review.courseCode ?? '',
          rating: Number(review.rating) || 5,
          comment: review.comment ?? ''
        })
      } catch (err) {
        if (!cancelled) {
          setError(err?.response?.data?.message || 'Could not load review')
        }
      }
    })()
    return () => { cancelled = true }
  }, [id])

  function onChange(e) {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: name === 'rating' ? Number(value) : value
    }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    const payload = {
      courseCode: form.courseCode,
      rating: form.rating,
      comment: form.comment
    }
    try {
      if (id) {
        await api.patch('/reviews/' + id, payload)
      } else {
        await api.post('/reviews', payload)
      }
      nav('/reviews')
    } catch (err) {
      setError(err?.response?.data?.message || 'Save failed')
    }
  }

  async function onDelete() {
    if (!id) return
    if (!window.confirm('Delete this review?')) return
    setError('')
    try {
      await api.delete('/reviews/' + id)
      nav('/reviews')
    } catch (err) {
      setError(err?.response?.data?.message || 'Delete failed')
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'Write'} Review</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="input"
          name="courseCode"
          placeholder="Course code (e.g. CS101)"
          value={form.courseCode}
          onChange={onChange}
          required
        />
        <select
          className="input"
          name="rating"
          value={form.rating}
          onChange={onChange}
        >
          {[1, 2, 3, 4, 5].map(n => (
            <option key={n} value={n}>{n} / 5</option>
          ))}
        </select>
        <textarea
          className="input"
          name="comment"
          placeholder="Comment (optional)"
          rows={4}
          value={form.comment}
          onChange={onChange}
        />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <div className="flex gap-2">
          <button className="btn" type="submit">Save</button>
          {id && (
            <button className="btn" type="button" onClick={onDelete}>
              Delete
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
