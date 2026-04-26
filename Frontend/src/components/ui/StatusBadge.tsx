import { Badge } from 'native-base';

const STATUS_COLOR_MAP: Record<string, string> = {
  Pending: 'warning',
  'In Progress': 'info',
  Resolved: 'success',
  Completed: 'success',
  Cancelled: 'muted',
  Available: 'success',
  Distributed: 'muted',
  Requested: 'info',
};

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => (
  <Badge
    variant="subtle"
    colorScheme={STATUS_COLOR_MAP[status] || 'gray'}
    borderRadius="full"
    px={3}
    py={1}
  >
    {status}
  </Badge>
);

