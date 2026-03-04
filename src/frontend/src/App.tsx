import { BrowserRouter, Routes, Route } from "react-router-dom"
import Header from "./components/Header"
import Footer from "./components/Footer"
import Home from "./pages/Home"
import Docs from "./pages/Docs"
import DocsLayout from "./layouts/DocsLayout"
import "./App.css"
import ScrollToHash from "./components/ScrollToHash"

function App() {
  return (
    <BrowserRouter>
      <ScrollToHash />
      <div className="flex flex-col min-h-screen">
        <Header />

        <div className="flex-1">
          <Routes>
            {/* Home stays clean */}
            <Route path="/" element={<Home />} />

            {/* Docs layout only for docs routes */}
            <Route path="/docs" element={<DocsLayout />}>
              <Route path=":domain/:entity" element={<Docs />} />
            </Route>
          </Routes>
        </div>

        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App