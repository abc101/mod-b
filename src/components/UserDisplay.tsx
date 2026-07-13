import Link from 'next/link'

type Props = {
  user: any
  anonymousAuthor?: string
  link?: boolean
}

export default function UserDisplay({
  user,
  anonymousAuthor,
  link = true,
}: Props) {
  if (!user) {
    return <>{anonymousAuthor || 'Anonymous'}</>
  }

  const name = user.nickname || user.name || 'User'

  if (user.isDeleted) {
    return (
      <>
        <del>{name}</del> (Deleted)
      </>
    )
  }

  if (!link) {
    return <>{name}</>
  }

  return (
    <Link href={`/u/${encodeURIComponent(user.nickname)}`} className="hover:underline">
      {name}
    </Link>
  )
}