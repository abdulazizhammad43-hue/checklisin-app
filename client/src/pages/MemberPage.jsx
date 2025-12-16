import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { memberService } from '../services/api';

// Get current user role
const getCurrentUserRole = () => {
  return localStorage.getItem('userRole') || 'Staff';
};

// Column definitions
const columns = [
  {
    id: 'no',
    header: 'No',
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: 'username',
    header: 'Username',
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      const role = row.getValue('role');
      return (
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
            role === 'Manager'
              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
          }`}
        >
          {role}
        </span>
      );
    },
  },
];

function MemberPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteUsername, setInviteUsername] = useState('');
  const [inviteError, setInviteError] = useState('');

  const currentUserRole = getCurrentUserRole();
  const canInvite = currentUserRole === 'Manager';

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await memberService.getAll();
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    setInviteError('');
    
    if (!inviteUsername) {
      setInviteError('Harap masukkan username!');
      return;
    }

    try {
      const response = await memberService.invite(inviteUsername);
      if (response.data.success) {
        setIsInviteModalOpen(false);
        setInviteUsername('');
        await fetchMembers();
      }
    } catch (error) {
      setInviteError(error.response?.data?.error || 'Gagal menambahkan member');
    }
  };

  const handleCancelInvite = () => {
    setIsInviteModalOpen(false);
    setInviteUsername('');
    setInviteError('');
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  return (
    <div className="min-h-screen bg-blue-950">
      <div className="container mx-auto p-3 sm:p-6 md:p-8 space-y-3 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <div className="text-white">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Checklisin Yuk!</h1>
            <p className="text-xs sm:text-sm md:text-base text-blue-100 flex flex-wrap items-center gap-1">
              <span>Selamat datang {localStorage.getItem('username') || 'User'}</span>
              <span className={`px-2 py-0.5 rounded text-xs ${
                currentUserRole === 'Manager' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-blue-500 text-white'
              }`}>
                {currentUserRole}
              </span>
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              onClick={handleBackToHome}
              variant="outline"
              className="flex-1 sm:flex-none bg-blue-800 text-white border-blue-700 hover:bg-blue-700 text-xs sm:text-sm px-3 py-2"
            >
              ← Kembali
            </Button>
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="flex-1 sm:flex-none bg-white text-blue-900 hover:bg-gray-100 text-xs sm:text-sm px-3 py-2"
            >
              Logout
            </Button>
          </div>
        </div>

        <Card className="bg-white">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-lg sm:text-xl">Daftar Member</CardTitle>
                <CardDescription className="text-sm">List anggota tim proyek</CardDescription>
              </div>
              {canInvite ? (
                <Button 
                  onClick={() => setIsInviteModalOpen(true)} 
                  className="bg-blue-900 text-white hover:bg-blue-800 w-full sm:w-auto text-sm sm:text-base"
                >
                  + Invite Member
                </Button>
              ) : (
                <div className="text-sm text-gray-500 italic">
                  Hanya Manager yang dapat invite member
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search */}
              <div className="flex items-center gap-2">
                <input
                  placeholder="Cari member..."
                  value={globalFilter ?? ''}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="w-full sm:max-w-sm px-3 py-2 border border-input rounded-md bg-background text-sm"
                />
              </div>

              {/* Table */}
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          className="hover:bg-blue-50"
                          data-state={row.getIsSelected() && 'selected'}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center"
                        >
                          Tidak ada member.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
                  {Math.min(
                    (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                    table.getFilteredRowModel().rows.length
                  )}{' '}
                  of {table.getFilteredRowModel().rows.length} entries
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="flex-1 sm:flex-none"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="flex-1 sm:flex-none"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invite Modal - Only for Manager */}
      {isInviteModalOpen && canInvite && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Invite Member Baru</h2>
            </div>
            <form onSubmit={handleInviteSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={inviteUsername}
                  onChange={(e) => setInviteUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan username member (harus sudah terdaftar)"
                />
                <p className="text-xs text-gray-500 mt-1">User harus dibuat dulu di Admin Page</p>
              </div>
              {inviteError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-md text-sm">
                  {inviteError}
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCancelInvite} className="flex-1">
                  Batal
                </Button>
                <Button type="submit" className="flex-1 bg-blue-900 text-white hover:bg-blue-800">
                  Invite
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MemberPage;
