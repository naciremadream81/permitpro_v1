const express = require('express');
const { protect } = require('../middleware/mock-auth');
const router = express.Router();

// Mock contractors data
const mockContractors = [
  {
    id: 1,
    name: 'ABC Construction LLC',
    license: 'CBC123456',
    phone: '(305) 555-0101',
    email: 'info@abcconstruction.com',
    address: '123 Main St, Miami, FL 33101',
    specialties: 'General Construction, Renovations'
  },
  {
    id: 2,
    name: 'Miami Electric Co',
    license: 'EC123456',
    phone: '(305) 555-0102',
    email: 'contact@miamielectric.com',
    address: '456 Electric Ave, Miami, FL 33102',
    specialties: 'Electrical, Lighting, Panel Upgrades'
  },
  {
    id: 3,
    name: 'South Florida Plumbing',
    license: 'PC123456',
    phone: '(305) 555-0103',
    email: 'service@southfloridaplumbing.com',
    address: '789 Water St, Miami, FL 33103',
    specialties: 'Plumbing, Water Heater, Drain Cleaning'
  },
  {
    id: 4,
    name: 'Cool Air HVAC',
    license: 'HVAC123456',
    phone: '(305) 555-0104',
    email: 'info@coolairhvac.com',
    address: '321 Air Way, Miami, FL 33104',
    specialties: 'HVAC, Air Conditioning, Ductwork'
  },
  {
    id: 5,
    name: 'Broward Builders Inc',
    license: 'CBC789012',
    phone: '(954) 555-0105',
    email: 'info@browardbuilders.com',
    address: '654 Builder Blvd, Fort Lauderdale, FL 33301',
    specialties: 'General Construction, Commercial'
  }
];

// Mock data for development
const mockPackages = [
  {
    id: '1',
    customerName: 'John Smith',
    propertyAddress: '123 Main St, Anytown, ST 12345',
    county: 'Miami-Dade',
    status: 'Draft',
    permitType: 'Building Permit',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    documents: [
      {
        id: '1',
        name: 'Site Plan.pdf',
        url: '/documents/1/site-plan.pdf',
        uploadedAt: new Date().toISOString()
      }
    ],
    contractors: [
      {
        id: 1,
        name: 'ABC Construction LLC',
        license: 'CBC123456',
        phone: '(305) 555-0101',
        email: 'info@abcconstruction.com',
        role: 'Primary Contractor'
      },
      {
        id: 2,
        name: 'Miami Electric Co',
        license: 'EC123456',
        phone: '(305) 555-0102',
        email: 'contact@miamielectric.com',
        role: 'Electrical Subcontractor'
      },
      {
        id: 3,
        name: 'South Florida Plumbing',
        license: 'PC123456',
        phone: '(305) 555-0103',
        email: 'service@southfloridaplumbing.com',
        role: 'Plumbing Subcontractor'
      }
    ],
    checklist: [
      { id: 1, title: 'Site Plan', description: 'Detailed site plan showing property boundaries, setbacks, and proposed construction', required: true, completed: false },
      { id: 2, title: 'Architectural Plans', description: 'Complete architectural drawings including floor plans, elevations, and sections', required: true, completed: false },
      { id: 3, title: 'Structural Plans', description: 'Structural engineering plans and calculations', required: true, completed: false },
      { id: 4, title: 'Energy Code Compliance', description: 'Energy efficiency calculations and compliance documentation', required: true, completed: false }
    ]
  },
  {
    id: '2',
    customerName: 'Jane Doe',
    propertyAddress: '456 Oak Ave, Another City, ST 67890',
    county: 'Broward',
    status: 'Submitted',
    permitType: 'Electrical Permit',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    documents: [],
    contractors: [
      {
        id: 5,
        name: 'Broward Builders Inc',
        license: 'CBC789012',
        phone: '(954) 555-0105',
        email: 'info@browardbuilders.com',
        role: 'Primary Contractor'
      },
      {
        id: 4,
        name: 'Cool Air HVAC',
        license: 'HVAC123456',
        phone: '(305) 555-0104',
        email: 'info@coolairhvac.com',
        role: 'HVAC Subcontractor'
      }
    ],
    checklist: [
      { id: 5, title: 'Electrical Plans', description: 'Detailed electrical system plans and specifications', required: true, completed: true },
      { id: 6, title: 'Load Calculations', description: 'Electrical load calculations for the proposed system', required: true, completed: true },
      { id: 7, title: 'Equipment Specifications', description: 'Specifications for all electrical equipment and fixtures', required: true, completed: false }
    ]
  }
];

// GET /api/packages
router.get('/', protect, async (req, res) => {
  try {
    res.json(mockPackages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/packages
router.post('/', protect, async (req, res) => {
  console.log('POST /api/packages called with body:', req.body);
  try {
    const { 
      customerName, 
      customerPhone,
      customerEmail,
      customerAddress,
      propertyAddress, 
      propertyParcelId,
      propertyZoning,
      county, 
      permitType,
      contractors,
      checklist
    } = req.body;
    
    // Get contractor details
    let packageContractors = [];
    
    if (contractors && contractors.primary) {
      const primaryContractor = mockContractors.find(c => c.id.toString() === contractors.primary.toString());
      if (primaryContractor) {
        packageContractors.push({
          ...primaryContractor,
          role: 'Primary Contractor'
        });
      }
    }
    
    if (contractors && contractors.subcontractors && contractors.subcontractors.length > 0) {
      contractors.subcontractors.forEach(subId => {
        const subcontractor = mockContractors.find(c => c.id.toString() === subId.toString());
        if (subcontractor) {
          packageContractors.push({
            ...subcontractor,
            role: 'Subcontractor'
          });
        }
      });
    }
    
    // Process checklist items
    let packageChecklist = [];
    if (checklist && checklist.length > 0) {
      packageChecklist = checklist.map((item, index) => ({
        id: index + 1,
        title: item.title,
        description: item.description,
        required: item.required,
        completed: false
      }));
    }
    
    const newPackage = {
      id: (mockPackages.length + 1).toString(),
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      propertyAddress,
      propertyParcelId,
      propertyZoning,
      county,
      permitType,
      status: 'Draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      documents: [],
      contractors: packageContractors,
      checklist: packageChecklist
    };
    
    mockPackages.push(newPackage);
    res.status(201).json(newPackage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/packages/:id/status
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const packageIndex = mockPackages.findIndex(pkg => pkg.id === id);
    if (packageIndex === -1) {
      return res.status(404).json({ message: 'Package not found' });
    }
    
    mockPackages[packageIndex].status = status;
    mockPackages[packageIndex].updatedAt = new Date().toISOString();
    
    res.json({
      id: mockPackages[packageIndex].id,
      status: mockPackages[packageIndex].status,
      updatedAt: mockPackages[packageIndex].updatedAt
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/packages/:id/documents
router.post('/:id/documents', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, url } = req.body;
    
    const packageIndex = mockPackages.findIndex(pkg => pkg.id === id);
    if (packageIndex === -1) {
      return res.status(404).json({ message: 'Package not found' });
    }
    
    const newDocument = {
      id: (mockPackages[packageIndex].documents.length + 1).toString(),
      name,
      url,
      uploadedAt: new Date().toISOString()
    };
    
    mockPackages[packageIndex].documents.push(newDocument);
    mockPackages[packageIndex].updatedAt = new Date().toISOString();
    
    res.status(201).json(newDocument);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/packages/:id/download-all
router.get('/:id/download-all', protect, async (req, res) => {
  try {
    const { id } = req.params;
    
    const packageIndex = mockPackages.findIndex(pkg => pkg.id === id);
    if (packageIndex === -1) {
      return res.status(404).json({ message: 'Package not found' });
    }
    
    const packageData = mockPackages[packageIndex];
    if (!packageData.documents || packageData.documents.length === 0) {
      return res.status(404).json({ message: 'No documents to download' });
    }
    
    const zipFileName = `${packageData.customerName.replace(/\s+/g, '_')}_${packageData.id}_Documents.zip`;
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);
    
    res.json({
      message: 'Download simulation - documents would be zipped here',
      documents: packageData.documents,
      packageId: id,
      fileName: zipFileName
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/dashboard/stats
router.get('/stats', protect, async (req, res) => {
  try {
    const totalPackages = mockPackages.length;
    const draftPackages = mockPackages.filter(pkg => pkg.status === 'Draft').length;
    const submittedPackages = mockPackages.filter(pkg => pkg.status === 'Submitted').length;
    const completedPackages = mockPackages.filter(pkg => pkg.status === 'Completed').length;
    const totalDocuments = mockPackages.reduce((sum, pkg) => sum + pkg.documents.length, 0);
    
    res.json({
      totalPackages,
      draftPackages,
      submittedPackages,
      completedPackages,
      totalDocuments,
      completionRate: totalPackages > 0 ? Math.round((completedPackages / totalPackages) * 100) : 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/permit-types
router.get('/permit-types', protect, async (req, res) => {
  try {
    const permitTypes = [
      { id: '1', name: 'Building Permit', description: 'For new construction and major renovations' },
      { id: '2', name: 'Electrical Permit', description: 'For electrical installations and modifications' },
      { id: '3', name: 'Plumbing Permit', description: 'For plumbing installations and repairs' },
      { id: '4', name: 'HVAC Permit', description: 'For heating, ventilation, and air conditioning systems' },
      { id: '5', name: 'Demolition Permit', description: 'For building demolition projects' }
    ];

    res.json(permitTypes);
  } catch (error) {
    console.error('Error fetching permit types:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/checklist
router.get('/checklist', protect, async (req, res) => {
  try {
    const { county, permitType } = req.query;

    if (!county || !permitType) {
      return res.status(400).json({ message: 'County and permit type are required' });
    }

    // Define checklists based on county and permit type combinations
    const checklists = {
      'Miami-Dade': {
        '1': [ // Building Permit
          { title: 'Site Plan', description: 'Detailed site plan showing property boundaries, setbacks, and proposed construction', required: true },
          { title: 'Architectural Plans', description: 'Complete architectural drawings including floor plans, elevations, and sections', required: true },
          { title: 'Structural Plans', description: 'Structural engineering plans and calculations', required: true },
          { title: 'Energy Code Compliance', description: 'Energy efficiency calculations and compliance documentation', required: true },
          { title: 'Impact Fee Payment', description: 'Payment of applicable impact fees', required: true },
          { title: 'Environmental Review', description: 'Environmental impact assessment if required', required: false }
        ],
        '2': [ // Electrical Permit
          { title: 'Electrical Plans', description: 'Detailed electrical system plans and specifications', required: true },
          { title: 'Load Calculations', description: 'Electrical load calculations for the proposed system', required: true },
          { title: 'Equipment Specifications', description: 'Specifications for all electrical equipment and fixtures', required: true },
          { title: 'Grounding Plan', description: 'Grounding and bonding system design', required: true }
        ],
        '3': [ // Plumbing Permit
          { title: 'Plumbing Plans', description: 'Detailed plumbing system plans and specifications', required: true },
          { title: 'Fixture Schedule', description: 'Complete schedule of all plumbing fixtures and their locations', required: true },
          { title: 'Water Supply Calculations', description: 'Water supply system calculations and sizing', required: true },
          { title: 'Drainage Plans', description: 'Drainage and waste disposal system plans', required: true }
        ]
      },
      'Broward': {
        '1': [ // Building Permit
          { title: 'Site Plan', description: 'Site plan with property lines, setbacks, and proposed construction', required: true },
          { title: 'Architectural Plans', description: 'Complete architectural drawings and specifications', required: true },
          { title: 'Structural Plans', description: 'Structural engineering plans and calculations', required: true },
          { title: 'Wind Load Calculations', description: 'Wind load calculations for hurricane resistance', required: true },
          { title: 'Flood Zone Compliance', description: 'Flood zone determination and compliance documentation', required: true }
        ],
        '2': [ // Electrical Permit
          { title: 'Electrical Plans', description: 'Electrical system plans and specifications', required: true },
          { title: 'Load Calculations', description: 'Electrical load calculations', required: true },
          { title: 'Equipment List', description: 'Complete list of electrical equipment and fixtures', required: true }
        ]
      },
      'Orange': {
        '1': [ // Building Permit
          { title: 'Site Plan', description: 'Site plan showing property boundaries and proposed construction', required: true },
          { title: 'Architectural Plans', description: 'Architectural drawings and specifications', required: true },
          { title: 'Structural Plans', description: 'Structural engineering plans', required: true },
          { title: 'Zoning Compliance', description: 'Zoning compliance verification', required: true }
        ],
        '4': [ // HVAC Permit
          { title: 'HVAC Plans', description: 'Heating, ventilation, and air conditioning system plans', required: true },
          { title: 'Load Calculations', description: 'HVAC load calculations and sizing', required: true },
          { title: 'Equipment Specifications', description: 'HVAC equipment specifications and efficiency ratings', required: true },
          { title: 'Ductwork Design', description: 'Ductwork design and layout plans', required: true }
        ]
      }
    };

    // Get checklist for specific county and permit type, or return default
    const countyChecklists = checklists[county] || {};
    const checklist = countyChecklists[permitType] || [
      { title: 'Application Form', description: 'Complete permit application form', required: true },
      { title: 'Site Plan', description: 'Basic site plan showing property and proposed work', required: true },
      { title: 'Construction Plans', description: 'Detailed construction plans and specifications', required: true },
      { title: 'Fee Payment', description: 'Payment of applicable permit fees', required: true }
    ];

    res.json(checklist);
  } catch (error) {
    console.error('Error fetching checklist:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/contractors
router.get('/contractors', protect, async (req, res) => {
  try {
    res.json(mockContractors);
  } catch (error) {
    console.error('Error fetching contractors:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/contractors
router.post('/contractors', protect, async (req, res) => {
  try {
    const { name, license, phone, email, address, specialties } = req.body;

    // Add to mock contractors array
    const newContractor = {
      id: Date.now(), // Simple ID generation for demo
      name,
      license,
      phone,
      email,
      address,
      specialties,
      createdAt: new Date().toISOString()
    };

    mockContractors.push(newContractor);
    res.status(201).json(newContractor);
  } catch (error) {
    console.error('Error creating contractor:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
