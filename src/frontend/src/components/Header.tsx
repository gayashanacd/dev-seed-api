import { Link, useLocation } from "react-router-dom"

const Header = () => {
  const location = useLocation()

  const linkStyle = (path: string) =>
    `px-3 hover:underline ${
      location.pathname === path ? "font-semibold underline" : ""
    }`

  return (
    <header className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex items-center justify-between">
        <h1 className="text-xl font-bold">
          <Link to="/">DevSeed API</Link>
        </h1>

        <nav>
          <Link to="/" className={linkStyle("/")}>
            Home
          </Link>

          <Link to="/docs/core/users" className={linkStyle("/docs/core/users")}>
            Docs
          </Link>
        </nav>
      </div>
    </header>
  )
}

export default Header