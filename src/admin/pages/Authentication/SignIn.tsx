import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import logoImg from '/logo.png'

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Заполните все поля')
      return
    }
    const success = login(email, password)
    if (success) {
      navigate('/admin')
    } else {
      setError('Неверный email или пароль')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg border border-stroke bg-white p-8 shadow-default">
        <div className="mb-8 flex flex-col items-center">
          <img src={logoImg} alt="Линия Вкуса" className="mb-4 h-16 w-auto" />
          <h2 className="text-2xl font-bold text-black">
            Вход в админ-панель
          </h2>
          <p className="mt-1 text-sm text-gray-500">Линия Вкуса — управление каталогом</p>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-2.5 block font-medium text-black">
              Email
            </label>
            <input
              type="email"
              placeholder="admin@lvkusa.ru"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none"
            />
          </div>

          <div className="mb-6">
            <label className="mb-2.5 block font-medium text-black">
              Пароль
            </label>
            <input
              type="password"
              placeholder="Введите пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none"
            />
          </div>

          <div className="mb-5">
            <button
              type="submit"
              className="w-full cursor-pointer rounded-lg border border-primary bg-primary p-4 text-white transition hover:bg-opacity-90"
            >
              Войти
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SignIn
