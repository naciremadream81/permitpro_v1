const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 8080;
const JWT_SECRET = 'demo-secret-key';

// Mock data
const mockUser = {
  id: 1,
  email: 'demo@permitpro.com',
  password: 'demo123',
  name: 'Demo User',
  role: 'admin'
};

// Permit type configurations with standardized Charlotte County checklists
const permitTypeConfigs = {
  'mobile-home': {
    name: 'Mobile Home',
    description: 'Installation of a new or replacement mobile/manufactured home. Must be HUD Wind Zone 3 compliant.',
    checklist: [
      'Application Package for Mobile/Manufactured Home Permit',
      'Notice of Commencement (if contract > $5,000)',
      'HUD Wind Zone 3 compliance letter from manufacturer',
      'Foundation and stairs plans (signed/sealed)',
      'Drainage/Site Plan with setbacks and elevations',
      'Survey (signed/sealed)',
      'Drainage Survey (As Built) - post-construction elevations',
      'Tree Permit Application (if removing trees)',
      'No Public Utility Structures On-Site Affidavit',
      'Fire Hydrant Accessibility/Location Affidavit',
      'Public Sewer, Private Septic & Water Service Affidavit',
      'Subcontractor Worksheet (if applicable)',
      'CCU or FDOH approval letter',
      'Elevation Certificate (Final) - if in SFHA',
      'No Impact Certification (if in floodway)',
      'Intake/Sufficiency Review',
      'Building Code Compliance Review',
      'Natural Resources Review (protected species)',
      'Right-of-Way Review',
      'Tree Review (heritage trees)',
      'Utilities Review (CCU connection)',
      'Zoning Review (setbacks, land development)',
      'Foundation Installation Inspection',
      'Tie-down System Inspection',
      'Electrical Hookup Inspection',
      'Plumbing Connections Inspection',
      'Final Building Inspection'
    ]
  },
  'modular-home': {
    name: 'Modular Home',
    description: 'Installation of a new or replacement modular home. Must be Florida DBPR compliant.',
    checklist: [
      'Application for Construction Permit',
      'Tree Permit Application Package',
      'Notice of Commencement (if contract > $5,000)',
      'Florida DBPR approval proof',
      'Foundation drawings/plans (signed/sealed)',
      'Elevation Certificate (Final) - if in SFHA',
      'Drainage/Site Plan with setbacks and elevations',
      'Survey (signed/sealed)',
      'Drainage Survey (As Built) - post-construction elevations',
      'Tree Permit Application (if removing trees)',
      'CCU or FDOH approval letter',
      'No Public Utility Structures On-Site Affidavit',
      'Fire Hydrant Accessibility/Location Affidavit',
      'Public Sewer, Private Septic & Water Service Affidavit',
      'Subcontractor Worksheet (if applicable)',
      'Owner-Builder Disclosure (if applicable)',
      'Intake/Sufficiency Review',
      'Addressing Review',
      'Building Code Compliance Review',
      'FDOH Review (if applicable)',
      'Natural Resources Review (protected species)',
      'Overlay Districts Review (if applicable)',
      'Right-of-Way Review',
      'Tree Review (heritage trees)',
      'Utilities Review (CCU connection)',
      'Zoning Review (setbacks, land development)',
      'Foundation Installation Inspection',
      'Modular Unit Delivery Inspection',
      'Electrical Rough-in Inspection',
      'Plumbing Rough-in Inspection',
      'HVAC Installation Inspection',
      'Final Building Inspection',
      'Certificate of Occupancy'
    ]
  },
  'shed': {
    name: 'Shed Permit',
    description: 'Construction of accessory storage structures.',
    checklist: [
      'Building Permit Application',
      'Site Plan with setbacks',
      'Foundation/Slab Plans',
      'Structural Plans (if required)',
      'Zoning Review (setbacks, lot coverage)',
      'Building Code Review',
      'Foundation/Slab Inspection',
      'Structural Framing Inspection',
      'Roofing Inspection',
      'Final Inspection'
    ]
  },
  'addition': {
    name: 'Home Addition',
    description: 'Construction of additions to existing residential structures.',
    checklist: [
      'Building Permit Application',
      'Architectural Plans (signed/sealed)',
      'Structural Plans (signed/sealed)',
      'Site Plan with setbacks',
      'Survey (if required)',
      'Zoning Review (setbacks, lot coverage)',
      'Building Code Review',
      'Foundation Inspection',
      'Framing Inspection',
      'Electrical Rough-in Inspection',
      'Plumbing Rough-in Inspection',
      'Insulation Inspection',
      'Drywall Inspection',
      'Final Inspection'
    ]
  },
  'hvac': {
    name: 'HVAC Permit',
    description: 'Installation or replacement of heating, ventilation, and air conditioning systems.',
    checklist: [
      'HVAC Permit Application',
      'HVAC System Design Plans',
      'Equipment Specifications',
      'Ductwork Design Plans',
      'Electrical Load Calculations',
      'Gas Line Plans (if applicable)',
      'Building Code Review',
      'Electrical Review',
      'Gas Line Review (if applicable)',
      'Ductwork Installation Inspection',
      'Equipment Mounting Inspection',
      'Electrical Connections Inspection',
      'Gas Line Connections Inspection (if applicable)',
      'System Startup and Testing',
      'Final HVAC Inspection'
    ]
  },
  'electrical': {
    name: 'Electrical Permit',
    description: 'Installation or modification of electrical systems.',
    checklist: [
      'Electrical Permit Application',
      'Electrical Plans (signed/sealed)',
      'Load Calculations',
      'Panel Schedule',
      'GFCI/AFCI Requirements Review',
      'Building Code Review',
      'Electrical Code Review',
      'Rough-in Electrical Inspection',
      'Panel Installation Inspection',
      'Outlet and Switch Installation Inspection',
      'GFCI and AFCI Compliance Inspection',
      'Final Electrical Inspection',
      'Certificate of Completion'
    ]
  },
  'plumbing': {
    name: 'Plumbing Permit',
    description: 'Installation or modification of plumbing systems.',
    checklist: [
      'Plumbing Permit Application',
      'Plumbing Plans (signed/sealed)',
      'Fixture Specifications',
      'Water Line Plans',
      'Drain Line Plans',
      'Building Code Review',
      'Plumbing Code Review',
      'Rough-in Plumbing Inspection',
      'Water Line Installation Inspection',
      'Drain Line Installation Inspection',
      'Fixture Installation Inspection',
      'Pressure Testing',
      'Final Plumbing Inspection'
    ]
  }
};

// Contractors database
let contractors = [
  {
    id: '1',
    name: 'ABC Construction LLC',
    license: 'CBC1234567',
    phone: '(305) 555-0456',
    email: 'contact@abcconstruction.com',
    specialties: 'General Construction, Renovations',
    status: 'active'
  },
  {
    id: '2',
    name: 'XYZ Builders Inc',
    license: 'CBC7654321',
    phone: '(407) 555-0321',
    email: 'info@xyzbuilders.com',
    specialties: 'Residential Construction, Additions',
    status: 'active'
  },
  {
    id: '3',
    name: 'Elite Electrical Services',
    license: 'EC123456',
    phone: '(305) 555-0101',
    email: 'info@eliteelectrical.com',
    specialties: 'Electrical, HVAC',
    status: 'active'
  },
  {
    id: '4',
    name: 'Premier Plumbing Co',
    license: 'PC789012',
    phone: '(305) 555-0202',
    email: 'info@premierplumbing.com',
    specialties: 'Plumbing, Water Systems',
    status: 'active'
  }
];

const mockPackages = [
  {
    id: 1,
    // Customer Information
    customerName: 'John Smith',
    customerPhone: '(305) 555-0123',
    customerEmail: 'john.smith@email.com',
    customerAddress: '789 Customer Lane, Miami, FL 33101',
    
    // Property Information
    propertyAddress: '123 Main St, Miami, FL 33101',
    propertyParcelId: 'PAR-2024-001',
    propertyZoning: 'R-1 Residential',
    
    // Primary Contractor Information
    contractorName: 'ABC Construction LLC',
    contractorLicense: 'CBC1234567',
    contractorPhone: '(305) 555-0456',
    contractorEmail: 'contact@abcconstruction.com',
    
    // Contractors array for detailed display
    contractors: [
      {
        id: 'primary',
        name: 'ABC Construction LLC',
        license: 'CBC1234567',
        phone: '(305) 555-0456',
        email: 'contact@abcconstruction.com',
        role: 'Primary Contractor',
        specialties: 'General Construction, Renovations'
      },
      {
        id: 'sub-1',
        name: 'Elite Electrical Services',
        license: 'EC123456',
        phone: '(305) 555-0101',
        email: 'info@eliteelectrical.com',
        role: 'Subcontractor',
        specialties: 'Electrical, HVAC'
      }
    ],
    
    // Permit Details
    county: 'Miami-Dade',
    permitType: 'mobile-home',
    permitNumber: 'MH-2024-001',
    
    status: 'Draft',
    createdAt: new Date().toISOString(),
    documents: [],
    checklistItems: permitTypeConfigs['mobile-home'].checklist.map((item, index) => ({
      id: index + 1,
      description: item,
      completed: false,
      completedAt: null,
      notes: ''
    }))
  },
  {
    id: 2,
    // Customer Information
    customerName: 'Jane Doe',
    customerPhone: '(407) 555-0789',
    customerEmail: 'jane.doe@email.com',
    customerAddress: '456 Customer Ave, Orlando, FL 32801',
    
    // Property Information
    propertyAddress: '456 Oak Ave, Orlando, FL 32801',
    propertyParcelId: 'PAR-2024-002',
    propertyZoning: 'R-2 Residential',
    
    // Primary Contractor Information
    contractorName: 'XYZ Builders Inc',
    contractorLicense: 'CBC7654321',
    contractorPhone: '(407) 555-0321',
    contractorEmail: 'info@xyzbuilders.com',
    
    // Contractors array for detailed display
    contractors: [
      {
        id: 'primary',
        name: 'XYZ Builders Inc',
        license: 'CBC7654321',
        phone: '(407) 555-0321',
        email: 'info@xyzbuilders.com',
        role: 'Primary Contractor',
        specialties: 'Residential Construction, Additions'
      },
      {
        id: 'sub-1',
        name: 'Premier Plumbing Co',
        license: 'PC789012',
        phone: '(305) 555-0202',
        email: 'info@premierplumbing.com',
        role: 'Subcontractor',
        specialties: 'Plumbing, Water Systems'
      }
    ],
    
    // Permit Details
    county: 'Orange',
    permitType: 'shed',
    permitNumber: 'SH-2024-002',
    
    status: 'Submitted',
    createdAt: new Date().toISOString(),
    documents: [],
    checklistItems: permitTypeConfigs['shed'].checklist.map((item, index) => ({
      id: index + 1,
      description: item,
      completed: index < 2, // First 2 items completed
      completedAt: index < 2 ? new Date().toISOString() : null,
      notes: index === 0 ? 'Verified 10ft setback from property line' : ''
    }))
  }
];

// Middleware
app.use(cors());
app.use(express.json());

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email === mockUser.email && password === mockUser.password) {
      const token = jwt.sign(
        { userId: mockUser.id, email: mockUser.email, role: mockUser.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role
        }
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Permits endpoints
app.get('/api/permits', authenticateToken, async (req, res) => {
  try {
    res.json({ 
      packages: mockPackages,
      user: { name: mockUser.name }
    });
  } catch (error) {
    console.error('Get permits error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/permits', authenticateToken, async (req, res) => {
  try {
    const { 
      customerName, customerPhone, customerEmail, customerAddress,
      propertyAddress, propertyParcelId, propertyZoning,
      contractorName, contractorLicense, contractorPhone, contractorEmail,
      subcontractors,
      county, permitType 
    } = req.body;

    // Generate checklist based on permit type
    const typeConfig = permitTypeConfigs[permitType];
    if (!typeConfig) {
      return res.status(400).json({ error: 'Invalid permit type' });
    }

    // Prepare contractors array for display
    const contractors = [];
    
    // Add primary contractor
    if (contractorName) {
      contractors.push({
        id: 'primary',
        name: contractorName,
        license: contractorLicense,
        phone: contractorPhone,
        email: contractorEmail,
        role: 'Primary Contractor',
        specialties: 'General Construction'
      });
    }
    
    // Add subcontractors
    if (subcontractors && Array.isArray(subcontractors)) {
      subcontractors.forEach((sub, index) => {
        contractors.push({
          id: `sub-${index}`,
          name: sub.name,
          license: sub.license,
          phone: sub.phone,
          email: sub.email,
          role: 'Subcontractor',
          specialties: sub.specialties || 'Specialized Services'
        });
      });
    }

    const newPackage = {
      id: mockPackages.length + 1,
      // Customer Information
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      // Property Information
      propertyAddress,
      propertyParcelId,
      propertyZoning,
      // Contractor Information (legacy fields for compatibility)
      contractorName,
      contractorLicense,
      contractorPhone,
      contractorEmail,
      // Contractors array for detailed display
      contractors,
      // Permit Details
      county,
      permitType,
      permitNumber: `${permitType.toUpperCase()}-2024-${String(mockPackages.length + 1).padStart(3, '0')}`,
      status: 'Draft',
      createdAt: new Date().toISOString(),
      documents: [],
      checklistItems: typeConfig.checklist.map((item, index) => ({
        id: index + 1,
        description: item,
        completed: false,
        completedAt: null,
        notes: ''
      }))
    };

    mockPackages.unshift(newPackage);
    res.status(201).json(newPackage);
  } catch (error) {
    console.error('Create permit error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/api/permits/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const packageIndex = mockPackages.findIndex(pkg => pkg.id === parseInt(id));
    if (packageIndex === -1) {
      return res.status(404).json({ error: 'Package not found' });
    }

    mockPackages[packageIndex].status = status;
    res.json(mockPackages[packageIndex]);
  } catch (error) {
    console.error('Update permit status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get available permit types
app.get('/api/permit-types', (req, res) => {
  const types = Object.keys(permitTypeConfigs).map(key => ({
    value: key,
    label: permitTypeConfigs[key].name
  }));
  res.json(types);
});

// Update checklist item
app.patch('/api/permits/:id/checklist/:itemId', authenticateToken, async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const { completed, notes } = req.body;

    const packageIndex = mockPackages.findIndex(pkg => pkg.id === parseInt(id));
    if (packageIndex === -1) {
      return res.status(404).json({ error: 'Package not found' });
    }

    const itemIndex = mockPackages[packageIndex].checklistItems.findIndex(
      item => item.id === parseInt(itemId)
    );
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Checklist item not found' });
    }

    mockPackages[packageIndex].checklistItems[itemIndex] = {
      ...mockPackages[packageIndex].checklistItems[itemIndex],
      completed: completed !== undefined ? completed : mockPackages[packageIndex].checklistItems[itemIndex].completed,
      completedAt: completed ? new Date().toISOString() : null,
      notes: notes !== undefined ? notes : mockPackages[packageIndex].checklistItems[itemIndex].notes
    };

    res.json(mockPackages[packageIndex].checklistItems[itemIndex]);
  } catch (error) {
    console.error('Update checklist item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/permits/:id/download-all', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const packageIndex = mockPackages.findIndex(pkg => pkg.id === parseInt(id));
    if (packageIndex === -1) {
      return res.status(404).json({ error: 'Package not found' });
    }

    const packageData = mockPackages[packageIndex];
    
    if (!packageData.documents || packageData.documents.length === 0) {
      return res.status(400).json({ error: 'No documents to download' });
    }

    // In a real implementation, you would:
    // 1. Create a zip file containing all documents
    // 2. Stream the zip file to the client
    // For demo purposes, we'll create a mock zip response
    
    const zipFileName = `${packageData.customerName.replace(/\s+/g, '_')}_${packageData.permitNumber || packageData.id}_Documents.zip`;
    
    // Mock zip file content (in reality, you'd use a library like 'archiver' or 'jszip')
    const mockZipContent = `Mock ZIP file containing ${packageData.documents.length} documents for ${packageData.customerName}`;
    
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);
    res.send(Buffer.from(mockZipContent));
    
  } catch (error) {
    console.error('Download all error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/permits/:id/documents', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, url } = req.body;

    const packageIndex = mockPackages.findIndex(pkg => pkg.id === parseInt(id));
    if (packageIndex === -1) {
      return res.status(404).json({ error: 'Package not found' });
    }

    const document = {
      id: Date.now(),
      name,
      url: url || `https://example.com/documents/${name}`,
      uploadedAt: new Date().toISOString()
    };

    mockPackages[packageIndex].documents.push(document);
    res.status(201).json(document);
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
// Admin API endpoints for contractor management
app.get('/api/admin/contractors', authenticateToken, (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  res.json(contractors);
});

app.post('/api/admin/contractors', authenticateToken, (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const { name, license, phone, email, specialties, status } = req.body;
  const newContractor = {
    id: Date.now().toString(),
    name,
    license,
    phone,
    email,
    specialties,
    status: status || 'active'
  };
  
  contractors.push(newContractor);
  res.status(201).json(newContractor);
});

app.put('/api/admin/contractors/:id', authenticateToken, (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const { id } = req.params;
  const contractorIndex = contractors.findIndex(c => c.id === id);
  
  if (contractorIndex === -1) {
    return res.status(404).json({ error: 'Contractor not found' });
  }
  
  contractors[contractorIndex] = { ...contractors[contractorIndex], ...req.body };
  res.json(contractors[contractorIndex]);
});

app.delete('/api/admin/contractors/:id', authenticateToken, (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const { id } = req.params;
  const contractorIndex = contractors.findIndex(c => c.id === id);
  
  if (contractorIndex === -1) {
    return res.status(404).json({ error: 'Contractor not found' });
  }
  
  contractors.splice(contractorIndex, 1);
  res.json({ message: 'Contractor deleted successfully' });
});

// Admin API endpoints for permit type management
app.get('/api/admin/permit-types', authenticateToken, (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  res.json(permitTypeConfigs);
});

app.put('/api/admin/permit-types/:type', authenticateToken, (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const { type } = req.params;
  const { checklist } = req.body;
  
  if (!permitTypeConfigs[type]) {
    return res.status(404).json({ error: 'Permit type not found' });
  }
  
  permitTypeConfigs[type].checklist = checklist;
  res.json(permitTypeConfigs[type]);
});

app.post('/api/admin/permit-types/:type/checklist', authenticateToken, (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const { type } = req.params;
  const { item } = req.body;
  
  if (!permitTypeConfigs[type]) {
    return res.status(404).json({ error: 'Permit type not found' });
  }
  
  permitTypeConfigs[type].checklist.push(item);
  res.json(permitTypeConfigs[type]);
});

app.delete('/api/admin/permit-types/:type/checklist/:index', authenticateToken, (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const { type, index } = req.params;
  const itemIndex = parseInt(index);
  
  if (!permitTypeConfigs[type]) {
    return res.status(404).json({ error: 'Permit type not found' });
  }
  
  if (itemIndex < 0 || itemIndex >= permitTypeConfigs[type].checklist.length) {
    return res.status(404).json({ error: 'Checklist item not found' });
  }
  
  permitTypeConfigs[type].checklist.splice(itemIndex, 1);
  res.json(permitTypeConfigs[type]);
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Mock PermitPro server running on port ${PORT}`);
  console.log(`Demo login: demo@permitpro.com / demo123`);
});

process.on('SIGINT', () => {
  console.log('Server shutting down...');
  process.exit(0);
});
