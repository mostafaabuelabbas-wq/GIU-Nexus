/**
 * Single source of truth for the six AI-assigned job categories.
 * Import getCategoryColor() wherever a category badge or color is needed.
 */
export const CATEGORY_COLORS = {
  'Frontend':         { bg: '#DCFCE7', text: '#15803D', dot: '#16A34A' },
  'Backend':          { bg: '#DBEAFE', text: '#1D4ED8', dot: '#2563EB' },
  'AI/ML':            { bg: '#EDE9FE', text: '#6D28D9', dot: '#7C3AED' },
  'DevOps':           { bg: '#CCFBF1', text: '#0F766E', dot: '#0D9488' },
  'Data Engineering': { bg: '#FFEDD5', text: '#C2410C', dot: '#EA580C' },
  'Other':            { bg: '#F3F4F6', text: '#4B5563', dot: '#6B7280' },
}

export const getCategoryColor = (category) =>
  CATEGORY_COLORS[category] ?? CATEGORY_COLORS['Other']
