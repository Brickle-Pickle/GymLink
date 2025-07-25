// Generic
import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
// Context
import { AppContextProvider, useAppContext } from './context/AppContext'
// Pages
import Home from './user_pages/Home'
// Common
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'

// Create a separate component for the app content
function AppContent() {
    const { location } = useAppContext();

    useEffect(() => {
        scrollTo(0, 0);
    }, [location]);

    return (
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
    );
}

function App() {
    return (
        <Router>
            <AppContextProvider>
                <AppContent />
            </AppContextProvider>
        </Router>
    )
}

export default App