'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, Button, Badge, Modal, Input } from './ui';
import { 
  Users, 
  Settings, 
  BarChart3, 
  Shield, 
  Database, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Activity,
  Server
} from 'lucide-react';
import { apiService } from '../lib/api';

export default function AdminDashboard({ onBack }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPackages: 0,
    activePackages: 0,
    completedPackages: 0,
    systemUptime: '99.9%',
    lastBackup: new Date().toISOString()
  });

  const [users, setUsers] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [checklistTemplates, setChecklistTemplates] = useState([]);
  const [showContractorModal, setShowContractorModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [editingContractor, setEditingContractor] = useState(null);
  const [editingChecklist, setEditingChecklist] = useState(null);
  const [contractorForm, setContractorForm] = useState({
    name: '',
    license: '',
    phone: '',
    email: '',
    address: '',
    specialties: ''
  });
  const [checklistForm, setChecklistForm] = useState({
    name: '',
    permitType: '',
    items: [{ title: '', description: '', required: true }]
  });
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    allowNewRegistrations: true,
    maxFileSize: '10MB',
    sessionTimeout: '24h',
    emailNotifications: true,
    smsNotifications: false
  });

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // Load system statistics
      const packagesData = await apiService.getPermits();
      const packages = packagesData.packages || [];
      
      setStats({
        totalUsers: 1, // Demo user
        totalPackages: packages.length,
        activePackages: packages.filter(p => p.status === 'Submitted').length,
        completedPackages: packages.filter(p => p.status === 'Completed').length,
        systemUptime: '99.9%',
        lastBackup: new Date().toISOString()
      });

      // Mock users data
      setUsers([
        {
          id: 1,
          name: 'Demo User',
          email: 'demo@permitpro.com',
          role: 'user',
          status: 'active',
          lastLogin: new Date().toISOString(),
          packagesCount: packages.length
        },
        {
          id: 2,
          name: 'Admin User',
          email: 'admin@permitpro.com',
          role: 'admin',
          status: 'active',
          lastLogin: new Date().toISOString(),
          packagesCount: 0
        }
      ]);

      // Load contractors data
      setContractors([
        {
          id: 1,
          name: 'ABC Construction',
          license: 'CGC123456',
          phone: '(555) 123-4567',
          email: 'contact@abcconstruction.com',
          address: '123 Main St, Miami, FL 33101',
          specialties: 'General Construction, Remodeling',
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          name: 'XYZ Electrical',
          license: 'EC789012',
          phone: '(555) 987-6543',
          email: 'info@xyzelectrical.com',
          address: '456 Oak Ave, Miami, FL 33102',
          specialties: 'Electrical, HVAC',
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          id: 3,
          name: 'PlumbPro Services',
          license: 'PC345678',
          phone: '(555) 456-7890',
          email: 'service@plumbpro.com',
          address: '789 Pine St, Miami, FL 33103',
          specialties: 'Plumbing, Water Systems',
          status: 'active',
          createdAt: new Date().toISOString()
        }
      ]);

      // Load checklist templates
      setChecklistTemplates([
        {
          id: 1,
          permitType: 'mobile-home',
          name: 'Mobile Home Installation',
          items: [
            { title: 'Site plan approval', description: 'Submit site plan for review', required: true },
            { title: 'Foundation inspection', description: 'Schedule foundation inspection', required: true },
            { title: 'Electrical hookup verification', description: 'Verify electrical connections', required: true },
            { title: 'Plumbing connections check', description: 'Check plumbing connections', required: true },
            { title: 'Tie-down system inspection', description: 'Inspect tie-down system', required: true },
            { title: 'Final occupancy inspection', description: 'Final inspection for occupancy', required: true }
          ],
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          permitType: 'modular-home',
          name: 'Modular Home Installation',
          items: [
            { title: 'Foundation permit', description: 'Obtain foundation permit', required: true },
            { title: 'Modular unit delivery approval', description: 'Approve modular unit delivery', required: true },
            { title: 'Electrical rough-in inspection', description: 'Electrical rough-in inspection', required: true },
            { title: 'Plumbing rough-in inspection', description: 'Plumbing rough-in inspection', required: true },
            { title: 'HVAC installation check', description: 'Check HVAC installation', required: true },
            { title: 'Final building inspection', description: 'Final building inspection', required: true },
            { title: 'Certificate of occupancy', description: 'Obtain certificate of occupancy', required: true }
          ],
          createdAt: new Date().toISOString()
        }
      ]);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSystemSettingChange = (key, value) => {
    setSystemSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleUserAction = async (userId, action) => {
    setLoading(true);
    try {
      // In a real implementation, this would call admin API endpoints
      console.log(`Performing ${action} on user ${userId}`);
      
      if (action === 'suspend') {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, status: 'suspended' } : user
        ));
      } else if (action === 'activate') {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, status: 'active' } : user
        ));
      } else if (action === 'delete') {
        setUsers(prev => prev.filter(user => user.id !== userId));
      }
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleContractorAction = async (contractorId, action) => {
    setLoading(true);
    try {
      console.log(`Performing ${action} on contractor ${contractorId}`);
      
      if (action === 'suspend') {
        setContractors(prev => prev.map(contractor => 
          contractor.id === contractorId ? { ...contractor, status: 'suspended' } : contractor
        ));
      } else if (action === 'activate') {
        setContractors(prev => prev.map(contractor => 
          contractor.id === contractorId ? { ...contractor, status: 'active' } : contractor
        ));
      } else if (action === 'delete') {
        setContractors(prev => prev.filter(contractor => contractor.id !== contractorId));
      }
    } catch (error) {
      console.error(`Failed to ${action} contractor:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleChecklistAction = async (templateId, action) => {
    setLoading(true);
    try {
      console.log(`Performing ${action} on checklist template ${templateId}`);
      
      if (action === 'delete') {
        setChecklistTemplates(prev => prev.filter(template => template.id !== templateId));
      } else if (action === 'edit') {
        const template = checklistTemplates.find(t => t.id === templateId);
        setEditingChecklist(template);
        setChecklistForm({
          name: template.name,
          permitType: template.permitType,
          items: template.items
        });
        setShowChecklistModal(true);
      }
    } catch (error) {
      console.error(`Failed to ${action} checklist template:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleContractorSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newContractor = {
        id: editingContractor ? editingContractor.id : Date.now(),
        ...contractorForm,
        status: 'active',
        createdAt: editingContractor ? editingContractor.createdAt : new Date().toISOString()
      };

      if (editingContractor) {
        setContractors(prev => prev.map(c => c.id === editingContractor.id ? newContractor : c));
      } else {
        setContractors(prev => [...prev, newContractor]);
      }

      setShowContractorModal(false);
      setEditingContractor(null);
      setContractorForm({ name: '', license: '', phone: '', email: '', address: '', specialties: '' });
    } catch (error) {
      console.error('Failed to save contractor:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChecklistSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newTemplate = {
        id: editingChecklist ? editingChecklist.id : Date.now(),
        ...checklistForm,
        createdAt: editingChecklist ? editingChecklist.createdAt : new Date().toISOString()
      };

      if (editingChecklist) {
        setChecklistTemplates(prev => prev.map(t => t.id === editingChecklist.id ? newTemplate : t));
      } else {
        setChecklistTemplates(prev => [...prev, newTemplate]);
      }

      setShowChecklistModal(false);
      setEditingChecklist(null);
      setChecklistForm({ name: '', permitType: '', items: [{ title: '', description: '', required: true }] });
    } catch (error) {
      console.error('Failed to save checklist template:', error);
    } finally {
      setLoading(false);
    }
  };

  const addChecklistItem = () => {
    setChecklistForm(prev => ({
      ...prev,
      items: [...prev.items, { title: '', description: '', required: true }]
    }));
  };

  const removeChecklistItem = (index) => {
    setChecklistForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateChecklistItem = (index, field, value) => {
    setChecklistForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const openContractorModal = (contractor = null) => {
    if (contractor) {
      setEditingContractor(contractor);
      setContractorForm({
        name: contractor.name,
        license: contractor.license,
        phone: contractor.phone,
        email: contractor.email,
        address: contractor.address,
        specialties: contractor.specialties
      });
    } else {
      setEditingContractor(null);
      setContractorForm({ name: '', license: '', phone: '', email: '', address: '', specialties: '' });
    }
    setShowContractorModal(true);
  };

  const openChecklistModal = (template = null) => {
    if (template) {
      setEditingChecklist(template);
      setChecklistForm({
        name: template.name,
        permitType: template.permitType,
        items: template.items
      });
    } else {
      setEditingChecklist(null);
      setChecklistForm({ name: '', permitType: '', items: [{ title: '', description: '', required: true }] });
    }
    setShowChecklistModal(true);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Packages</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPackages}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Packages</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activePackages}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedPackages}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Server className="h-5 w-5 mr-2" />
              System Health
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">System Uptime</span>
                <Badge variant="success">{stats.systemUptime}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Backup</span>
                <span className="text-sm text-gray-900">
                  {new Date(stats.lastBackup).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database Status</span>
                <Badge variant="success">Healthy</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Status</span>
                <Badge variant="success">Online</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Recent Activity
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span>System backup completed</span>
                <span className="ml-auto text-gray-500">2h ago</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span>New user registered</span>
                <span className="ml-auto text-gray-500">4h ago</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                <span>Package status updated</span>
                <span className="ml-auto text-gray-500">6h ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Packages
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={user.status === 'active' ? 'success' : 'warning'}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.packagesCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.lastLogin).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {user.status === 'active' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUserAction(user.id, 'suspend')}
                        >
                          Suspend
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUserAction(user.id, 'activate')}
                        >
                          Activate
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUserAction(user.id, 'delete')}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContractors = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Contractor Management</h3>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => openContractorModal()}
            >
              Add Contractor
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contractor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    License
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Specialties
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contractors.map((contractor) => (
                  <tr key={contractor.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{contractor.name}</div>
                        <div className="text-sm text-gray-500">{contractor.address}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{contractor.license}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{contractor.phone}</div>
                      <div className="text-sm text-gray-500">{contractor.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{contractor.specialties}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={contractor.status === 'active' ? 'success' : 'warning'}>
                        {contractor.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openContractorModal(contractor)}
                      >
                        Edit
                      </Button>
                      {contractor.status === 'active' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleContractorAction(contractor.id, 'suspend')}
                        >
                          Suspend
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleContractorAction(contractor.id, 'activate')}
                        >
                          Activate
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleContractorAction(contractor.id, 'delete')}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderChecklists = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Checklist Templates</h3>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => openChecklistModal()}
            >
              Add Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {checklistTemplates.map((template) => (
              <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{template.name}</h4>
                    <p className="text-sm text-gray-500">Permit Type: {template.permitType}</p>
                    <p className="text-sm text-gray-500">
                      {template.items.length} items • Created: {new Date(template.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => openChecklistModal(template)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleChecklistAction(template.id, 'delete')}
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  {template.items.map((item, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <div className={`w-2 h-2 rounded-full mr-3 ${item.required ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                      <span className="font-medium">{item.title}</span>
                      <span className="text-gray-500 ml-2">- {item.description}</span>
                      {item.required && (
                        <Badge variant="default" className="ml-2 text-xs">Required</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">System Settings</h3>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maintenance Mode
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={systemSettings.maintenanceMode}
                  onChange={(e) => handleSystemSettingChange('maintenanceMode', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-600">Enable maintenance mode</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allow New Registrations
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={systemSettings.allowNewRegistrations}
                  onChange={(e) => handleSystemSettingChange('allowNewRegistrations', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-600">Allow new user registrations</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max File Size
              </label>
              <select
                value={systemSettings.maxFileSize}
                onChange={(e) => handleSystemSettingChange('maxFileSize', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="5MB">5MB</option>
                <option value="10MB">10MB</option>
                <option value="25MB">25MB</option>
                <option value="50MB">50MB</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Timeout
              </label>
              <select
                value={systemSettings.sessionTimeout}
                onChange={(e) => handleSystemSettingChange('sessionTimeout', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1h">1 Hour</option>
                <option value="8h">8 Hours</option>
                <option value="24h">24 Hours</option>
                <option value="7d">7 Days</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h4 className="text-md font-medium text-gray-900 mb-4">Notification Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={systemSettings.emailNotifications}
                  onChange={(e) => handleSystemSettingChange('emailNotifications', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-600">Email Notifications</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={systemSettings.smsNotifications}
                  onChange={(e) => handleSystemSettingChange('smsNotifications', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-600">SMS Notifications</span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'contractors', name: 'Contractors', icon: Users },
    { id: 'checklists', name: 'Checklists', icon: FileText },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button variant="outline" onClick={onBack} className="mr-4">
                ← Back to App
              </Button>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Shield className="h-8 w-8 mr-3 text-red-600" />
                Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="default" className="bg-red-100 text-red-800">
                Admin Mode
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'contractors' && renderContractors()}
            {activeTab === 'checklists' && renderChecklists()}
            {activeTab === 'settings' && renderSettings()}
          </>
        )}
      </div>

      {/* Contractor Modal */}
      {showContractorModal && (
        <Modal onClose={() => setShowContractorModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingContractor ? 'Edit Contractor' : 'Add New Contractor'}
              </h2>
            </div>
            <form onSubmit={handleContractorSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name *
                  </label>
                  <Input
                    type="text"
                    value={contractorForm.name}
                    onChange={(e) => setContractorForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License Number *
                  </label>
                  <Input
                    type="text"
                    value={contractorForm.license}
                    onChange={(e) => setContractorForm(prev => ({ ...prev, license: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <Input
                    type="tel"
                    value={contractorForm.phone}
                    onChange={(e) => setContractorForm(prev => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={contractorForm.email}
                    onChange={(e) => setContractorForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <Input
                  type="text"
                  value={contractorForm.address}
                  onChange={(e) => setContractorForm(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialties
                </label>
                <Input
                  type="text"
                  value={contractorForm.specialties}
                  onChange={(e) => setContractorForm(prev => ({ ...prev, specialties: e.target.value }))}
                  placeholder="e.g., General Construction, Electrical, Plumbing"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowContractorModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                  {editingContractor ? 'Update Contractor' : 'Add Contractor'}
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* Checklist Modal */}
      {showChecklistModal && (
        <Modal onClose={() => setShowChecklistModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingChecklist ? 'Edit Checklist Template' : 'Add New Checklist Template'}
              </h2>
            </div>
            <form onSubmit={handleChecklistSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template Name *
                  </label>
                  <Input
                    type="text"
                    value={checklistForm.name}
                    onChange={(e) => setChecklistForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Permit Type *
                  </label>
                  <select
                    value={checklistForm.permitType}
                    onChange={(e) => setChecklistForm(prev => ({ ...prev, permitType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select permit type</option>
                    <option value="mobile-home">Mobile Home</option>
                    <option value="modular-home">Modular Home</option>
                    <option value="shed">Shed</option>
                    <option value="addition">Home Addition</option>
                    <option value="hvac">HVAC</option>
                    <option value="electrical">Electrical</option>
                    <option value="plumbing">Plumbing</option>
                  </select>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Checklist Items *
                  </label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addChecklistItem}
                  >
                    Add Item
                  </Button>
                </div>
                <div className="space-y-3">
                  {checklistForm.items.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-700">Item {index + 1}</span>
                        {checklistForm.items.length > 1 && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => removeChecklistItem(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Title *
                          </label>
                          <Input
                            type="text"
                            value={item.title}
                            onChange={(e) => updateChecklistItem(index, 'title', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Required
                          </label>
                          <select
                            value={item.required}
                            onChange={(e) => updateChecklistItem(index, 'required', e.target.value === 'true')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="true">Required</option>
                            <option value="false">Optional</option>
                          </select>
                        </div>
                      </div>
                      <div className="mt-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Description
                        </label>
                        <Input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateChecklistItem(index, 'description', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowChecklistModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                  {editingChecklist ? 'Update Template' : 'Add Template'}
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}
