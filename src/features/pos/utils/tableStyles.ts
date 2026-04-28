export function getStatusColor(status: string) {
  switch (status) {
    case 'available':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100';
    case 'occupied':
      return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100';
    case 'reserved':
      return 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
}

export function getStatusDot(status: string) {
  switch (status) {
    case 'available':
      return 'bg-emerald-500';
    case 'occupied':
      return 'bg-red-500';
    case 'reserved':
      return 'bg-amber-500';
    default:
      return 'bg-gray-400';
  }
}
