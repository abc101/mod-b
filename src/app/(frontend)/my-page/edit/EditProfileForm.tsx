'use client'

import { useState } from 'react'
import { updateProfile, updatePassword, deleteAccount } from './actions'

type Props = {
  user: {
    id: number
    name: string
    nickname?: string
    email: string
    bio?: string
    avatar?: {
      url?: string
    },
    socialAvatarUrl?: string,
  }
}

export default function EditProfileForm({ user }: Props) {
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileSubmitting, setProfileSubmitting] = useState(false)

  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordSubmitting, setPasswordSubmitting] = useState(false)

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileSubmitting(true)
    setProfileError('')
    setProfileSuccess(false)

    const formData = new FormData(e.target as HTMLFormElement)
    try {
      await updateProfile(formData)
      setProfileSuccess(true)
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile.')
    } finally {
      setProfileSubmitting(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordSubmitting(true)
    setPasswordError('')
    setPasswordSuccess(false)

    const formData = new FormData(e.target as HTMLFormElement)
    try {
      await updatePassword(formData)
      setPasswordSuccess(true)
      ;(e.target as HTMLFormElement).reset()
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password.')
    } finally {
      setPasswordSubmitting(false)
    }
  }
  
  const avatarUrl = user.avatar?.url || user.socialAvatarUrl

  const handleDeleteAccount = async () => {
    const ok = confirm(
      'Are you sure you want to delete your account? Your posts and comments will remain, but your profile will be anonymized.',
    )

    if (!ok) return

    try {
      await deleteAccount()
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })

      window.location.href = '/'
    } catch (err: any) {
      alert(err.message || 'Failed to delete account.')
    }
  }

  return (
    <div className="space-y-8">
      {/* Profile info */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Edit Profile</h2>

        {profileError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded">
            {profileError}
          </div>
        )}
        {profileSuccess && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-600 text-sm px-4 py-3 rounded">
            Profile updated successfully!
          </div>
        )}
        <form onSubmit={handleProfileSubmit} encType="multipart/form-data" className="space-y-4">
         
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Image
            </label>
            <div className="flex items-center gap-4">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user.nickname || user.name || 'Profile'}
                  className="w-20 h-20 rounded-full object-cover mb-4 border border-gray-200"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-2xl mb-4">
                  {user.nickname?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                </div>
              )}

              <div className="flex-1">
                <label className="inline-flex cursor-pointer items-center rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700">
                  Choose Image
                  <input
                    type="file"
                    name="avatar"
                    accept="image/*"
                    className="hidden"
                  />
                </label>

                <p className="mt-1 text-xs text-gray-400">
                  Upload a square image for best results.
                </p>
              </div>
            </div>
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full border border-gray-200 rounded px-4 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              defaultValue={user.name}
              required
              className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nickname
            </label>
            <input
              type="text"
              value={user.nickname}
              disabled
              className="w-full border border-gray-200 rounded px-4 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
            />
             <p className="text-xs text-gray-400 mt-1">Nickname cannot be changed.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              name="bio"
              defaultValue={user.bio || ''}
              placeholder="Tell us about yourself..."
              rows={4}
              className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={profileSubmitting}
              className="bg-gray-900 text-white px-6 py-2 rounded text-sm hover:bg-gray-700 disabled:opacity-50"
            >
              {profileSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Change password */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h2>

        {passwordError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded">
            {passwordError}
          </div>
        )}
        {passwordSuccess && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-600 text-sm px-4 py-3 rounded">
            Password updated successfully!
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="currentPassword"
              placeholder="••••••••"
              required
              className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="newPassword"
              placeholder="Min. 8 characters"
              required
              minLength={8}
              className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Repeat new password"
              required
              className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={passwordSubmitting}
              className="bg-gray-900 text-white px-6 py-2 rounded text-sm hover:bg-gray-700 disabled:opacity-50"
            >
              {passwordSubmitting ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
      <div className="bg-white border border-red-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-red-600 mb-2">
          Delete Account
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Your account will be deactivated and your profile information will be anonymized. Your posts and comments will remain.
        </p>
        <button
          type="button"
          onClick={handleDeleteAccount}
          className="border border-red-300 text-red-600 px-4 py-2 rounded text-sm hover:bg-red-50"
        >
          Delete My Account
        </button>
      </div>
    </div>
  )
}
