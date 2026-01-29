'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  Alert,
  MenuItem,
    Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  Divider,
  Chip
} from '@mui/material';
import leadService from '../../services/leadService';

export default function CreateLeadPage() {
  const router = useRouter();
  const [duplicateError, setDuplicateError] = useState('');
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    source: '',
    status: 'new',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!form.name.trim()) return 'Name is required';
    if (!form.email.trim()) {
      return 'Email is required';
    }
    if (!form.phone.trim()) {
      return 'Phone is required';
    }
    if (!form.source) return 'Source is required';
    if (!form.status) return 'Status is required';

   

    return '';
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Duplicate detection
      const dupRes = await leadService.CheckDuplicateLead(form);
      console.log('Duplicate check response:', dupRes.data.data);
    //   const matches = dupRes.data.data.confidence > 50;
      const matches = 1;

      if (matches) {
        //   setDuplicateError(
        //         'Potential duplicate leads found. Please review before creating.'
        //     );
            setDuplicates(dupRes.data.data.matches);
            setShowDuplicateModal(true);
            setLoading(false);
            return;
      }

      const res = await leadService.createLead(form);
      router.push(`/leads/${res.data.data.lead.id}`);
    } catch {
      setError('Failed to create lead');
      setLoading(false);
    }
  };

  const createLead = async () => {
    try {
        const res = await leadService.createLead(form);
        router.push(`/leads/${res.data.data.lead.id}`);
    } catch {
        setError('Failed to create lead');
        setLoading(false);
    }
    };


  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight={600} mb={2}>
        Create Lead
      </Typography>

      <Paper sx={{ p: 3, maxWidth: 600 }}>
        <Stack spacing={2}>
          <TextField
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <TextField
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            type="email"
          />

          <TextField
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />

          <TextField
            select
            label="Source"
            name="source"
            value={form.source}
            onChange={handleChange}
            required
          >
            <MenuItem value="website">Website</MenuItem>
            <MenuItem value="referral">Referral</MenuItem>
            <MenuItem value="ads">Ads</MenuItem>
            <MenuItem value="social">Social</MenuItem>
          </TextField>

          <TextField
            select
            label="Status"
            name="status"
            value={form.status}
            onChange={handleChange}
            required
          >
            <MenuItem value="new">New</MenuItem>
            <MenuItem value="contacted">Contacted</MenuItem>
            <MenuItem value="converted">Converted</MenuItem>
            <MenuItem value="lost">Lost</MenuItem>
          </TextField>

          {error && <Alert severity="error">{error}</Alert>}
          {duplicateError && (
            <Alert severity="warning">
                {duplicateError}
            </Alert>
            )}

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
          >
            Create Lead
          </Button>
        </Stack>
      </Paper>

       <Dialog
        open={showDuplicateModal}
        onClose={() => setShowDuplicateModal(false)}
        maxWidth="md"
        fullWidth
        >
        <DialogTitle>Possible Duplicate Leads Found</DialogTitle>

        <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
            These leads closely match the information you entered. Please review
            before proceeding.
            </Alert>

            <Stack spacing={2}>
            {duplicates.map((lead) => (
                <Paper
                key={lead.id}
                variant="outlined"
                sx={{ p: 2 }}
                >
                <Stack direction="row" spacing={3} alignItems="flex-start">
                    {/* Confidence */}
                    <Box width={120}>
                    <Typography variant="caption" fontWeight={600}>
                        {lead.confidence}% Match
                    </Typography>

                    <LinearProgress
                        variant="determinate"
                        value={lead.confidence}
                        color={
                        lead.confidence >= 80
                            ? 'error'
                            : lead.confidence >= 60
                            ? 'warning'
                            : 'success'
                        }
                        sx={{ height: 6, borderRadius: 3, mt: 0.5 }}
                    />
                    </Box>

                    {/* Lead Details */}
                    <Box flex={1}>
                    <Typography fontWeight={600}>{lead.name}</Typography>

                    {lead.email && (
                        <Typography variant="body2">
                        <strong>Email:</strong> {lead.email}
                        </Typography>
                    )}

                    {lead.phone && (
                        <Typography variant="body2">
                        <strong>Phone:</strong> {lead.phone}
                        </Typography>
                    )}

                    <Divider sx={{ my: 1 }} />

                    {/* Matched Fields */}
                    <Typography variant="caption" fontWeight={600}>
                        Matched Fields
                    </Typography>

                    <Stack direction="row" spacing={1} flexWrap="wrap" mt={0.5}>
                        {lead.matchedOn.map((field: string) => (
                        <Chip
                            key={field}
                            label={field}
                            size="small"
                            color="warning"
                            variant="outlined"
                        />
                        ))}
                    </Stack>
                    </Box>
                </Stack>
                </Paper>
            ))}
            </Stack>

            <Typography
            variant="caption"
            color="text.secondary"
            mt={2}
            display="block"
            >
            You can still create the lead and resolve duplicates later if needed.
            </Typography>
        </DialogContent>

        <DialogActions>
            <Button
            onClick={() => setShowDuplicateModal(false)}
            color="inherit"
            >
            Cancel
            </Button>

            <Button
            variant="contained"
            color="warning"
            onClick={() => {
                setShowDuplicateModal(false);
                createLead();
            }}
            >
            Create Anyway
            </Button>
        </DialogActions>
        </Dialog>



    </Box>

  );
}
