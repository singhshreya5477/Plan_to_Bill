/**
 * @typedef {Object} ProjectMetrics
 * @property {string} range - Metric range (e.g., "0-10")
 * @property {number} taskCount - Number of tasks
 */

/**
 * @typedef {Object} Assignee
 * @property {string} id - Assignee ID
 * @property {string} name - Assignee name
 * @property {string} avatar - Assignee avatar (initials or URL)
 */

/**
 * @typedef {Object} Project
 * @property {string} id - Unique project identifier
 * @property {string} name - Project name (e.g., "RD Services")
 * @property {string} coverImage - Cover image URL
 * @property {string[]} tags - Project tags/categories (e.g., ["Service", "Customer Care"])
 * @property {number} priority - Priority level (star rating, 1-5)
 * @property {string} date - Project date (e.g., "21/03/22")
 * @property {string} description - Project description
 * @property {number} progress - Progress percentage (0-100)
 * @property {ProjectMetrics} metrics - Project metrics
 * @property {Assignee} assignee - Project manager/owner
 * @property {string} color - Project theme color (hex)
 * @property {string} status - Project status ('planned' | 'in_progress' | 'completed' | 'on_hold')
 * @property {number} budget - Project budget
 * @property {number} spent - Amount spent
 * @property {number} revenue - Revenue generated
 * @property {string} deadline - Deadline date
 * @property {string} manager - Project manager name
 * @property {string[]} team - Team member names
 * @property {number} images - Number of images
 * @property {number} tasks - Number of tasks
 */

/**
 * @typedef {Object} ProjectCardProps
 * @property {Project} project - Project data
 */

export const ProjectTypes = {};
