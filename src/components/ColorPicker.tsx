'use client'

import React from 'react'
import { useField } from '@payloadcms/ui'

const isValidHex = (color: unknown): color is string => {
  return typeof color === 'string' && /^#[0-9A-Fa-f]{6}$/.test(color)
}

export const ColorPickerAfterInput = (props: any) => {
  const { path, defaultColor = '#111827' } = props
  const { value, setValue } = useField<string>({ path })

  const fallbackColor = isValidHex(defaultColor) ? defaultColor : '#111827'
  const safeColor = isValidHex(value) ? value : fallbackColor

  return (
    <div
      style={{
        marginTop: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <input
        type="color"
        value={safeColor}
        onChange={(e) => setValue(e.target.value)}
        style={{
          width: 44,
          height: 34,
          padding: 0,
          cursor: 'pointer',
        }}
      />

      <button
        type="button"
        className="color-reset-button"
        onClick={() => setValue(fallbackColor)}
        title={`Reset to ${fallbackColor}`}
        style={{
          height: 34,
          padding: '0 10px',
          cursor: 'pointer',
        }}
      >
        Reset
      </button>
    </div>
  )
}

export const ResetAllColorsButton = () => {
  return (
    <div
      style={{
        marginTop: 24,
        paddingTop: 20,
        paddingBottom: 24,
        borderTop: '1px solid var(--theme-elevation-150)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={() => {
            document
              .querySelectorAll<HTMLButtonElement>('.color-reset-button')
              .forEach((button) => button.click())
          }}
          style={{
            height: 48,
            minWidth: 260,
            padding: '0 24px',
            borderRadius: 8,
            border: '1px solid #f59e0b',
            background: '#fbbf24',
            color: '#111827',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: 600,
          }}
        >
          🎨 Reset All Colors
        </button>

        <span
          style={{
            fontSize: '16px',
            color: 'var(--theme-elevation-600)',
          }}
        >
          Restore all color settings to their default values.
        </span>
      </div>

      <div style={{ height: 20 }} />
    </div>
  )
}