export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'OPEN': return 'bg-green-100 text-green-800';
    case 'CLOSED': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getCategoryColor = (category: string) => {
  switch (category) {
    case 'CORPORATE_LAW': return 'bg-blue-100 text-blue-800';
    case 'CRIMINAL_LAW': return 'bg-red-100 text-red-800';
    case 'FAMILY_LAW': return 'bg-purple-100 text-purple-800';
    case 'REAL_ESTATE': return 'bg-green-100 text-green-800';
    case 'INTELLECTUAL_PROPERTY': return 'bg-indigo-100 text-indigo-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};