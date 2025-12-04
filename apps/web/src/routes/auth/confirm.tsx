import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/confirm')({
  component: ConfirmPage,
})

function ConfirmPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Email Confirmation</h1>
        <p className="mt-4 text-gray-600">
          Please check your email to confirm your account.
        </p>
      </div>
    </div>
  )
}
