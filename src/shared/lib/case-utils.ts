/**
 * Case-related utility functions
 */

const categoryOptions = [
  { value: "all", label: "All" },
  { value: "EMPLOYMENT_LAW", label: "Employment Law" },
  { value: "FAMILY_LAW", label: "Family Law" },
  { value: "COMMERCIAL_LAW", label: "Commercial" },
  { value: "INTELLECTUAL_PROPERTY", label: "Intellectual Property" },
  { value: "CRIMINAL_LAW", label: "Criminal Law" },
  { value: "CIVIL_LAW", label: "Civil Law" },
  { value: "CORPORATE_LAW", label: "Corporate Law" },
];

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Created today";
  if (diffDays === 1) return "Created 1 day ago";
  if (diffDays < 7) return `Created ${diffDays} days ago`;
  if (diffDays < 14) return "Created 1 week ago";
  if (diffDays < 30) return `Created ${Math.floor(diffDays / 7)} weeks ago`;
  return `Created ${Math.floor(diffDays / 30)} months ago`;
};

export const getCategoryLabel = (category: string): string => {
  const option = categoryOptions.find((opt) => opt.value === category);
  return (
    option?.label ||
    category
      .split("_")
      .map(
        (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
      )
      .join(" ")
  );
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'OPEN': return 'bg-green-100 text-green-800';
    case 'CLOSED': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'OPEN': return 'Open';
    case 'CLOSED': return 'Closed';
    default: return status;
  }
};

export const getPriorityLabel = (priority: number): string => {
  switch (priority) {
    case 1: return 'Low';
    case 2: return 'Medium';
    case 3: return 'High';
    case 4: return 'Urgent';
    default: return 'Medium';
  }
};

export const getPriorityColor = (priority: number): string => {
  switch (priority) {
    case 1: return 'text-gray-600';
    case 2: return 'text-blue-600';
    case 3: return 'text-orange-600';
    case 4: return 'text-red-600';
    default: return 'text-blue-600';
  }
};

export const caseFilterOptions = {
  categories: categoryOptions,
  statuses: [
    { value: "all", label: "All Status" },
    { value: "OPEN", label: "Open" },
    { value: "CLOSED", label: "Closed" },
  ],
  sortOptions: [
    { value: "newest", label: "Newest first" },
    { value: "oldest", label: "Oldest first" },
    { value: "priority", label: "Priority" },
    { value: "title", label: "Title A-Z" },
  ],
};