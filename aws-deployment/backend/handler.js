const jwt = require('jsonwebtoken');

// Mock user for authentication
const mockUser = {
  id: '1',
  name: 'Demo User',
  email: 'demo@permitpro.com',
  role: 'admin',
  password: 'demo123'
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
  },
  'hvac': {
    name: 'HVAC Permit',
    checklist: [
      'HVAC system design review',
      'Ductwork installation inspection',
      'Equipment mounting verification',
      'Electrical connections check',
      'Gas line connections (if applicable)',
      'System startup and testing',
      'Final inspection and approval'
    ]
  },
  'electrical': {
    name: 'Electrical Permit',
    checklist: [
      'Electrical plans review',
      'Rough-in electrical inspection',
      'Panel installation verification',
      'Outlet and switch installation',
      'GFCI and AFCI compliance check',
      'Final electrical inspection',
      'Certificate of completion'
    ]
  },
  'plumbing': {
    name: 'Plumbing Permit',
    checklist: [
      'Plumbing plans review',
      'Rough-in plumbing inspection',
      'Water line installation',
      'Drain line installation',
      'Fixture installation verification',
      'Pressure testing',
      'Final plumbing inspection'
    ]
  }
};

// Mock packages data
const mockPackages = [
  {
    id: 1,
    customerName: 'John Smith',
    customerPhone: '(305) 555-0123',
    customerEmail: 'john.smith@email.com',
    customerAddress: '789 Customer Lane, Miami, FL 33101',
    propertyAddress: '123 Main St, Miami, FL 33101',
    propertyParcelId: 'PAR-2024-001',
    propertyZoning: 'R-1 Residential',
    contractorName: 'ABC Construction LLC',
    contractorLicense: 'CBC1234567',
    contractorPhone: '(305) 555-0456',
    contractorEmail: 'contact@abcconstruction.com',
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
    customerName: 'Jane Doe',
    customerPhone: '(407) 555-0789',
    customerEmail: 'jane.doe@email.com',
    customerAddress: '456 Customer Ave, Orlando, FL 32801',
    propertyAddress: '456 Oak Ave, Orlando, FL 32801',
    propertyParcelId: 'PAR-2024-002',
    propertyZoning: 'R-2 Residential',
    contractorName: 'XYZ Builders Inc',
    contractorLicense: 'CBC7654321',
    contractorPhone: '(407) 555-0321',
    contractorEmail: 'info@xyzbuilders.com',
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
    county: 'Orange',
    permitType: 'shed',
    permitNumber: 'SH-2024-002',
    status: 'Submitted',
    createdAt: new Date().toISOString(),
    documents: [],
    checklistItems: permitTypeConfigs['shed'].checklist.map((item, index) => ({
      id: index + 1,
      description: item,
      completed: index < 2,
      completedAt: index < 2 ? new Date().toISOString() : null,
      notes: index === 0 ? 'Verified 10ft setback from property line' : ''
    }))
  }
];

// Helper function to create response
const createResponse = (statusCode, body, headers = {}) => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
      ...headers
    },
    body: JSON.stringify(body)
  };
};

// Helper function to authenticate token
const authenticateToken = (event) => {
  const authHeader = event.headers.Authorization || event.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return null;
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key');
    return decoded;
  } catch (error) {
    return null;
  }
};

// Health check handler
exports.health = async (event, context) => {
  return createResponse(200, {
    status: 'OK',
    message: 'PermitPro API is running',
    timestamp: new Date().toISOString()
  });
};

// Main API handler
exports.api = async (event, context) => {
  const path = event.path;
  const method = event.httpMethod;
  
  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return createResponse(200, {});
  }
  
  // Health check
  if (path === '/health' || path === '/api/health') {
    return createResponse(200, {
      status: 'OK',
      message: 'PermitPro API is running',
      timestamp: new Date().toISOString()
    });
  }
  
  // Authentication endpoints
  if (path === '/api/auth/login' && method === 'POST') {
    try {
      const { email, password } = JSON.parse(event.body || '{}');
      
      if (email === mockUser.email && password === mockUser.password) {
        const token = jwt.sign(
          { userId: mockUser.id, email: mockUser.email },
          process.env.JWT_SECRET || 'your-super-secret-jwt-key',
          { expiresIn: '24h' }
        );
        
        return createResponse(200, {
          token,
          user: {
            id: mockUser.id,
            name: mockUser.name,
            email: mockUser.email,
            role: mockUser.role
          }
        });
      } else {
        return createResponse(401, { error: 'Invalid credentials' });
      }
    } catch (error) {
      return createResponse(500, { error: 'Internal server error' });
    }
  }
  
  // Get permit types
  if (path === '/api/permit-types' && method === 'GET') {
    const permitTypes = Object.entries(permitTypeConfigs).map(([value, config]) => ({
      value,
      label: config.name
    }));
    
    return createResponse(200, permitTypes);
  }
  
  // Get permits
  if (path === '/api/permits' && method === 'GET') {
    const user = authenticateToken(event);
    if (!user) {
      return createResponse(401, { error: 'Unauthorized' });
    }
    
    return createResponse(200, {
      packages: mockPackages,
      user: { name: mockUser.name }
    });
  }
  
  // Create permit
  if (path === '/api/permits' && method === 'POST') {
    const user = authenticateToken(event);
    if (!user) {
      return createResponse(401, { error: 'Unauthorized' });
    }
    
    try {
      const { 
        customerName, customerPhone, customerEmail, customerAddress,
        propertyAddress, propertyParcelId, propertyZoning,
        contractorName, contractorLicense, contractorPhone, contractorEmail,
        subcontractors,
        county, permitType 
      } = JSON.parse(event.body || '{}');
      
      // Generate checklist based on permit type
      const typeConfig = permitTypeConfigs[permitType];
      if (!typeConfig) {
        return createResponse(400, { error: 'Invalid permit type' });
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
        customerName,
        customerPhone,
        customerEmail,
        customerAddress,
        propertyAddress,
        propertyParcelId,
        propertyZoning,
        contractorName,
        contractorLicense,
        contractorPhone,
        contractorEmail,
        contractors,
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
      return createResponse(201, newPackage);
    } catch (error) {
      return createResponse(500, { error: 'Internal server error' });
    }
  }
  
  // Update permit status
  if (path.match(/^\/api\/permits\/\d+\/status$/) && method === 'PATCH') {
    const user = authenticateToken(event);
    if (!user) {
      return createResponse(401, { error: 'Unauthorized' });
    }
    
    try {
      const packageId = parseInt(path.split('/')[3]);
      const { status } = JSON.parse(event.body || '{}');
      
      const packageIndex = mockPackages.findIndex(pkg => pkg.id === packageId);
      if (packageIndex === -1) {
        return createResponse(404, { error: 'Package not found' });
      }
      
      mockPackages[packageIndex].status = status;
      mockPackages[packageIndex].updatedAt = new Date().toISOString();
      
      return createResponse(200, mockPackages[packageIndex]);
    } catch (error) {
      return createResponse(500, { error: 'Internal server error' });
    }
  }
  
  // Upload document
  if (path.match(/^\/api\/permits\/\d+\/documents$/) && method === 'POST') {
    const user = authenticateToken(event);
    if (!user) {
      return createResponse(401, { error: 'Unauthorized' });
    }
    
    try {
      const packageId = parseInt(path.split('/')[3]);
      const documentData = JSON.parse(event.body || '{}');
      
      const packageIndex = mockPackages.findIndex(pkg => pkg.id === packageId);
      if (packageIndex === -1) {
        return createResponse(404, { error: 'Package not found' });
      }
      
      const newDocument = {
        id: Date.now(),
        name: documentData.name || 'Document',
        type: documentData.type || 'application/pdf',
        uploadedAt: new Date().toISOString()
      };
      
      mockPackages[packageIndex].documents.push(newDocument);
      
      return createResponse(201, newDocument);
    } catch (error) {
      return createResponse(500, { error: 'Internal server error' });
    }
  }
  
  // Default 404
  return createResponse(404, { error: 'Not found' });
};