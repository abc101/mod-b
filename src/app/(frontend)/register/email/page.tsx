import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import RegisterForm from './RegisterForm'

export default async function EmailRegisterPage() {
  const cookieStore = await cookies()
  const accepted = cookieStore.get('registration_terms_accepted')?.value

  if (accepted !== 'true') {
    redirect('/register/terms')
  }

  return <RegisterForm />
}