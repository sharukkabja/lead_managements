'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
} from '@mui/material';
import leadService from '../../services/leadService';

/* ================= TYPES ================= */

interface AssignedUser {
  id: number;
  name: string;
}

interface Activity {
  id: number;
  date: string;
  type: string;
  message: string;
  createdAt: string;
  activities:[];
}

interface Lead {
  id: number;
  name: string;
  email: string;
  phone?: string;
  status: string;
  source?: string;
  assignedUser?: AssignedUser | null;
  updatedAt: string;
  activities: Activity[];
}

/* Allowed status transitions */
const STATUS_TRANSITIONS: Record<string, string[]> = {
  new: ['contacted', 'lost'],
  contacted: ['qualified', 'lost'],
  qualified: ['converted', 'lost'],
  converted: [],
  lost: [],
};

/* ================= COMPONENT ================= */

export default function LeadDetailPage() {
  const { id } = useParams();
  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusError, setStatusError] = useState<string>('');

  useEffect(() => {
    fetchLead();
  }, [id]);

  const fetchLead = async () => {
    try {
      setLoading(true);
      const res = await leadService.getLeadById(id);
      console.log('Lead data:', res.data.data);
      setLead(res.data.data.lead);
      setActivities(res.data.data.activities);
    } catch (error) {
      console.error('Failed to fetch lead', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
  if (!lead) return;

  const allowed = STATUS_TRANSITIONS[lead.status] || [];
  if (!allowed.includes(newStatus)) {
    setStatusError(
      `Invalid status transition from "${lead.status}" to "${newStatus}"`
    );
    return;
  }

  setStatusError('');

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];

  const newActivity = {
    id: Date.now(),
    type: 'status_change',
    message: `Status changed to ${newStatus}`,
    createdAt: now.toISOString(),
    createdBy: null,
  };

  // 1️⃣ Optimistically update lead info ONLY
  setLead({
    ...lead,
    status: newStatus,
    updatedAt: now.toISOString(),
  });

  // 2️⃣ Optimistically update timeline (REAL-TIME)
  setActivities((prev) => {
    const index = prev.findIndex((g) => g.date === dateStr);

    if (index !== -1) {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        activities: [newActivity, ...updated[index].activities],
      };
      return updated;
    }

    return [{ date: dateStr, activities: [newActivity] }, ...prev];
  });

  try {
    await leadService.updateStatus(lead.id, newStatus);
  } catch (error) {
    console.error('Failed to update status', error);
    // optional rollback here
  }
};


  // Group activities by date
const activitiesByDate = useMemo(() => {
  if (!lead) return {};
  
  // Ensure activities is always an array
  const activities = lead.activities || [];

  return activities.reduce<Record<string, Activity[]>>((acc, activity) => {
    const date = new Date(activity.createdAt).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(activity);
    return acc;
  }, {});
}, [lead]);


  if (loading || !lead) return <Typography>Loading...</Typography>;

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight={600} mb={2}>
        Lead Detail
      </Typography>

      {/* Lead Info */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack spacing={1}>
          <Typography><strong>Name:</strong> {lead.name}</Typography>
          <Typography><strong>Email:</strong> {lead.email}</Typography>
          {lead.phone && <Typography><strong>Phone:</strong> {lead.phone}</Typography>}
          <Typography><strong>Source:</strong> {lead.source || '-'}</Typography>
          <Typography>
            <strong>Assigned User:</strong> {lead.assignedUser?.name || '-'}
          </Typography>
          <Typography>
            <strong>Status:</strong>{' '}
            <Chip
              label={lead.status}
              color={
                lead.status === 'converted'
                  ? 'success'
                  : lead.status === 'lost'
                  ? 'error'
                  : 'default'
              }
              size="small"
            />
          </Typography>
        </Stack>
      </Paper>

      {/* Change Status */}
      <FormControl size="small" sx={{ mb: 2, minWidth: 200 }}>
        <InputLabel>Change Status</InputLabel>
        <Select
          value={lead.status}
          label="Change Status"
          onChange={(e) => handleStatusChange(e.target.value)}
        >
          {Object.keys(STATUS_TRANSITIONS).map((status) => (
            <MenuItem key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {statusError && <Alert severity="error" sx={{ mb: 2 }}>{statusError}</Alert>}

    {/* Activity Timeline */}
<Typography variant="h6" mb={1}>
  Activity Timeline
</Typography>

{activities
  // Sort descending by date
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  .map((group) => (
    <Box key={group.date} sx={{ mb: 2 }}>
      <Typography variant="subtitle2" color="text.secondary">
        {group.date}
      </Typography>
      <Stack spacing={1} sx={{ ml: 2 }}>
        {group.activities.map((activity) => (
          <Paper key={activity.id} sx={{ p: 1 }}>
            <Typography variant="body2">
              <strong>{activity.type ? activity.type.replace('_', ' ') : 'Activity'}:</strong>{' '}
              {activity.message || '-'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(activity.createdAt).toLocaleTimeString()}
              {activity.createdBy ? ` | By: ${activity.createdBy.name}` : ''}
            </Typography>
          </Paper>
        ))}
      </Stack>
    </Box>
  ))}

    </Box>
  );
}
