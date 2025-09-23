/**
 * Static highlights describing platform capabilities.
 * @returns {Promise<{title: string, description: string}[]>}
 */
export async function getHighlights() {
  return [
    { title: 'Guided Courses', description: 'Curated learning paths with scaffolded quizzes.' },
    { title: 'Progress Tracking', description: 'Resume lessons seamlessly across devices.' },
    { title: 'Certificates', description: 'Celebrate course completion with shareable awards.' }
  ];
}
