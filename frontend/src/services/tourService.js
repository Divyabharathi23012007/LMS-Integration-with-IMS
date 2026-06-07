// Tour configuration for different pages and user roles
export const TOUR_CONFIGS = {
  // Student Dashboard Tour
  studentDashboard: {
    id: 'student-dashboard',
    steps: [
      {
        target: '[data-tour="greeting"]',
        title: 'Personalized Greeting',
        content: 'We greet you personally and show your current academic information here.',
        icon: 'waving_hand',
        iconBg: 'rgba(16, 185, 129, 0.1)',
        iconColor: '#16a34a',
      },
      {
        target: '[data-tour="notifications"]',
        title: 'Notifications',
        content: 'Stay updated with important announcements and notifications. The red dot indicates unread items.',
        icon: 'notifications',
        iconBg: 'rgba(239, 68, 68, 0.1)',
        iconColor: '#ef4444',
      },
      {
        target: '[data-tour="stat-cards"]',
        title: 'Quick Stats',
        content: 'View your attendance, pending assignments, and overdue tasks at a glance.',
        icon: 'dashboard',
        iconBg: 'rgba(245, 158, 11, 0.1)',
        iconColor: '#f59e0b',
      },
      {
        target: '[data-tour="marks-snapshot"]',
        title: 'Marks Performance',
        content: 'Track your academic performance across different courses with visual charts.',
        icon: 'grade',
        iconBg: 'rgba(139, 92, 246, 0.1)',
        iconColor: '#8b5cf6',
      },
      {
        target: '[data-tour="enrolled-courses"]',
        title: 'Your Courses',
        content: 'See all your enrolled courses with attendance tracking and faculty information.',
        icon: 'auto_stories',
        iconBg: 'rgba(236, 72, 153, 0.1)',
        iconColor: '#ec4899',
      },
      {
        target: '[data-tour="calendar"]',
        title: 'Calendar View',
        content: 'Your personal calendar showing assignment deadlines and important dates.',
        icon: 'calendar_month',
        iconBg: 'rgba(14, 165, 233, 0.1)',
        iconColor: '#0ea5e9',
      },
      {
        target: '[data-tour="pending-assignments"]',
        title: 'Pending Assignments',
        content: 'Quick view of assignments that need your attention with due dates.',
        icon: 'assignment',
        iconBg: 'rgba(168, 85, 247, 0.1)',
        iconColor: '#a855f7',
      },
    ],
  },

  // Login Page Tour
  login: {
    id: 'login',
    steps: [
      {
        target: '[data-tour="login-form"]',
        title: 'Welcome Back!',
        content: 'Enter your credentials to access your learning management system.',
        icon: 'login',
        iconBg: 'rgba(13, 127, 242, 0.1)',
        iconColor: '#0d7ff2',
      },
      {
        target: '[data-tour="role-selection"]',
        title: 'Select Your Role',
        content: 'Choose your role (Student, Faculty, Admin, or Coordinator) to access the appropriate dashboard.',
        icon: 'group',
        iconBg: 'rgba(16, 185, 129, 0.1)',
        iconColor: '#16a34a',
      },
      {
        target: '[data-tour="remember-me"]',
        title: 'Stay Logged In',
        content: 'Check this option to remain logged in for faster access next time.',
        icon: 'bookmark',
        iconBg: 'rgba(245, 158, 11, 0.1)',
        iconColor: '#f59e0b',
      },
    ],
  },

  // Study Material Page Tour
  studyMaterial: {
    id: 'study-material',
    steps: [
      {
        target: '[data-tour="course-selector"]',
        title: 'Course Selection',
        content: 'Select a course to view its study materials and resources.',
        icon: 'menu_book',
        iconBg: 'rgba(13, 127, 242, 0.1)',
        iconColor: '#0d7ff2',
      },
      {
        target: '[data-tour="material-filters"]',
        title: 'Filter Materials',
        content: 'Filter study materials by type, date, or subject to find what you need quickly.',
        icon: 'filter_list',
        iconBg: 'rgba(139, 92, 246, 0.1)',
        iconColor: '#8b5cf6',
      },
      {
        target: '[data-tour="download-section"]',
        title: 'Download Resources',
        content: 'Download study materials for offline access and future reference.',
        icon: 'download',
        iconBg: 'rgba(16, 185, 129, 0.1)',
        iconColor: '#16a34a',
      },
    ],
  },

  // Assignments Page Tour
  assignments: {
    id: 'assignments',
    steps: [
      {
        target: '[data-tour="assignment-list"]',
        title: 'Your Assignments',
        content: 'View all your assignments with due dates, status, and submission requirements.',
        icon: 'assignment',
        iconBg: 'rgba(13, 127, 242, 0.1)',
        iconColor: '#0d7ff2',
      },
      {
        target: '[data-tour="submission-status"]',
        title: 'Track Progress',
        content: 'See which assignments are submitted, pending, or overdue at a glance.',
        icon: 'task_alt',
        iconBg: 'rgba(16, 185, 129, 0.1)',
        iconColor: '#16a34a',
      },
      {
        target: '[data-tour="upload-area"]',
        title: 'Submit Work',
        content: 'Upload your completed assignments here before the deadline.',
        icon: 'upload_file',
        iconBg: 'rgba(245, 158, 11, 0.1)',
        iconColor: '#f59e0b',
      },
    ],
  },
};

// Tour service for managing tour logic
export class TourService {
  constructor() {
    this.tourHistory = this.loadTourHistory();
  }

  loadTourHistory() {
    try {
      const saved = localStorage.getItem('tourHistory');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }

  saveTourHistory() {
    localStorage.setItem('tourHistory', JSON.stringify(this.tourHistory));
  }

  getTourConfig(tourId) {
    return TOUR_CONFIGS[tourId] || null;
  }

  shouldShowTour(tourId, userRole) {
    // Don't show tour if user has already completed it
    if (this.tourHistory[tourId]) {
      return false;
    }

    // Check if tour is available for user role
    const config = this.getTourConfig(tourId);
    if (!config) {
      return false;
    }

    // Role-specific logic can be added here
    return true;
  }

  markTourCompleted(tourId) {
    this.tourHistory[tourId] = {
      completed: true,
      completedAt: new Date().toISOString(),
    };
    this.saveTourHistory();
  }

  resetTour(tourId) {
    delete this.tourHistory[tourId];
    this.saveTourHistory();
  }

  resetAllTours() {
    this.tourHistory = {};
    this.saveTourHistory();
  }

  getTourStats() {
    const totalTours = Object.keys(TOUR_CONFIGS).length;
    const completedTours = Object.keys(this.tourHistory).filter(
      key => this.tourHistory[key].completed
    ).length;
    
    return {
      total: totalTours,
      completed: completedTours,
      percentage: totalTours > 0 ? Math.round((completedTours / totalTours) * 100) : 0,
    };
  }
}

// Singleton instance
export const tourService = new TourService();

// Helper function to start tour based on current route
export function startTourForRoute(route, userRole = 'student') {
  const routeToTourMap = {
    '/student/dashboard': 'studentDashboard',
    '/login': 'login',
    '/student/study-material': 'studyMaterial',
    '/student/assignments': 'assignments',
  };

  const tourId = routeToTourMap[route];
  if (tourId && tourService.shouldShowTour(tourId, userRole)) {
    return tourService.getTourConfig(tourId);
  }
  
  return null;
}
