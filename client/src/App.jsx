// Generic
import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
// Context
import { AppContextProvider, useAppContext } from './context/AppContext'
// Pages
import Home from './user_pages/Home'
import Workouts from './user_pages/Workouts'
import Routines from './user_pages/Routines'
// Sub pages
import WorkoutsCreate from './user_pages/WorkoutsCreate'
import WorkoutsHistory from './components/workouts/WorkoutHistory'
import WorkoutHistoryExercise from './components/workouts/WorkoutHistoryExercise'
import WorkoutEdit from './components/workouts/WorkoutEdit'
// Common
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'
import Register from './components/common/Register'

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
                    <Route path="/dashboard" element={<Home />} />
                    <Route path="/workouts" element={<Workouts />} />
                    <Route path="/workouts/create" element={<WorkoutsCreate />} />
                    <Route path="/workouts/edit/:id" element={<WorkoutEdit />} />
                    <Route path="/workouts/history" element={<WorkoutsHistory />} />
                    <Route path="/workouts/history/:id" element={<WorkoutHistoryExercise />} />
                    <Route path="/routines" element={<Routines />} />
                    <Route path="/register" element={<Register />} />
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