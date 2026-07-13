'use client'

type Props = {
  nickname: string
  password: string

  onNicknameChange: (value: string) => void
  onPasswordChange: (value: string) => void

  showNickname?: boolean
}

export default function AnonymousFields({
  nickname,
  password,
  onNicknameChange,
  onPasswordChange,
  showNickname = true,
}: Props) {
  return (
    <section className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
      <div>
        <p className="text-sm font-medium text-gray-800">
          Anonymous
        </p>

        <p className="text-xs text-gray-500 mt-1">
          Your password is required later to edit or delete this content.
        </p>
      </div>

      {showNickname && (
        <input
          type="text"
          value={nickname}
          onChange={(e) =>
            onNicknameChange(e.target.value)
          }
          placeholder="Nickname (optional)"
          className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm bg-white"
        />
      )}

      <input
        type="password"
        value={password}
        onChange={(e) =>
          onPasswordChange(e.target.value)
        }
        placeholder="Password"
        className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm bg-white"
        minLength={4}
        required
      />
    </section>
  )
}