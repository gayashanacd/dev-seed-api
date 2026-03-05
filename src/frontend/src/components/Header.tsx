import { Link, useLocation } from "react-router-dom"
import { Github, Sun, Moon } from "lucide-react"
import { useState, useEffect } from "react"

const Header = () => {
  const location = useLocation()
  const [dark, setDark] = useState(false)

  const linkStyle = (path: string) =>
    `px-3 hover:underline ${
      location.pathname === path ? "font-semibold underline" : ""
    }`

  // Toggle dark mode
  const toggleDark = () => {
    const newMode = !dark
    setDark(newMode)

    if (newMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  useEffect(() => {
    if (dark) document.documentElement.classList.add("dark")
  }, [])

  return (
    <header className="bg-blue-600 text-white dark:bg-gray-900 dark:text-gray-100 p-4">
      <div className="container mx-auto flex items-center justify-between">

        {/* Logo */}
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Link to="/">DevSeed API</Link>

          {/* Version badge */}
          <span className="text-xs bg-white text-blue-600 px-2 py-1 rounded">
            v1
          </span>
        </h1>

        <nav className="flex items-center gap-5">

          <Link to="/" className={linkStyle("/")}>
            Home
          </Link>

          <Link to="/docs/core/users" className={linkStyle("/docs/core/users")}>
            Docs
          </Link>

          {/* GitHub stars */}
          <a
            href="https://github.com/gayashanacd/dev-seed-api"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 border border-white px-3 py-1 rounded hover:bg-white hover:text-blue-600 transition"
          >
            <Github size={18} />
            Star
          </a>

          {/* Dark mode toggle */}
          <button
            onClick={toggleDark}
            className="hover:text-gray-200"
          >
            {dark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

        </nav>
      </div>
    </header>
  )
}

export default Header