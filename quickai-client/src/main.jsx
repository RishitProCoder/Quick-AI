import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.jsx"
import 'prismjs/themes/prism-tomorrow.css' // VS Code-like theme
import './styles/prism-overrides.css'       // your overrides
import { BrowserRouter } from "react-router-dom"
import { ClerkProvider } from "@clerk/clerk-react"
import { AppContextProvider } from "./context/AppContext.jsx" // import your context provider

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

createRoot(document.getElementById("root")).render(
  <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
    <BrowserRouter>
      <AppContextProvider>
        <App />
      </AppContextProvider>
    </BrowserRouter>
  </ClerkProvider>
)
