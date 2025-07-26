import React from 'react'
import WorkoutHeader from '../components/workouts/WorkoutHeader';
import WorkoutList from '../components/workouts/WorkoutList';
import WorkoutCalendar from '../components/workouts/WorkoutCalendar';

const Workouts = () => {
    return (
        <div>
            <WorkoutHeader />
            <WorkoutList />
            <WorkoutCalendar />
        </div>
    )
}

export default Workouts;