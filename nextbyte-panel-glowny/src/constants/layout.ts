// Layout constants for mobile responsive design
export const LAYOUT_CONSTANTS = {
  MOBILE: {
    HEADER: {
      DEFAULT: 48, // Standard mobile header height
      DASHBOARD: 60, // Dashboard mobile header with extra content
      COMPACT: 44, // Compact header for chat/focused views
    },
    BREAKPOINTS: {
      MOBILE: 768,
      TABLET: 1024,
    },
    PADDING: {
      MOBILE: '12px',
      TABLET: '16px',
      DESKTOP: '24px',
    },
    CHAT: {
      CONTAINER_OFFSET: {
        MOBILE: 60, // Header + bottom padding
        TABLET: 80,
        DESKTOP: 100,
      },
    },
  },
} as const;

// Route-specific header heights
export const ROUTE_HEADER_HEIGHTS = {
  '/panel-glowny': LAYOUT_CONSTANTS.MOBILE.HEADER.DASHBOARD,
  '/dashboard': LAYOUT_CONSTANTS.MOBILE.HEADER.DASHBOARD,
  '/chat': LAYOUT_CONSTANTS.MOBILE.HEADER.COMPACT,
  '/kalendarz': LAYOUT_CONSTANTS.MOBILE.HEADER.DEFAULT,
  default: LAYOUT_CONSTANTS.MOBILE.HEADER.DEFAULT,
} as const;

// Calendar-specific constants
export const CALENDAR_CONSTANTS = {
  MOBILE: {
    TOUCH_TARGET_SIZE: 48, // Increased for better touch (min 44px Apple HIG)
    EVENT_MIN_HEIGHT: 18, // ~15 min visual height (70/60*15≈18)
    DRAG_HANDLE_SIZE: 32, // Larger drag handles for easier interaction
    BUTTON_SPACING: 12, // More spacing between buttons
    SIDE_PADDING: 12, // Optimized side padding
    HOUR_HEIGHT: 70, // Taller hours for better touch precision
    TIME_COLUMN_WIDTH: 64, // Wider time column for better visibility
    WEEK_COLUMN_WIDTH: 120, // Minimum width for week view columns
  },
  TABLET: {
    TOUCH_TARGET_SIZE: 40,
    EVENT_MIN_HEIGHT: 14, // ~15 min visual height (55/60*15≈14)
    DRAG_HANDLE_SIZE: 20,
    BUTTON_SPACING: 6,
    SIDE_PADDING: 20,
    HOUR_HEIGHT: 55,
    TIME_COLUMN_WIDTH: 64,
  },
  DESKTOP: {
    TOUCH_TARGET_SIZE: 32,
    EVENT_MIN_HEIGHT: 13, // ~15 min visual height (50/60*15≈13)
    DRAG_HANDLE_SIZE: 16,
    BUTTON_SPACING: 4,
    SIDE_PADDING: 24,
    HOUR_HEIGHT: 50,
    TIME_COLUMN_WIDTH: 72,
  },
} as const;