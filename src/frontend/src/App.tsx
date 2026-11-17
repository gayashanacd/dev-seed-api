import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Header from "./components/Header"
import Footer from "./components/Footer"
import Home from "./pages/Home"
import Docs from "./pages/Docs"
import NotFound from "./pages/NotFound"
import DocsLayout from "./layouts/DocsLayout"
import "./App.css"
import ScrollToHash from "./components/ScrollToHash"
import Seo from "./components/Seo"

/**
 * Router-agnostic app shell: wrapped in BrowserRouter in the browser (App) and in
 * StaticRouter at build time (entry-server.tsx) for prerendering.
 * New routes must also be listed in getIndexableRoutes() in seo.ts to be prerendered;
 * otherwise the server answers them with the 404 page.
 */
export const AppShell = () => (
  <>
    <Seo />
    <ScrollToHash />
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <Header />

      <div className="flex-1">
        <Routes>
          {/* Home stays clean */}
          <Route path="/" element={<Home />} />

          {/* Docs layout only for docs routes */}
          <Route path="/docs" element={<DocsLayout />}>
            <Route index element={<Navigate to="/docs/core/users" replace />} />
            <Route path=":domain/:entity" element={<Docs />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      <Footer />
    </div>
  </>
)

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}

export default App
