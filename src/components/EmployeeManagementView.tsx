import React, { useState } from 'react';
import { 
  UserCheck, Shield, KeyRound, Plus, Search, Trash2, Edit3, RotateCcw,
  CheckSquare, Square, Store, Mail, Phone, Lock
} from 'lucide-react';
import { Employee, UserRole, Branch } from '../types';
import { INITIAL_EMPLOYEES, INITIAL_BRANCHES } from '../data/initialData';

interface EmployeeManagementViewProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  branches: Branch[];
  userRole: UserRole;
}

export const EmployeeManagementView: React.FC<EmployeeManagementViewProps> = ({
  employees,
  setEmployees,
  branches,
  userRole
}) => {
  const [showTrash, setShowTrash] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [nip, setNip] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('KASIR');
  const [branchId, setBranchId] = useState(branches[0]?.id || 'b1');
  const [pin, setPin] = useState('1234');

  const filteredEmployees = employees.filter(e => {
    const trashMatch = showTrash ? e.isDeleted : !e.isDeleted;
    const searchMatch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        e.nip.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        e.phone.includes(searchTerm);
    return trashMatch && searchMatch;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredEmployees.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredEmployees.map(e => e.id));
    }
  };

  const toggleSelectId = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(i => i !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const handleSoftDelete = (id: string) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, isDeleted: true } : e));
  };

  const handleRestore = (id: string) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, isDeleted: false } : e));
  };

  const handleBulkSoftDelete = () => {
    if (showTrash) {
      if (confirm(`Hapus PERMANEN ${selectedIds.length} karyawan?`)) {
        setEmployees(prev => prev.filter(e => !selectedIds.includes(e.id)));
        setSelectedIds([]);
      }
    } else {
      if (confirm(`Pindahkan ${selectedIds.length} karyawan ke Tong Sampah?`)) {
        setEmployees(prev => prev.map(e => selectedIds.includes(e.id) ? { ...e, isDeleted: true } : e));
        setSelectedIds([]);
      }
    }
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const empObj: Employee = {
      id: `emp-${Date.now()}`,
      nip: nip.trim() || `EMP-${Math.floor(100 + Math.random() * 900)}`,
      name: name.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@fruitkasir.id`,
      phone: phone.trim() || '0812-3456-7890',
      role,
      branchId,
      pin: pin.trim() || '1234',
      avatarUrl: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 100)}?w=150&auto=format&fit=crop&q=80`
    };
    setEmployees(prev => [...prev, empObj]);
    setName('');
    setNip('');
    setEmail('');
    setPhone('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-indigo-600" />
            Data Karyawan & Hak Akses User
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manajemen akun pengguna kasir, admin, owner, cabang penugasan, dan PIN otorisasi transaksi.
          </p>
        </div>

        {userRole === 'OWNER' && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Tambah Karyawan Baru
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAddEmployee} className="bg-indigo-50 border border-indigo-200 p-4 rounded-2xl space-y-3">
          <h4 className="font-bold text-xs text-indigo-900">Form Karyawan / User Baru</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Nama Lengkap Karyawan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-xs p-2.5 bg-white border border-indigo-300 rounded-xl outline-none"
              required
            />
            <input
              type="text"
              placeholder="NIP (misal: KSR-005)"
              value={nip}
              onChange={(e) => setNip(e.target.value)}
              className="text-xs p-2.5 bg-white border border-indigo-300 rounded-xl outline-none"
            />
            <input
              type="text"
              placeholder="No. Telepon / WA"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="text-xs p-2.5 bg-white border border-indigo-300 rounded-xl outline-none"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="text-xs p-2.5 bg-white border border-indigo-300 rounded-xl font-bold outline-none"
            >
              <option value="KASIR">Kasir POS</option>
              <option value="ADMIN">Admin Manager</option>
              <option value="OWNER">Owner (Akses Penuh)</option>
            </select>

            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="text-xs p-2.5 bg-white border border-indigo-300 rounded-xl outline-none"
            >
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>

            <input
              type="password"
              placeholder="PIN Otorisasi 4-Digit (misal: 1234)"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="text-xs p-2.5 bg-white border border-indigo-300 rounded-xl outline-none font-mono"
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setIsAdding(false)} className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-xl">Batal</button>
            <button type="submit" className="px-4 py-1.5 bg-indigo-700 text-white font-bold text-xs rounded-xl">Simpan Karyawan</button>
          </div>
        </form>
      )}

      {/* Filter & Actions Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari NIP / nama karyawan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white outline-none"
            />
          </div>

          <button
            onClick={() => {
              setShowTrash(!showTrash);
              setSelectedIds([]);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border ${
              showTrash ? 'bg-red-50 text-red-700 border-red-300' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" /> Tong Sampah
          </button>
        </div>

        {selectedIds.length > 0 && (
          <button
            onClick={handleBulkSoftDelete}
            className="px-3 py-2 bg-red-600 text-white font-bold text-xs rounded-xl shadow-xs"
          >
            Hapus {selectedIds.length} Karyawan Terpilih
          </button>
        )}
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3.5 w-10 text-center">
                  <button onClick={toggleSelectAll}>
                    {selectedIds.length > 0 && selectedIds.length === filteredEmployees.length ? (
                      <CheckSquare className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </th>
                <th className="p-3.5">Nama & NIP</th>
                <th className="p-3.5">Level Akses (Role)</th>
                <th className="p-3.5">Cabang Tugas</th>
                <th className="p-3.5">Kontak</th>
                <th className="p-3.5 font-mono">PIN Otorisasi</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredEmployees.map(emp => {
                const isSelected = selectedIds.includes(emp.id);
                const bObj = branches.find(b => b.id === emp.branchId);
                return (
                  <tr key={emp.id} className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-indigo-50/50' : ''}`}>
                    <td className="p-3.5 text-center">
                      <button onClick={() => toggleSelectId(emp.id)}>
                        {isSelected ? <CheckSquare className="w-4 h-4 text-indigo-600" /> : <Square className="w-4 h-4 text-slate-300" />}
                      </button>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={emp.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={emp.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{emp.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">NIP: {emp.nip}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      {emp.role === 'OWNER' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-900 border border-purple-300">
                          👑 OWNER
                        </span>
                      )}
                      {emp.role === 'ADMIN' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-900 border border-blue-300">
                          🛡️ ADMIN
                        </span>
                      )}
                      {emp.role === 'KASIR' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
                          🛒 KASIR
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-700 font-medium">{bObj?.name || 'Cabang Utama'}</td>
                    <td className="p-3.5 text-slate-600 text-[11px]">
                      <div>{emp.phone}</div>
                      <div className="text-slate-400">{emp.email}</div>
                    </td>
                    <td className="p-3.5 font-mono text-slate-800 font-bold">•••• ({emp.pin})</td>
                    <td className="p-3.5 text-right">
                      {showTrash ? (
                        <button onClick={() => handleRestore(emp.id)} className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg">
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      ) : (
                        userRole === 'OWNER' && (
                          <button onClick={() => handleSoftDelete(emp.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
