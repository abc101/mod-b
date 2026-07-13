'use client'
import React from 'react'
import { useDocumentInfo } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'

export const RestoreButton: React.FC = () => {
  const { id, collectionSlug, originalDoc } = useDocumentInfo() as any
  const router = useRouter()

  if (!originalDoc?.isDeleted) return null
  if (!id || !collectionSlug) return null

  const handleRestore = async () => {
    if (!confirm('Restore this document?')) return

    try {
      await fetch(`/api/${collectionSlug}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDeleted: false }), 
      })
      alert('Successfully restored.')
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('')
    }
  }

  return (
    <button
      type="button"
      onClick={handleRestore}
      style={{
        backgroundColor: '#28a745',
        color: 'white',
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 'bold',
      }}
    >
      Restore (Restore)
    </button>
  )
}