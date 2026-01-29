'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Pagination,
  Stack,
  Button 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import leadService from '../services/leadService';

/* ================= TYPES ================= */

interface AssignedUser {
  id: number;
  name: string;
}

interface Lead {
  id: number;
  name: string;
  email: string;
  status: string;
  source?: string;
  assignedUser?: AssignedUser | null;
  updatedAt: string;
}

/* ================= COMPONENT ================= */

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async (): Promise<void> => {
    try {
      setLoading(true);
      const res = await leadService.getLeads();
      setLeads(res.data.data.rows);
    } catch (error) {
      console.error('Failed to fetch leads', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const statusMatch =
        statusFilter === 'all' ? true : lead.status === statusFilter;
      const sourceMatch =
        sourceFilter === 'all' ? true : lead.source === sourceFilter;
      return statusMatch && sourceMatch;
    });
  }, [leads, statusFilter, sourceFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLeads.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLeads, currentPage]);

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight={600} mb={2}>
        Leads
      </Typography>

      {/* Filters */}
      <Stack direction="row" spacing={2} mb={2}>
        <FormControl size="small">
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1); // Reset page on filter change
            }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="new">New</MenuItem>
            <MenuItem value="contacted">Contacted</MenuItem>
            <MenuItem value="lost">Lost</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small">
          <InputLabel>Source</InputLabel>
          <Select
            value={sourceFilter}
            label="Source"
            onChange={(e) => {
              setSourceFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="website">Website</MenuItem>
            <MenuItem value="referral">Referral</MenuItem>
            <MenuItem value="ads">Ads</MenuItem>
            <MenuItem value="social">Social</MenuItem>
          </Select>
        </FormControl>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push('/leads/new')}
          >
            Create New Lead
          </Button>

      </Stack>

  

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Assigned User</TableCell>
              <TableCell>Last Activity</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedLeads.map((lead) => (
              <TableRow
                key={lead.id}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => router.push(`/leads/${lead.id}`)}
              >
                <TableCell>{lead.name}</TableCell>
                <TableCell>{lead.email}</TableCell>
                <TableCell>
                  <Chip
                    label={lead.status}
                    size="small"
                    color={
                      lead.status === 'converted'
                        ? 'success'
                        : lead.status === 'lost'
                        ? 'error'
                        : 'default'
                    }
                  />
                </TableCell>
                <TableCell>{lead.source || '-'}</TableCell>
                <TableCell>{lead.assignedUser?.name || '-'}</TableCell>
                <TableCell>
                  {new Date(lead.updatedAt).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}

            {!loading && filteredLeads.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No leads found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {totalPages > 1 && (
        <Stack mt={2} alignItems="center">
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => setCurrentPage(page)}
            color="primary"
          />
        </Stack>
      )}
    </Box>
  );
}
