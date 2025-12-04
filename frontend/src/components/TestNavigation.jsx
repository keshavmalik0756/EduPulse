import React from 'react';
import { useNavigate } from 'react-router-dom';

const TestNavigation = () => {
  const navigate = useNavigate();

  const testCourses = [
    { id: '1', title: 'React Fundamentals' },
    { id: '2', title: 'Node.js Backend Development' },
    { id: '3', title: 'MongoDB Database Design' },
    { id: 'test123', title: 'Test Course' }
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Test Course Navigation</h1>
        <p className="text-gray-600 mb-8">
          Click on any course below to test the ViewCourse component routing to <code>/course/:id</code>
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.title}</h3>
              <p className="text-gray-600 mb-4">Course ID: {course.id}</p>
              <button
                onClick={() => {
                  console.log(`Navigating to /course/${course.id}`);
                  navigate(`/course/${course.id}`);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                View Course
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Direct URL Testing</h3>
          <p className="text-blue-800 mb-2">You can also test by directly visiting these URLs:</p>
          <ul className="list-disc list-inside text-blue-700 space-y-1">
            {testCourses.map((course) => (
              <li key={course.id}>
                <code className="bg-blue-100 px-2 py-1 rounded">
                  http://localhost:5173/course/{course.id}
                </code>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6">
          <button
            onClick={() => navigate('/courses')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            ← Back to Courses
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestNavigation;