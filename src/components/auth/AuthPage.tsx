import { useState } from 'react'
import { LoginForm } from './LoginForm'
import { SignUpForm } from './SignUpForm'
import { FileText } from 'lucide-react'

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)

  const toggleMode = () => {
    setIsLogin(!isLogin)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center">
            <FileText className="h-10 w-10 text-primary-600" />
            <span className="ml-2 text-3xl font-bold text-gray-900">OrçaFácil</span>
          </div>
        </div>
        <p className="mt-4 text-center text-gray-600">
          Crie orçamentos profissionais de forma simples e rápida
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {isLogin ? (
          <LoginForm onToggleMode={toggleMode} />
        ) : (
          <SignUpForm onToggleMode={toggleMode} />
        )}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          © 2024 OrçaFácil. Todos os direitos reservados.
        </p>
      </div>
    </div>
  )
}