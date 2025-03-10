import { Link, useNavigate } from "react-router-dom"
import logo from "../assets/images/logo.jpeg"
import saudiFlag from "../assets/images/Flag-Saudi-Arabia.webp"
import defaultProfilePic from "../assets/images/default-profile-pic.png"
import { useAuth } from "../context/AuthContext"

export function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="w-full bg-white shadow-sm">
      <div className="mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <img
                src={logo}
                alt="REFDK Logo"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <img
                src={saudiFlag}
                alt="Saudi Flag"
                width={32}
                height={32}
                className="w-8 h-8"
              />
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="nav-link">
              Home
            </Link>
            <Link to="/join" className="nav-link">
              Join Our Team
            </Link>
            {user ?
              user.role === 'volunteer' ? (
                <>
                  <Link to="/institution-engagement" className="nav-link">
                    Institution Engagement
                  </Link>
                  <Link to="/institutions" className="nav-link">
                    Charity Center
                  </Link>
                  <Link to="/events" className="nav-link">
                    Events
                  </Link>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 text-gray-700 hover:text-[#397260]"
                  >
                    <img
                      src={user.profilePic || defaultProfilePic}
                      className="w-8 h-8 rounded-full object-cover"
                      alt="Profile"
                    />
                    <span>{user.name}</span>
                  </Link>
  
                  <button
                    onClick={() => {
                      logout()
                      navigate("/")
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/admin/institution-engagement" className="nav-link">
                    Institution Engagement
                  </Link>
                  <Link to="/admin/institutions" className="nav-link">
                    Charity Center
                  </Link>
                  <Link to="/admin/events" className="nav-link">
                    Events
                  </Link>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 text-gray-700 hover:text-[#397260]"
                  >
                    <img
                      src={user.profilePic || defaultProfilePic}
                      className="w-8 h-8 rounded-full object-cover"
                      alt="Profile"
                    />
                    <span>{user.name}</span>
                  </Link>
  
                  <button
                    onClick={() => {
                      logout()
                      navigate("/")
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    Logout
                  </button>
                </>
              ) 
             : (
              <Link to="/login" className="nav-link text-emerald-700">
                Login
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
