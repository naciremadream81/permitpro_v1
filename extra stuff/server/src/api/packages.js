
const express = require('express');
const { protect } = require('../middleware/auth');
const prisma = require('../config/prisma');
const router = express.Router();

// GET /api/packages
router.get('/', protect, async (req, res) => {
  try {
    const packages = await prisma.package.findMany({
      where: req.user.role === 'Admin' ? {} : { userId: req.user.id },
      include: {
        documents: {
          include: {
            uploader: {
              select: { name: true }
            }
          }
        },
        checklist: true,
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    // Transform data to match frontend format
    const transformedPackages = packages.map(pkg => ({
      id: pkg.id,
      customerName: pkg.customerName,
      propertyAddress: pkg.propertyAddress,
      county: pkg.county,
      status: pkg.status,
      createdAt: pkg.createdAt.toISOString(),
      updatedAt: pkg.updatedAt.toISOString(),
      documents: pkg.documents.map(doc => ({
        id: doc.id,
        name: doc.name,
        version: doc.version,
        uploadedAt: doc.uploadedAt.toISOString(),
        uploader: doc.uploader.name,
        url: doc.url
      })),
      checklist: pkg.checklist
    }));

    res.json(transformedPackages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/packages
router.post('/', protect, async (req, res) => {
  try {
    const { customerName, propertyAddress, county } = req.body;

    const newPackage = await prisma.package.create({
      data: {
        customerName,
        propertyAddress,
        county,
        userId: req.user.id,
        checklist: {
          create: [
            { item: 'Site Plan', completed: false },
            { item: 'Floor Plan', completed: false },
            { item: 'Elevation Drawings', completed: false },
            { item: 'Structural Plans', completed: false },
            { item: 'Electrical Plans', completed: false },
            { item: 'Plumbing Plans', completed: false }
          ]
        }
      },
      include: {
        documents: {
          include: {
            uploader: {
              select: { name: true }
            }
          }
        },
        checklist: true,
        user: {
          select: { name: true, email: true }
        }
      }
    });

    const transformedPackage = {
      id: newPackage.id,
      customerName: newPackage.customerName,
      propertyAddress: newPackage.propertyAddress,
      county: newPackage.county,
      status: newPackage.status,
      createdAt: newPackage.createdAt.toISOString(),
      updatedAt: newPackage.updatedAt.toISOString(),
      documents: [],
      checklist: newPackage.checklist
    };

    res.status(201).json(transformedPackage);
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

    // Check if package exists and user has access
    const existingPackage = await prisma.package.findFirst({
      where: {
        id,
        ...(req.user.role === 'Admin' ? {} : { userId: req.user.id })
      }
    });

    if (!existingPackage) {
      return res.status(404).json({ message: 'Package not found' });
    }

    const updatedPackage = await prisma.package.update({
      where: { id },
      data: { status },
      include: {
        documents: {
          include: {
            uploader: {
              select: { name: true }
            }
          }
        },
        checklist: true
      }
    });

    res.json({
      id: updatedPackage.id,
      status: updatedPackage.status,
      updatedAt: updatedPackage.updatedAt.toISOString()
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

    // Check if package exists and user has access
    const existingPackage = await prisma.package.findFirst({
      where: {
        id,
        ...(req.user.role === 'Admin' ? {} : { userId: req.user.id })
      }
    });

    if (!existingPackage) {
      return res.status(404).json({ message: 'Package not found' });
    }

    const newDocument = await prisma.document.create({
      data: {
        name,
        url,
        packageId: id,
        uploaderId: req.user.id
      },
      include: {
        uploader: {
          select: { name: true }
        }
      }
    });

    // Update package updatedAt
    await prisma.package.update({
      where: { id },
      data: { updatedAt: new Date() }
    });

    const transformedDocument = {
      id: newDocument.id,
      name: newDocument.name,
      version: newDocument.version,
      uploadedAt: newDocument.uploadedAt.toISOString(),
      uploader: newDocument.uploader.name,
      url: newDocument.url
    };

    res.status(201).json(transformedDocument);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/packages/:id/download-all
router.get('/packages/:id/download-all', protect, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if package exists and user has access
    const existingPackage = await prisma.package.findFirst({
      where: {
        id,
        ...(req.user.role === 'Admin' ? {} : { userId: req.user.id })
      },
      include: {
        documents: true
      }
    });

    if (!existingPackage) {
      return res.status(404).json({ message: 'Package not found' });
    }

    if (!existingPackage.documents || existingPackage.documents.length === 0) {
      return res.status(404).json({ message: 'No documents to download' });
    }

    // For now, return a simple JSON response
    // In a real implementation, you would create a zip file
    const zipFileName = `${existingPackage.customerName.replace(/\s+/g, '_')}_${existingPackage.id}_Documents.zip`;
    
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);
    
    // Create a simple zip-like response (in real implementation, use a zip library)
    const documentsInfo = existingPackage.documents.map(doc => ({
      name: doc.name,
      url: doc.url,
      uploadedAt: doc.uploadedAt
    }));
    
    res.json({
      message: 'Download simulation - documents would be zipped here',
      documents: documentsInfo,
      packageId: id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/dashboard/stats
router.get('/stats', protect, async (req, res) => {
  try {
    const whereClause = req.user.role === 'Admin' ? {} : { userId: req.user.id };
    
    const [
      totalPackages,
      draftPackages,
      submittedPackages,
      completedPackages,
      totalDocuments
    ] = await Promise.all([
      prisma.package.count({ where: whereClause }),
      prisma.package.count({ where: { ...whereClause, status: 'Draft' } }),
      prisma.package.count({ where: { ...whereClause, status: 'Submitted' } }),
      prisma.package.count({ where: { ...whereClause, status: 'Completed' } }),
      prisma.document.count({
        where: {
          package: whereClause
        }
      })
    ]);

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

module.exports = router;
