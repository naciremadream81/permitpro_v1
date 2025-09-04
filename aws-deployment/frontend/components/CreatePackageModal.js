import { useState, useEffect } from 'react';
import { Modal, Input, Button } from './ui';
import { apiService } from '../lib/api';

export default function CreatePackageModal({ isOpen, onClose, onPackageCreated }) {
  const [permitTypes, setPermitTypes] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [loadingChecklist, setLoadingChecklist] = useState(false);
  const [showNewContractorForm, setShowNewContractorForm] = useState(false);
  const [formData, setFormData] = useState({
    // Customer Information
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerAddress: '',
    // Property Information
    propertyAddress: '',
    propertyParcelId: '',
    propertyZoning: '',
    // Contractor Information
    primaryContractorId: '',
    subcontractorIds: [],
    // Permit Details
    county: '',
    permitType: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const FLORIDA_COUNTIES = [
    'Alachua', 'Baker', 'Bay', 'Bradford', 'Brevard', 'Broward', 'Calhoun',
    'Charlotte', 'Citrus', 'Clay', 'Collier', 'Columbia', 'DeSoto', 'Dixie',
    'Duval', 'Escambia', 'Flagler', 'Franklin', 'Gadsden', 'Gilchrist',
    'Glades', 'Gulf', 'Hamilton', 'Hardee', 'Hendry', 'Hernando', 'Highlands',
    'Hillsborough', 'Holmes', 'Indian River', 'Jackson', 'Jefferson', 'Lafayette',
    'Lake', 'Lee', 'Leon', 'Levy', 'Liberty', 'Madison', 'Manatee', 'Marion',
    'Martin', 'Miami-Dade', 'Monroe', 'Nassau', 'Okaloosa', 'Okeechobee',
    'Orange', 'Osceola', 'Palm Beach', 'Pasco', 'Pinellas', 'Polk', 'Putnam',
    'St. Johns', 'St. Lucie', 'Santa Rosa', 'Sarasota', 'Seminole', 'Sumter',
    'Suwannee', 'Taylor', 'Union', 'Volusia', 'Wakulla', 'Walton', 'Washington'
  ];

  useEffect(() => {
    if (isOpen) {
      loadPermitTypes();
      loadContractors();
    }
  }, [isOpen]);

  const loadPermitTypes = async () => {
    try {
      const token = localStorage.getItem('permitpro_token');
      const response = await fetch('http://localhost:3008/api/permit-types', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const types = await response.json();
      setPermitTypes(types);
    } catch (error) {
      console.error('Failed to load permit types:', error);
    }
  };

  const loadContractors = async () => {
    try {
      const token = localStorage.getItem('permitpro_token');
      const response = await fetch('http://localhost:3008/api/contractors', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const contractorData = await response.json();
      setContractors(contractorData);
    } catch (error) {
      console.error('Failed to load contractors:', error);
    }
  };

  const loadChecklist = async (county, permitType) => {
    if (!county || !permitType) {
      setChecklist([]);
      return;
    }

    setLoadingChecklist(true);
    try {
      const token = localStorage.getItem('permitpro_token');
      const response = await fetch(`http://localhost:3008/api/checklist?county=${encodeURIComponent(county)}&permitType=${encodeURIComponent(permitType)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const checklistData = await response.json();
      setChecklist(checklistData);
    } catch (error) {
      console.error('Failed to load checklist:', error);
      setChecklist([]);
    } finally {
      setLoadingChecklist(false);
    }
  };

  const handleAddNewContractor = async () => {
    if (!formData.newContractorName || !formData.newContractorLicense) {
      return;
    }

    try {
      const token = localStorage.getItem('permitpro_token');
      const response = await fetch('http://localhost:3008/api/contractors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.newContractorName,
          license: formData.newContractorLicense,
          phone: formData.newContractorPhone,
          email: formData.newContractorEmail,
          address: formData.newContractorAddress,
          specialties: formData.newContractorSpecialties
        })
      });

      if (response.ok) {
        const newContractor = await response.json();
        setContractors(prev => [...prev, newContractor]);
        
        // Clear the form
        setFormData(prev => ({
          ...prev,
          newContractorName: '',
          newContractorLicense: '',
          newContractorPhone: '',
          newContractorEmail: '',
          newContractorAddress: '',
          newContractorSpecialties: ''
        }));
        
        setShowNewContractorForm(false);
      } else {
        console.error('Failed to add contractor');
      }
    } catch (error) {
      console.error('Error adding contractor:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      
      // Load checklist when county or permit type changes
      if (name === 'county' || name === 'permitType') {
        const county = name === 'county' ? value : newData.county;
        const permitType = name === 'permitType' ? value : newData.permitType;
        loadChecklist(county, permitType);
      }
      
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Prepare package data with contractors and checklist
      const packageData = {
        ...formData,
        contractors: {
          primary: formData.primaryContractorId,
          subcontractors: formData.subcontractorIds
        },
        checklist: checklist
      };

      const newPackage = await apiService.createPermit(packageData);
      onPackageCreated(newPackage);
      onClose();
      
      // Reset form data
      setFormData({
        customerName: '', customerPhone: '', customerEmail: '', customerAddress: '',
        propertyAddress: '', propertyParcelId: '', propertyZoning: '',
        primaryContractorId: '', subcontractorIds: [],
        county: '', permitType: ''
      });
      setChecklist([]);
    } catch (error) {
      setError(error.message || 'Failed to create permit package');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal onClose={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New Permit Package</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Customer Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Customer Name"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Phone Number"
                name="customerPhone"
                type="tel"
                value={formData.customerPhone}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Email Address"
                name="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Customer Address"
                name="customerAddress"
                value={formData.customerAddress}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Property Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Property Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Property Address"
                name="propertyAddress"
                value={formData.propertyAddress}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Parcel ID"
                name="propertyParcelId"
                value={formData.propertyParcelId}
                onChange={handleInputChange}
              />
              <Input
                label="Zoning"
                name="propertyZoning"
                value={formData.propertyZoning}
                onChange={handleInputChange}
                placeholder="e.g., R-1 Residential"
              />
            </div>
          </div>

          {/* Contractor Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Contractor Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Contractor *
                </label>
                <select
                  name="primaryContractorId"
                  value={formData.primaryContractorId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Primary Contractor</option>
                  {contractors.map(contractor => (
                    <option key={contractor.id} value={contractor.id}>
                      {contractor.name} - {contractor.license}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcontractors
                </label>
                <div className="space-y-2">
                  {contractors.map(contractor => (
                    <label key={contractor.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        value={contractor.id}
                        checked={formData.subcontractorIds.includes(contractor.id.toString())}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            subcontractorIds: e.target.checked
                              ? [...prev.subcontractorIds, value]
                              : prev.subcontractorIds.filter(id => id !== value)
                          }));
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        {contractor.name} - {contractor.specialties}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowNewContractorForm(!showNewContractorForm)}
                  className="text-sm"
                >
                  {showNewContractorForm ? 'Cancel' : '+ Add New Contractor'}
                </Button>
              </div>

              {/* New Contractor Form */}
              {showNewContractorForm && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Add New Contractor</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      label="Contractor Name"
                      name="newContractorName"
                      value={formData.newContractorName || ''}
                      onChange={handleInputChange}
                      placeholder="e.g., ABC Construction LLC"
                    />
                    <Input
                      label="License Number"
                      name="newContractorLicense"
                      value={formData.newContractorLicense || ''}
                      onChange={handleInputChange}
                      placeholder="e.g., CBC123456"
                    />
                    <Input
                      label="Phone"
                      name="newContractorPhone"
                      value={formData.newContractorPhone || ''}
                      onChange={handleInputChange}
                      placeholder="e.g., (305) 555-0101"
                    />
                    <Input
                      label="Email"
                      name="newContractorEmail"
                      value={formData.newContractorEmail || ''}
                      onChange={handleInputChange}
                      placeholder="e.g., info@contractor.com"
                    />
                    <Input
                      label="Address"
                      name="newContractorAddress"
                      value={formData.newContractorAddress || ''}
                      onChange={handleInputChange}
                      placeholder="e.g., 123 Main St, City, State"
                    />
                    <Input
                      label="Specialties"
                      name="newContractorSpecialties"
                      value={formData.newContractorSpecialties || ''}
                      onChange={handleInputChange}
                      placeholder="e.g., General Construction, Renovations"
                    />
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button
                      type="button"
                      onClick={handleAddNewContractor}
                      disabled={!formData.newContractorName || !formData.newContractorLicense}
                      className="text-sm"
                    >
                      Add Contractor
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setShowNewContractorForm(false);
                        setFormData(prev => ({
                          ...prev,
                          newContractorName: '',
                          newContractorLicense: '',
                          newContractorPhone: '',
                          newContractorEmail: '',
                          newContractorAddress: '',
                          newContractorSpecialties: ''
                        }));
                      }}
                      className="text-sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Permit Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Permit Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  County
                </label>
                <select
                  name="county"
                  value={formData.county}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select County</option>
                  {FLORIDA_COUNTIES.map(county => (
                    <option key={county} value={county}>{county}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Permit Type
                </label>
                <select
                  name="permitType"
                  value={formData.permitType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Permit Type</option>
                  {permitTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Checklist Section */}
          {checklist.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Required Documents & Checklist</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>County:</strong> {formData.county} | <strong>Permit Type:</strong> {permitTypes.find(t => t.id === formData.permitType)?.name}
                </p>
              </div>
              
              {loadingChecklist ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading checklist...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {checklist.map((item, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-5 h-5 border-2 border-gray-300 rounded"></div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.title}</h4>
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        )}
                        {item.required && (
                          <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                            Required
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Permit Package'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
