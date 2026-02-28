
const Header = () => {
  return (
    <header id="home" className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex items-center justify-between">
        <h1 className="text-xl font-bold">DevSeed API</h1>
        <nav>
          <a href="#home" className="px-3 hover:underline">Home</a>
          <a href="#docs" className="px-3 hover:underline">Docs</a>
        </nav>
      </div>
    </header>
  )
}

export default Header