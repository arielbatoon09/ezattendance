'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Network, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type IpRule = {
  id: string;
  ip_address: string;
  is_enabled: boolean;
  created_at: string;
};

export default function Settings() {
  const router = useRouter();
  const [ipRules, setIpRules] = useState<IpRule[]>([]);
  const [newIpAddress, setNewIpAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch IP rules
  const fetchIpRules = async () => {
    try {
      const response = await fetch('/api/attendance/ip-rule');
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setIpRules(data.rules);
    } catch (error) {
      console.log('Error fetching IP rules:', error);
      setError('Failed to fetch IP rules');
    }
  };

  useEffect(() => {
    fetchIpRules();
  }, []);

  // Add new IP rule
  const handleAddIpRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIpAddress) return;

    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/attendance/ip-rule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ip_address: newIpAddress }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add IP rule');
      }

      setNewIpAddress('');
      fetchIpRules();
    } catch (error) {
      console.log('Error adding IP rule:', error);
      setError(error instanceof Error ? error.message : 'Failed to add IP rule');
    } finally {
      setLoading(false);
    }
  };

  // Toggle IP rule status
  const handleToggleStatus = async (ip_address: string, currentStatus: boolean) => {
    try {
      setError(null);
      const response = await fetch('/api/attendance/ip-rule', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ip_address, is_enabled: !currentStatus }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update IP rule');
      }

      fetchIpRules();
    } catch (error) {
      console.log('Error toggling IP rule status:', error);
      setError(error instanceof Error ? error.message : 'Failed to update IP rule');
    }
  };

  // Delete IP rule
  const handleDeleteIpRule = async (ip_address: string) => {
    try {
      setError(null);
      const response = await fetch('/api/attendance/ip-rule', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ip_address }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete IP rule');
      }

      fetchIpRules();
    } catch (error) {
      console.log('Error deleting IP rule:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete IP rule');
    }
  };

  return (
    <section className="min-h-screen bg-black/95">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 p-6">
        <div className="flex items-center gap-3">
          <Network className="h-auto w-10 text-white" />
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-white">Settings</h1>
            <p className="text-sm text-white/60">IP Rules Management</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push('/view-attendance')}
          className="border-white/20 bg-white/10 text-white hover:bg-white/20"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <div className="p-6">
        <div className="space-y-6">
          {/* Add IP Rule Form */}
          <div className="rounded-lg border border-white/10 bg-white/5 p-6 space-y-3">
            <h2 className="mb-4 text-lg font-semibold text-white">Add New IP Rule</h2>
            <form onSubmit={handleAddIpRule} className="flex gap-4">
              <Input
                type="text"
                placeholder="Enter IP address (e.g., 192.168.1.1)"
                value={newIpAddress}
                onChange={(e) => setNewIpAddress(e.target.value)}
                className="flex-1 border-white/20 bg-white/10 text-white placeholder:text-white/40"
              />
              <Button
                type="submit"
                disabled={loading || !newIpAddress}
                variant="outline"
                size="lg"
              >
                Add IP Rule
              </Button>
            </form>
            {error && (
              <p className="mt-2 text-sm text-red-400">{error}</p>
            )}
            <Button variant="outline" onClick={async () => {
              const res = await fetch('https://ipinfo.io/json');
              const data = await res.json();
              setNewIpAddress(data.ip);
            }}>Get Network IP Address</Button>
          </div>

          {/* IP Rules Table */}
          <div className="rounded-lg border border-white/10">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-white/5">
                  <TableHead className="text-white">IP Address</TableHead>
                  <TableHead className="text-white">Added Date</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-right text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ipRules.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-white/60"
                    >
                      No IP rules found. Add one to start restricting attendance marking.
                    </TableCell>
                  </TableRow>
                ) : (
                  ipRules.map((rule) => (
                    <TableRow
                      key={rule.id}
                      className="border-white/10 hover:bg-white/5"
                    >
                      <TableCell className="font-mono text-white">
                        {rule.ip_address}
                      </TableCell>
                      <TableCell className="text-white">
                        {new Date(rule.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${
                            rule.is_enabled
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {rule.is_enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant={rule.is_enabled ? 'destructive' : 'default'}
                            size="sm"
                            onClick={() => handleToggleStatus(rule.ip_address, rule.is_enabled)}
                            className={rule.is_enabled ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
                          >
                            {rule.is_enabled ? 'Disable' : 'Enable'}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteIpRule(rule.ip_address)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </section>
  );
} 