import Header from "./components/Header"
import Footer from "./components/Footer"
import Home from "./pages/Home"
import Docs from "./pages/Docs"

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1">
        <Home />
        <Docs />
      </div>
      <Footer />
    </div>
  )
}

export default App