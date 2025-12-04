import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './Header';
import EducatorDashboard from '../Dashboard/EducatorDashboard';
import Courses from '../Courses/Courses';
import Lectures from '../Lectures/Lectures';
import ViewNotes from '../Notes/ViewNotes';
import EditNotes from '../Notes/EditNotes';
import CreateNotes from '../Notes/CreateNotes';
import Analytics from '../Analytics/Analytics';

const EducatorLayout = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <Header />

            {/* Main Content Area */}
            <main className="pt-14">
                <Routes>
                    {/* Default redirect to dashboard */}
                    <Route path="/" element={<Navigate to="/educator/dashboard" replace />} />

                    {/* Dashboard */}
                    <Route path="/dashboard" element={<EducatorDashboard />} />

                    {/* Analytics */}
                    <Route path="/analytics" element={<Analytics />} />

                    {/* Courses - All course routes are handled within the Courses component */}
                    <Route path="/courses/*" element={<Courses />} />

                    {/* Lectures */}
                    <Route path="/lectures/*" element={<Lectures />} />
                    
                    {/* Notes */}
                    <Route path="/notes/create" element={<CreateNotes />} />
                    <Route path="/notes/view/:noteId" element={<ViewNotes />} />
                    <Route path="/notes/edit/:noteId" element={<EditNotes />} />
                    
                    {/* Catch all - redirect to dashboard */}
                    <Route path="*" element={<Navigate to="/educator/dashboard" replace />} />
                </Routes>
            </main>
        </div>
    );
};

export default EducatorLayout;