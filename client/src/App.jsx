// Generic
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
// Context
import { AppContextProvider } from './context/AppContext'
// Pages
import Home from './user_pages/Home'
// Common
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'

function App() {
    return (
        <Router>
            <AppContextProvider>
                <div className="app">
                    <Navbar />
                    <main className="main-content">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            {/* Add more routes here as needed */}
                        </Routes>
                    </main>
                    <Footer />
                </div>
            </AppContextProvider>
        </Router>
    )
}

export default App