import { useState, useEffect } from 'react';
import { facultyService } from '../../services/facultyService';
import FacultyLayout from './Layout';

const FacultyDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    pendingAssignments: 0,
    activeQuizzes: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesResponse, assignmentsResponse, quizzesResponse] = await Promise.all([
          facultyService.getCourses(),
          facultyService.getAssignments(),
          facultyService.getQuizzes()
        ]);

        const coursesData = coursesResponse.data;
        const assignmentsData = assignmentsResponse.data;
        const quizzesData = quizzesResponse.data;

        setCourses(coursesData);
        setStats({
          totalCourses: coursesData.length,
          totalStudents: coursesData.reduce((sum, course) => sum + (course.enrolledStudents || 0), 0),
          pendingAssignments: assignmentsData.filter(a => new Date(a.deadline) > new Date()).length,
          activeQuizzes: quizzesData.filter(q => new Date(q.deadline) > new Date()).length
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <FacultyLayout activeKey="home" title="Faculty Dashboard" subtitle="Your assigned courses.">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </FacultyLayout>
    );
  }

  return (
    <FacultyLayout activeKey="home" title="Faculty Dashboard" subtitle="Overview of your courses and activities.">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">Total Courses</p>
              <p className="text-3xl font-bold">{stats.totalCourses}</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3">
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium mb-1">Total Students</p>
              <p className="text-3xl font-bold">{stats.totalStudents}</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3">
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium mb-1">Pending Assignments</p>
              <p className="text-3xl font-bold">{stats.pendingAssignments}</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3">
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium mb-1">Active Quizzes</p>
              <p className="text-3xl font-bold">{stats.activeQuizzes}</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3">
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-gray-900">My Courses</h3>
            <p className="text-gray-600 mt-1">Courses you're currently teaching</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              Active
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-gray-600">Loading courses...</span>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses assigned</h3>
            <p className="text-gray-600">You don't have any courses assigned yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <div key={course.courseId} className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors duration-200 border border-gray-200 hover:border-gray-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">{course.courseName}</h4>
                    <p className="text-sm text-gray-600 mb-2">{course.courseCode}</p>
                    <p className="text-xs text-gray-500">{course.department}</p>
                  </div>
                  <div className="w-3 h-3 bg-green-400 rounded-full flex-shrink-0"></div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Semester: {course.semester}</span>
                  <span className="text-gray-600">Credits: {course.credits}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </FacultyLayout>
  );
};

export default FacultyDashboard;