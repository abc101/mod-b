type Props = {
  as?: 'div' | 'li'
  icon?: string
  title?: string
  message?: string
  className?: string
}

export default function EmptyState({
  as = 'div',
  icon,
  title,
  message = 'No posts yet.',
  className = '',
}: Props) {
  const Component = as

  return (
    <Component
      className={`py-12 text-center text-gray-400 ${className}`}
    >
      {icon && <p className="text-4xl mb-4">{icon}</p>}

      {title && (
        <p className="text-sm font-medium text-gray-500">
          {title}
        </p>
      )}

      {message && (
        <p className={title ? 'text-sm mt-1' : 'text-sm'}>
          {message}
        </p>
      )}
    </Component>
  )
}