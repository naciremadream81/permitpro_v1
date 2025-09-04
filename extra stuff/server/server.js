const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'demo-secret-key';

// Mock data
const mockUser = {
  id: 1,
  email: 'demo@permitpro.com',
  password: 'demo123',
  name: 'Demo User',
  role: 'admin'
};

// Permit type configurations with specific checklists
const permitTypeConfigs = {
  'mobile-home': {
    name: 'Mobile Home',
    checklist: [
      'Site plan approval',
      'Foundation inspection',
      'Electrical hookup verification',
      'Plumbing connections check',
      'Tie-down system inspection',
      'Final occupancy inspection'
    ]
  },
  'modular-home': {
    name: 'Modular Home',
    checklist: [
      'Foundation permit',
      'Modular unit delivery approval',
      'Electrical rough-in inspection',
      'Plumbing rough-in inspection',
      'HVAC installation check',
      'Final building inspection',
      'Certificate of occupancy'
    ]
  },
  'shed': {
    name: 'Shed Permit',
    checklist: [
      'Setback requirements verification',
      'Foundation/slab inspection',
      'Structural framing check',
      'Roofing inspection',
      'Final inspection'
    ]
  },
  'addition': {
    name: 'Home Addition',
    checklist: [
      'Building permit application',
      'Structural plans review',
      'Foundation inspection',
      'Framing inspection',
      'Electrical rough-in',
      'Plumbing rough-in',
      'Insulation inspection',
      'Drywall inspection',
      'Final inspection'
    ]
  }
};

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
        { userId: mockUser.id, email: mockUser.email },
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
      county, permitType 
    } = req.body;

    // Generate checklist based on permit type
    const typeConfig = permitTypeConfigs[permitType];
    if (!typeConfig) {
      return res.status(400).json({ error: 'Invalid permit type' });
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
      // Contractor Information
      contractorName,
      contractorLicense,
      contractorPhone,
      contractorEmail,
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
