import { useState, useEffect } from 'react';
import { facultyService } from '../../services/facultyService';
import FacultyLayout from './Layout';

const UploadMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    courseId: '',
    title: '',
    file: null,
    videoLink: '',
  });

  useEffect(() => {
    fetchMaterials();
    fetchCourses();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await facultyService.getMaterials();
      setMaterials(response.data);
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await facultyService.getCourses();
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key]) data.append(key, formData[key]);
    });
    try {
      await facultyService.uploadMaterial(data);
      fetchMaterials();
      setFormData({ courseId: '', title: '', file: null, videoLink: '' });
    } catch (error) {
      console.error('Error uploading material:', error);
    }
  };

  return (
    <FacultyLayout activeKey="materials" title="Upload Study Materials" subtitle="Share files and video links with your students.">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Study Materials</h2>
          <p className="text-gray-600 mt-1">Upload files and share resources with your students</p>
        </div>
      </div>

      {/* Upload Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-10">
        <div className="flex items-center space-x-3 mb-8">
          <div className="bg-green-100 rounded-lg p-3">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Upload New Material</h3>
            <p className="text-gray-600 text-sm">Share files or video links with your students</p>
          </div>
        </div>

        <form onSubmit={handleUpload} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
              <select
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              >
                <option value="">Select Course</option>
                {courses.map(course => (
                  <option key={course.courseId} value={course.courseId}>
                    {course.courseName} ({course.courseCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Material Title</label>
              <input
                type="text"
                placeholder="Enter material title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">File Upload (Optional)</label>
              <input
                type="file"
                onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">Supported formats: PDF, DOC, PPT, XLS, etc.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Video Link (Optional)</label>
              <input
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={formData.videoLink}
                onChange={(e) => setFormData({ ...formData, videoLink: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">YouTube, Vimeo, or direct video links</p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setFormData({ courseId: '', title: '', file: null, videoLink: '' })}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Clear
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
            >
              Upload Material
            </button>
          </div>
        </form>
      </div>

      {/* Materials List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Uploaded Materials</h3>
          <p className="text-gray-600 text-sm mt-1">All your shared study materials</p>
        </div>

        <div className="divide-y divide-gray-200">
          {materials.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No materials uploaded yet</h3>
              <p className="mt-1 text-sm text-gray-500">Upload your first study material to get started.</p>
            </div>
          ) : (
            materials.map(material => (
              <div key={material.materialId} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-100 rounded-lg p-2">
                        {material.videoLink ? (
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900">{material.title}</h4>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                          <span>{material.courseName || 'Course'}</span>
                          <span>Uploaded {new Date(material.uploadDate || Date.now()).toLocaleDateString()}</span>
                          {material.videoLink && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              Video
                            </span>
                          )}
                        </div>
                        {material.videoLink && (
                          <div className="mt-2">
                            <a
                              href={material.videoLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                            >
                              {material.videoLink}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Published
                    </span>
                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </FacultyLayout>
  );
};

export default UploadMaterials;