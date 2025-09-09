import { Button, } from '@/components/ui/button'
import { Card, } from '@/components/ui/card'
import { useState, } from 'react'

interface LoginFormData {
  email: string
  password: string
}

export function LoginForm() {
  const [formData, setFormData,] = useState<LoginFormData>({
    email: '',
    password: '',
  },)

  const handleSubmit = (e: React.FormEvent,) => {
    e.preventDefault()
    // TODO: Implement login logic
    console.log('Login form submitted:', formData,)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>,) => {
    const { name, value, } = e.target
    setFormData(prev => ({ ...prev, [name]: value, }))
  }

  return (
    <Card className="w-full max-w-md mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <Button type="submit" className="w-full">
          Login
        </Button>
      </form>
    </Card>
  )
}
