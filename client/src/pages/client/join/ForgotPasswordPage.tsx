import { useState } from "react"
import { Link } from "react-router-dom"
import { authService } from "../../../services/authService"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"


export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await authService.forgotPassword(email)
      if (response.data.success) {
        toast.success("Password reset link sent to your email!", { autoClose: 1500 })
      } else {
        toast.error(response.data.message || "Failed to send reset link")
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-md mx-auto pt-16 pb-24 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#397260] mb-4">
            Reset Your Password
          </h1>
          <p className="text-gray-600">
            Enter your email to receive a reset link
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white p-8 rounded-xl shadow-sm"
        >
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          {message && (
            <div className="p-3 bg-green-100 text-green-700 rounded-lg">
              {message}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#397260]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#397260] text-white p-3 rounded-lg hover:bg-[#2c5846] disabled:bg-gray-400"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

          <div className="text-center mt-4">
            <Link
              to="/login"
              className="text-[#397260] hover:text-[#2c5846] text-sm"
            >
              Back to Login
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}
