import React from 'react'
import DashboardHeader from '../components/dashboard/DashboardHeader';
import RecentWorkouts from '../components/dashboard/RecentWorkouts';
import ProgressChart from '../components/dashboard/ProgressChart';

const Home = () => {
    return (
        <>
            <DashboardHeader />
            <RecentWorkouts />
            <ProgressChart />
        </>
    )
}

export default Home;