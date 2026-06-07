import { useState, useEffect } from 'react';
import { facultyService } from '../../services/facultyService';
import FacultyLayout from './Layout';

const GradeCenter = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [marksData, setMarksData] = useState({});

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await facultyService.getCourses();
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleCourseSelect = async (course) => {
    setSelectedCourse(course);
    // Assume we have an endpoint to get enrolled students, but for now, mock or assume.
    // Since no endpoint, perhaps enter manually.
    // For simplicity, allow entering student regNo and marks.
  };

  const handleEnterMarks = async (e) => {
    e.preventDefault();
    const { studentRegNo, evaluationType, marksObtained, maxMarks } = marksData;
    try {
      await facultyService.enterMarks({
        courseId: selectedCourse.courseId,
        studentRegNo,
        evaluationType,
        marksObtained: parseInt(marksObtained),
        maxMarks: parseInt(maxMarks),
      });
      alert('Marks entered successfully');
      setMarksData({});
    } catch (error) {
      console.error('Error entering marks:', error);
    }
  };

  return (
    <FacultyLayout activeKey="grades" title="Grade Center" subtitle="Enter CAT and assessment marks for your courses.">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Grade Center</h2>
          <p className="text-gray-600 mt-1">Enter and manage student assessment marks</p>
        </div>
      </div>

      {/* Course Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-indigo-100 rounded-lg p-2">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Select Course</h3>
            <p className="text-gray-600 text-sm">Choose a course to enter marks for</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map(course => (
            <div
              key={course.courseId}
              onClick={() => handleCourseSelect(course)}
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                selectedCourse?.courseId === course.courseId
                  ? 'border-indigo-500 bg-indigo-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  selectedCourse?.courseId === course.courseId ? 'bg-indigo-500' : 'bg-gray-300'
                }`}></div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{course.courseName}</h4>
                  <p className="text-sm text-gray-600">{course.courseCode}</p>
                  <p className="text-xs text-gray-500 mt-1">{course.department}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No courses available</h3>
            <p className="mt-1 text-sm text-gray-500">You don't have any courses assigned yet.</p>
          </div>
        )}
      </div>

      {/* Enter Marks Form */}
      {selectedCourse && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-indigo-100 rounded-lg p-2">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Enter Marks for {selectedCourse.courseName}</h3>
              <p className="text-gray-600 text-sm">Record assessment marks for individual students</p>
            </div>
          </div>

          <form onSubmit={handleEnterMarks} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Student Registration No</label>
                <input
                  type="text"
                  placeholder="e.g., 12345"
                  value={marksData.studentRegNo || ''}
                  onChange={(e) => setMarksData({ ...marksData, studentRegNo: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Evaluation Type</label>
                <select
                  value={marksData.evaluationType || ''}
                  onChange={(e) => setMarksData({ ...marksData, evaluationType: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                >
                  <option value="">Select Type</option>
                  <option value="CAT">CAT</option>
                  <option value="Quiz">Quiz</option>
                  <option value="Assignment">Assignment</option>
                  <option value="Project">Project</option>
                  <option value="Lab">Lab Work</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Marks Obtained</label>
                <input
                  type="number"
                  placeholder="0"
                  min="0"
                  step="0.5"
                  value={marksData.marksObtained || ''}
                  onChange={(e) => setMarksData({ ...marksData, marksObtained: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Marks</label>
                <input
                  type="number"
                  placeholder="100"
                  min="1"
                  value={marksData.maxMarks || ''}
                  onChange={(e) => setMarksData({ ...marksData, maxMarks: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Percentage:</span>
                <span className="font-semibold text-gray-900">
                  {marksData.marksObtained && marksData.maxMarks
                    ? `${((parseFloat(marksData.marksObtained) / parseFloat(marksData.maxMarks)) * 100).toFixed(1)}%`
                    : '—'
                  }
                </span>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setMarksData({})}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Clear
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium"
              >
                Enter Marks
              </button>
            </div>
          </form>

          {/* Recent Entries */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Recent Entries</h4>
            <div className="text-sm text-gray-500 text-center py-4">
              Recent marks entries will appear here
            </div>
          </div>
        </div>
      )}
    </FacultyLayout>
  );
};

export default GradeCenter;