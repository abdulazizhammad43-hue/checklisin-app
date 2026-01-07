import { useState, useEffect, useCallback } from 'react';
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
import CameraCapture from '../components/CameraCapture';
import { defectService } from '../services/api';

// Column definitions - now a function to receive handlers
const createColumns = (onDelete) => [
  {
    id: 'no',
    header: 'No',
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: 'name',
    header: 'Defect',
  },
  {
    accessorKey: 'defect_type',
    header: 'Komponen Struktur',
  },
  {
    accessorKey: 'lantai',
    header: 'Lantai',
  },
  {
    accessorKey: 'as_location',
    header: 'As',
    cell: ({ row }) => (
      <div className="whitespace-nowrap">{row.getValue('as_location')}</div>
    ),
  },
  {
    accessorKey: 'created_by_name',
    header: 'Pekerja',
    cell: ({ row }) => (
      <div className="whitespace-nowrap">{row.original.created_by_username || '-'}</div>
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => {
      return (
        <button
          className="flex items-center gap-1 font-medium hover:text-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          {column.getIsSorted() === "asc" ? " ↑" : column.getIsSorted() === "desc" ? " ↓" : ""}
        </button>
      );
    },
    cell: ({ row }) => {
      const status = row.getValue('status');
      return (
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
            status === 'Finish'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
          }`}
        >
          {status}
        </span>
      );
    },
  },
  {
    id: 'actions',
    header: 'Aksi',
    cell: ({ row }) => {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(row.original.id);
          }}
          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
          title="Hapus"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </button>
      );
    },
  },
];

function HomePage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState('before');
  const [selectedRow, setSelectedRow] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    defect_type: '',
    lantai: '',
    as_location: '',
    status: 'On Progress',
    before_photo: null,
    after_photo: null,
    notification_time: ''
  });

  // Fetch defects on mount
  useEffect(() => {
    fetchDefects();
  }, []);

  // Check for notifications every 5 seconds
  useEffect(() => {
    const checkNotifications = async () => {
      try {
        const response = await defectService.getPendingNotifications();
        if (response.data.success) {
          setNotifications(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchDefects = async () => {
    try {
      setLoading(true);
      const response = await defectService.getAll();
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching defects:', error);
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

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus defect ini?')) return;
    
    try {
      await defectService.delete(id);
      await fetchDefects();
    } catch (error) {
      console.error('Error deleting defect:', error);
      alert('Gagal menghapus defect');
    }
  };

  const handleDismissNotification = async (id) => {
    try {
      await defectService.markNotified(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  const handleRowClick = (row) => {
    setSelectedRow(row.original);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedRow(null);
  };

  const handleAddNew = () => {
    setIsModalOpen(true);
  };

  const handleOpenCamera = (mode) => {
    setCameraMode(mode);
    if (mode === 'after') {
      setIsDetailOpen(false);
    }
    setIsCameraOpen(true);
  };

  const handleCapturePhoto = async (photoDataUrl) => {
    if (cameraMode === 'before') {
      setFormData({ ...formData, before_photo: photoDataUrl });
    } else if (cameraMode === 'after' && selectedRow) {
      try {
        await defectService.updateAfterPhoto(selectedRow.id, photoDataUrl);
        setSelectedRow({ ...selectedRow, after_photo: photoDataUrl });
        await fetchDefects();
        setIsDetailOpen(true);
      } catch (error) {
        console.error('Error uploading after photo:', error);
        alert('Gagal mengupload foto after');
      }
    }
    setIsCameraOpen(false);
  };

  const handleStatusChange = async (newStatus) => {
    if (selectedRow) {
      try {
        await defectService.updateStatus(selectedRow.id, newStatus);
        setSelectedRow({ ...selectedRow, status: newStatus });
        await fetchDefects();
      } catch (error) {
        console.error('Error updating status:', error);
        alert('Gagal mengupdate status');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.defect_type || !formData.lantai || !formData.as_location) {
      alert('Harap lengkapi semua field!');
      return;
    }
    
    if (!formData.before_photo) {
      alert('Harap ambil foto Before terlebih dahulu!');
      return;
    }
    
    try {
      await defectService.create({
        name: formData.name,
        defect_type: formData.defect_type,
        lantai: formData.lantai,
        as_location: formData.as_location,
        before_photo: formData.before_photo,
        notification_time: formData.notification_time ? parseInt(formData.notification_time) : null
      });
      
      setIsModalOpen(false);
      setFormData({
        name: '',
        defect_type: '',
        lantai: '',
        as_location: '',
        status: 'On Progress',
        before_photo: null,
        after_photo: null,
        notification_time: ''
      });
      await fetchDefects();
    } catch (error) {
      console.error('Error creating defect:', error);
      alert('Gagal menambahkan defect');
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setFormData({
      name: '',
      defect_type: '',
      lantai: '',
      as_location: '',
      status: 'On Progress',
      before_photo: null,
      after_photo: null,
      notification_time: ''
    });
  };

  // Create columns with delete handler
  const columns = createColumns(handleDelete);

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
            <p className="text-xs sm:text-sm md:text-base text-blue-100">Selamat datang {localStorage.getItem('username') || 'User'}</p>
          </div>
          <div className="flex gap-2 items-center w-full sm:w-auto justify-end">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-white hover:bg-blue-800 rounded-md transition-colors active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {notifications.length}
                  </span>
                )}
              </button>
              
              {/* Notification Dropdown */}
              {showNotifications && (
                <>
                  {/* Backdrop for mobile */}
                  <div 
                    className="fixed inset-0 z-40 sm:hidden" 
                    onClick={() => setShowNotifications(false)}
                  />
                  <div className="fixed left-2 right-2 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 w-auto sm:w-80 bg-white rounded-lg shadow-lg border z-50">
                    <div className="p-3 border-b flex justify-between items-center">
                      <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Notifikasi</h3>
                      <button 
                        onClick={() => setShowNotifications(false)}
                        className="text-gray-400 hover:text-gray-600 sm:hidden text-xl"
                      >
                        ×
                      </button>
                    </div>
                    <div className="max-h-[60vh] sm:max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          Tidak ada notifikasi
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div key={notif.id} className="p-3 border-b hover:bg-gray-50 active:bg-gray-100 flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-800 text-sm truncate">{notif.name}</p>
                              <p className="text-xs sm:text-sm text-gray-500">
                                {notif.defect_type} - Lantai {notif.lantai}
                              </p>
                              <p className="text-xs text-yellow-600 mt-1">⚠️ Pekerjaan belum selesai!</p>
                            </div>
                            <button
                              onClick={() => handleDismissNotification(notif.id)}
                              className="text-gray-400 hover:text-gray-600 ml-2 p-1"
                            >
                              ✕
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <Button 
              onClick={() => navigate('/members')}
              variant="outline"
              className="bg-blue-800 text-white border-blue-700 hover:bg-blue-700 text-xs sm:text-sm px-2 sm:px-4 py-2 active:scale-95"
            >
              <span className="hidden sm:inline">👥 Members</span>
              <span className="sm:hidden">👥</span>
            </Button>
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="bg-white text-blue-900 hover:bg-gray-100 text-xs sm:text-sm px-2 sm:px-4 py-2 active:scale-95"
            >
              <span className="hidden sm:inline">Logout</span>
              <span className="sm:hidden">↩</span>
            </Button>
          </div>
        </div>

      <Card className="bg-white">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl">Daftar Pekerjaan Defect</CardTitle>
              <CardDescription className="text-sm">List Pekerjaan Defect Struktur</CardDescription>
            </div>
            <Button onClick={handleAddNew} className="bg-blue-900 text-white hover:bg-blue-800 w-full sm:w-auto text-sm sm:text-base">Tambah Pekerjaan</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="flex items-center gap-2">
              <input
                placeholder="Mau cari apa..."
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
                        onClick={() => handleRowClick(row)}
                        className="cursor-pointer hover:bg-blue-50"
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
                        Tidak ada.
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

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-white rounded-t-2xl sm:rounded-lg w-full sm:max-w-md max-h-[85vh] sm:max-h-[90vh] flex flex-col">
            <div className="p-4 sm:p-6 border-b flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-bold">Tambah Pekerjaan Baru</h2>
              <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600 text-2xl sm:hidden">×</button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Defect</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2.5 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              <div>
                <label className="block text-sm font-medium mb-1">Komponen Struktur</label>
                <select
                  required
                  value={formData.defect_type}
                  onChange={(e) => setFormData({ ...formData, defect_type: e.target.value })}
                  className="w-full px-3 py-2.5 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih Komponen</option>
                  <option value="Kolom">Kolom</option>
                  <option value="Balok">Balok</option>
                  <option value="Pelat">Pelat</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Lantai</label>
                <input
                  type="text"
                  required
                  value={formData.lantai}
                  onChange={(e) => setFormData({ ...formData, lantai: e.target.value })}
                  className="w-full px-3 py-2.5 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">As</label>
                <input
                  type="text"
                  required
                  value={formData.as_location}
                  onChange={(e) => setFormData({ ...formData, as_location: e.target.value })}
                  className="w-full px-3 py-2.5 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <input
                  type="text"
                  value="On Progress"
                  disabled
                  className="w-full px-3 py-2.5 text-base border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Set Notification</label>
                <select
                  value={formData.notification_time}
                  onChange={(e) => setFormData({ ...formData, notification_time: e.target.value })}
                  className="w-full px-3 py-2.5 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tidak ada notifikasi</option>
                  <option value="10">10 detik (test)</option>
                  <option value="86400">1 hari</option>
                  <option value="172800">2 hari</option>
                  <option value="259200">3 hari</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Foto Before</label>
                <div className="space-y-2">
                  {formData.before_photo ? (
                    <div className="relative">
                      <img src={formData.before_photo} alt="Before" className="w-full h-40 sm:h-48 object-cover rounded-md border" />
                      <Button 
                        type="button"
                        onClick={() => handleOpenCamera('before')}
                        variant="outline"
                        className="mt-2 w-full py-2.5 active:scale-[0.98]"
                      >
                        📷 Ambil Ulang Foto
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      type="button"
                      onClick={() => handleOpenCamera('before')}
                      className="w-full bg-blue-600 text-white hover:bg-blue-700 py-3 active:scale-[0.98]"
                    >
                      📷 Ambil Foto Before
                    </Button>
                  )}
                </div>
              </div>
            </form>
            </div>
            <div className="flex gap-2 p-4 sm:p-6 pt-3 sm:pt-4 border-t bg-white rounded-b-lg safe-area-bottom">
              <Button type="button" variant="outline" onClick={handleCancel} className="flex-1 py-2.5 active:scale-[0.98] hidden sm:flex">
                Batal
              </Button>
              <Button onClick={handleSubmit} className="flex-1 bg-blue-900 text-white hover:bg-blue-800 py-2.5 active:scale-[0.98]">
                Simpan
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Camera Component */}
      <CameraCapture
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCapturePhoto}
      />

      {/* Detail Drawer */}
      {isDetailOpen && selectedRow && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50" onClick={handleCloseDetail}>
          <div 
            className="bg-white rounded-t-2xl sm:rounded-lg p-4 sm:p-6 w-full sm:max-w-2xl max-h-[85vh] sm:max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-blue-900">Detail Pekerjaan</h2>
              <button 
                onClick={handleCloseDetail}
                className="text-gray-500 hover:text-gray-700 text-2xl p-1"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">No</p>
                  <p className="text-base sm:text-lg font-semibold">{selectedRow.id}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">Status</p>
                  <span
                    className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                      selectedRow.status === 'Finish'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {selectedRow.status}
                  </span>
                </div>
              </div>

              <div className="border-t pt-3 sm:pt-4">
                <p className="text-xs sm:text-sm text-gray-500 font-medium">Nama</p>
                <p className="text-base sm:text-lg font-semibold mt-1">{selectedRow.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 border-t pt-3 sm:pt-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">Defect</p>
                  <p className="text-base sm:text-lg mt-1">{selectedRow.defect_type}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">Lantai</p>
                  <p className="text-base sm:text-lg mt-1">{selectedRow.lantai}</p>
                </div>
              </div>

              <div className="border-t pt-3 sm:pt-4">
                <p className="text-xs sm:text-sm text-gray-500 font-medium">As</p>
                <p className="text-base sm:text-lg mt-1">{selectedRow.as_location}</p>
              </div>

              {/* Photo Section */}
              <div className="border-t pt-3 sm:pt-4 space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-2 sm:mb-3">Dokumentasi Foto</h3>
                
                {/* Before Photo */}
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium mb-2">Foto Before</p>
                  {selectedRow.before_photo ? (
                    <div className="border rounded-lg overflow-hidden">
                      <img 
                        src={selectedRow.before_photo} 
                        alt="Before" 
                        className="w-full h-48 sm:h-64 object-cover"
                      />
                    </div>
                  ) : (
                    <div className="border-2 border-dashed rounded-lg p-6 sm:p-8 text-center text-gray-400 text-sm">
                      <p>Tidak ada foto</p>
                    </div>
                  )}
                </div>

                {/* After Photo */}
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium mb-2">Foto After</p>
                  {selectedRow.after_photo ? (
                    <div className="border rounded-lg overflow-hidden">
                      <img 
                        src={selectedRow.after_photo} 
                        alt="After" 
                        className="w-full h-48 sm:h-64 object-cover"
                      />
                    </div>
                  ) : selectedRow.status === 'On Progress' ? (
                    <div className="space-y-2">
                      <div className="border-2 border-dashed rounded-lg p-6 sm:p-8 text-center text-gray-400 text-sm">
                        <p>Belum ada foto after</p>
                      </div>
                      <Button 
                        onClick={() => handleOpenCamera('after')}
                        className="w-full bg-blue-600 text-white hover:bg-blue-700 py-3 active:scale-[0.98]"
                      >
                        📷 Ambil Foto After
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed rounded-lg p-6 sm:p-8 text-center text-gray-400 text-sm">
                      <p>Tidak ada foto</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t pt-4 mt-4 sm:mt-6 space-y-2 sm:space-y-3 pb-4 safe-area-bottom">
                {/* Status Change Button - Only show if On Progress and has After Photo */}
                {selectedRow.status === 'On Progress' && selectedRow.after_photo && (
                  <Button 
                    onClick={() => handleStatusChange('Finish')}
                    className="w-full bg-green-600 text-white hover:bg-green-700 py-3 active:scale-[0.98]"
                  >
                    ✓ Tandai Selesai
                  </Button>
                )}
                
                <Button 
                  onClick={handleCloseDetail}
                  className="w-full bg-gray-600 text-white hover:bg-gray-700 py-3 active:scale-[0.98]"
                >
                  Tutup
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
