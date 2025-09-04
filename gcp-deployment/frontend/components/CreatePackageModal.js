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
      const types = await apiService.getPermitTypes();
      setPermitTypes(types);
    } catch (error) {
      console.error('Failed to load permit types:', error);
    }
  };

  const loadContractors = async () => {
    try {
      // For now, we'll use mock contractors since the backend doesn't have a contractors endpoint
      // In a real implementation, this would be: const contractorData = await apiService.getContractors();
      const contractorData = [
        {
          id: '1',
          name: 'ABC Construction LLC',
          license: 'CBC1234567',
          phone: '(305) 555-0456',
          email: 'contact@abcconstruction.com',
          specialties: 'General Construction, Renovations'
        },
        {
          id: '2',
          name: 'XYZ Builders Inc',
          license: 'CBC7654321',
          phone: '(407) 555-0321',
          email: 'info@xyzbuilders.com',
          specialties: 'Residential Construction, Additions'
        },
        {
          id: '3',
          name: 'Elite Electrical Services',
          license: 'EC123456',
          phone: '(305) 555-0101',
          email: 'info@eliteelectrical.com',
          specialties: 'Electrical, HVAC'
        },
        {
          id: '4',
          name: 'Premier Plumbing Co',
          license: 'PC789012',
          phone: '(305) 555-0202',
          email: 'info@premierplumbing.com',
          specialties: 'Plumbing, Water Systems'
        }
      ];
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
      // For now, we'll create a mock checklist based on permit type
      // In a real implementation, this would come from the backend
      const checklistData = getChecklistForPermitType(permitType);
      setChecklist(checklistData);
    } catch (error) {
      console.error('Failed to load checklist:', error);
      setChecklist([]);
    } finally {
      setLoadingChecklist(false);
    }
  };

  const getChecklistForPermitType = (permitType) => {
    const checklists = {
      'mobile-home': [
        { title: 'Site plan approval', description: 'Submit site plan for review', required: true },
        { title: 'Foundation inspection', description: 'Schedule foundation inspection', required: true },
        { title: 'Electrical hookup verification', description: 'Verify electrical connections', required: true },
        { title: 'Plumbing connections check', description: 'Check plumbing connections', required: true },
        { title: 'Tie-down system inspection', description: 'Inspect tie-down system', required: true },
        { title: 'Final occupancy inspection', description: 'Final inspection for occupancy', required: true }
      ],
      'modular-home': [
        { title: 'Foundation permit', description: 'Obtain foundation permit', required: true },
        { title: 'Modular unit delivery approval', description: 'Approve modular unit delivery', required: true },
        { title: 'Electrical rough-in inspection', description: 'Electrical rough-in inspection', required: true },
        { title: 'Plumbing rough-in inspection', description: 'Plumbing rough-in inspection', required: true },
        { title: 'HVAC installation check', description: 'Check HVAC installation', required: true },
        { title: 'Final building inspection', description: 'Final building inspection', required: true },
        { title: 'Certificate of occupancy', description: 'Obtain certificate of occupancy', required: true }
      ],
      'shed': [
        { title: 'Setback requirements verification', description: 'Verify setback requirements', required: true },
        { title: 'Foundation/slab inspection', description: 'Inspect foundation or slab', required: true },
        { title: 'Structural framing check', description: 'Check structural framing', required: true },
        { title: 'Roofing inspection', description: 'Inspect roofing', required: true },
        { title: 'Final inspection', description: 'Final inspection', required: true }
      ],
      'addition': [
        { title: 'Building permit application', description: 'Submit building permit application', required: true },
        { title: 'Structural plans review', description: 'Review structural plans', required: true },
        { title: 'Foundation inspection', description: 'Foundation inspection', required: true },
        { title: 'Framing inspection', description: 'Framing inspection', required: true },
        { title: 'Electrical rough-in', description: 'Electrical rough-in inspection', required: true },
        { title: 'Plumbing rough-in', description: 'Plumbing rough-in inspection', required: true },
        { title: 'Insulation inspection', description: 'Insulation inspection', required: true },
        { title: 'Drywall inspection', description: 'Drywall inspection', required: true },
        { title: 'Final inspection', description: 'Final inspection', required: true }
      ],
      'hvac': [
        { title: 'HVAC system design review', description: 'Review HVAC system design', required: true },
        { title: 'Ductwork installation inspection', description: 'Inspect ductwork installation', required: true },
        { title: 'Equipment mounting verification', description: 'Verify equipment mounting', required: true },
        { title: 'Electrical connections check', description: 'Check electrical connections', required: true },
        { title: 'Gas line connections (if applicable)', description: 'Check gas line connections', required: false },
        { title: 'System startup and testing', description: 'Test system startup', required: true },
        { title: 'Final inspection and approval', description: 'Final inspection and approval', required: true }
      ],
      'electrical': [
        { title: 'Electrical plans review', description: 'Review electrical plans', required: true },
        { title: 'Rough-in electrical inspection', description: 'Rough-in electrical inspection', required: true },
        { title: 'Panel installation verification', description: 'Verify panel installation', required: true },
        { title: 'Outlet and switch installation', description: 'Install outlets and switches', required: true },
        { title: 'GFCI and AFCI compliance check', description: 'Check GFCI and AFCI compliance', required: true },
        { title: 'Final electrical inspection', description: 'Final electrical inspection', required: true },
        { title: 'Certificate of completion', description: 'Obtain certificate of completion', required: true }
      ],
      'plumbing': [
        { title: 'Plumbing plans review', description: 'Review plumbing plans', required: true },
        { title: 'Rough-in plumbing inspection', description: 'Rough-in plumbing inspection', required: true },
        { title: 'Water line installation', description: 'Install water lines', required: true },
        { title: 'Drain line installation', description: 'Install drain lines', required: true },
        { title: 'Fixture installation verification', description: 'Verify fixture installation', required: true },
        { title: 'Pressure testing', description: 'Perform pressure testing', required: true },
        { title: 'Final plumbing inspection', description: 'Final plumbing inspection', required: true }
      ]
    };
    
    return checklists[permitType] || [];
  };

  const handleAddNewContractor = async () => {
    if (!formData.newContractorName || !formData.newContractorLicense) {
      return;
    }

    try {
      // Create a new contractor object locally
      const newContractor = {
        id: Date.now().toString(), // Generate a simple ID
        name: formData.newContractorName,
        license: formData.newContractorLicense,
        phone: formData.newContractorPhone || '',
        email: formData.newContractorEmail || '',
        address: formData.newContractorAddress || '',
        specialties: formData.newContractorSpecialties || ''
      };
      
      // Add to the local contractors list
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
      // Get contractor details for primary contractor
      const primaryContractor = contractors.find(c => c.id === formData.primaryContractorId);
      const subcontractors = contractors.filter(c => formData.subcontractorIds.includes(c.id));
      
      // Prepare package data with contractor details
      const packageData = {
        ...formData,
        // Primary contractor details
        contractorName: primaryContractor?.name || '',
        contractorLicense: primaryContractor?.license || '',
        contractorPhone: primaryContractor?.phone || '',
        contractorEmail: primaryContractor?.email || '',
        // Subcontractor details (we'll store as a string for now)
        subcontractors: subcontractors.map(sub => ({
          name: sub.name,
          license: sub.license,
          phone: sub.phone,
          email: sub.email,
          specialties: sub.specialties
        })),
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
                    <option key={type.value} value={type.value}>{type.label}</option>
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
                  <strong>County:</strong> {formData.county} | <strong>Permit Type:</strong> {permitTypes.find(t => t.value === formData.permitType)?.label}
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
