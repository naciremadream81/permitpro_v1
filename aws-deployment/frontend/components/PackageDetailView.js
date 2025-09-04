'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent, Button, Badge, Modal, Input } from './ui';
import { ArrowLeft, Upload, Download, FileText, Calendar, MapPin, User, Archive, FileBarChart } from 'lucide-react';
import { apiService } from '../lib/api';

export default function PackageDetailView({ 
  packageData, 
  onBack, 
  onUpdate 
}) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({ name: '', file: null });
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  // Debug logging
  console.log('PackageDetailView - packageData:', packageData);
  console.log('PackageDetailView - contractors:', packageData?.contractors);
  console.log('PackageDetailView - checklistItems:', packageData?.checklistItems);
  
  // Fallback for missing contractors - show legacy contractor data
  const displayContractors = packageData?.contractors || [];
  if (displayContractors.length === 0 && packageData?.contractorName) {
    displayContractors.push({
      id: 'legacy-primary',
      name: packageData.contractorName,
      license: packageData.contractorLicense || '',
      phone: packageData.contractorPhone || '',
      email: packageData.contractorEmail || '',
      role: 'Primary Contractor',
      specialties: 'General Construction'
    });
  }
  
  // Fallback for missing checklist - show basic info
  const displayChecklist = packageData?.checklistItems || [];

  const handleStatusChange = async (newStatus) => {
    setLoading(true);
    try {
      await apiService.updatePackageStatus(packageData.id, newStatus);
      onUpdate({ ...packageData, status: newStatus });
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAllDocuments = async () => {
    setDownloading(true);
    try {
      // Create a zip file with all package documents
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      // Add package information as a text file
      const packageInfo = `
PERMIT PACKAGE SUBMISSION
========================

Package ID: ${packageData.id}
Permit Number: ${packageData.permitNumber || 'N/A'}
Customer: ${packageData.customerName}
Property: ${packageData.propertyAddress}
County: ${packageData.county}
Permit Type: ${packageData.permitType}
Status: ${packageData.status}
Created: ${new Date(packageData.createdAt).toLocaleString()}

CONTRACTORS
===========
${displayContractors.map(contractor => `
${contractor.role}: ${contractor.name}
License: ${contractor.license}
Phone: ${contractor.phone}
Email: ${contractor.email}
Specialties: ${contractor.specialties}
`).join('\n')}

CHECKLIST ITEMS
==============
${displayChecklist.map((item, index) => `
${index + 1}. ${item.description}
   Status: ${item.completed ? 'Completed' : 'Pending'}
   ${item.notes ? `Notes: ${item.notes}` : ''}
`).join('\n')}

DOCUMENTS
=========
${packageData.documents?.map(doc => `- ${doc.name} (${doc.type})`).join('\n') || 'No documents uploaded'}
      `.trim();
      
      zip.file('Package_Information.txt', packageInfo);
      
      // Add any uploaded documents (if they exist)
      if (packageData.documents && packageData.documents.length > 0) {
        const documentsFolder = zip.folder('Documents');
        packageData.documents.forEach(doc => {
          // For now, add placeholder files since we don't have actual file data
          documentsFolder.file(doc.name, `Document: ${doc.name}\nType: ${doc.type}\nUploaded: ${doc.uploadedAt || 'Unknown'}`);
        });
      }
      
      // Generate and download the zip file
      const content = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `PermitPackage_${packageData.id}_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Failed to create zip file:', error);
      alert('Failed to create download package. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    try {
      // Generate a comprehensive report of all packages
      const reportData = await apiService.getPermits();
      const packages = reportData.packages || [];
      
      const report = `
PERMIT PRO SYSTEM - COMPREHENSIVE REPORT
========================================

Generated: ${new Date().toLocaleString()}
Total Packages: ${packages.length}

PACKAGE SUMMARY
===============
${packages.map((pkg, index) => `
${index + 1}. Package ${pkg.id}
   Customer: ${pkg.customerName}
   Property: ${pkg.propertyAddress}
   County: ${pkg.county}
   Permit Type: ${pkg.permitType}
   Status: ${pkg.status}
   Created: ${new Date(pkg.createdAt).toLocaleString()}
   ${pkg.contractorName ? `Primary Contractor: ${pkg.contractorName}` : ''}
`).join('\n')}

STATUS BREAKDOWN
================
${Object.entries(
  packages.reduce((acc, pkg) => {
    acc[pkg.status] = (acc[pkg.status] || 0) + 1;
    return acc;
  }, {})
).map(([status, count]) => `${status}: ${count} packages`).join('\n')}

COUNTY BREAKDOWN
================
${Object.entries(
  packages.reduce((acc, pkg) => {
    acc[pkg.county] = (acc[pkg.county] || 0) + 1;
    return acc;
  }, {})
).map(([county, count]) => `${county}: ${count} packages`).join('\n')}

PERMIT TYPE BREAKDOWN
=====================
${Object.entries(
  packages.reduce((acc, pkg) => {
    acc[pkg.permitType] = (acc[pkg.permitType] || 0) + 1;
    return acc;
  }, {})
).map(([type, count]) => `${type}: ${count} packages`).join('\n')}
      `.trim();
      
      // Create and download the report
      const blob = new Blob([report], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `PermitPro_Report_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setGeneratingReport(false);
    }
  };


  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!uploadData.file) return;

    setLoading(true);
    try {
      const documentData = {
        name: uploadData.name || uploadData.file.name,
        url: `documents/${packageData.id}/${uploadData.file.name}`,
        packageId: packageData.id
      };
      
      await apiService.uploadDocument(packageData.id, documentData);
      
      const updatedPackage = {
        ...packageData,
        documents: [...(packageData.documents || []), documentData]
      };
      
      onUpdate(updatedPackage);
      setShowUploadModal(false);
      setUploadData({ name: '', file: null });
    } catch (error) {
      console.error('Failed to upload document:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status) => {
    const variants = {
      'Draft': 'draft',
      'Submitted': 'submitted',
      'Completed': 'completed'
    };
    return variants[status] || 'default';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
            <Button variant="outline" onClick={onBack} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Package Details</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                onClick={handleDownloadAllDocuments}
                disabled={downloading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Archive className="h-4 w-4 mr-2" />
                {downloading ? 'Creating...' : 'Download All'}
              </Button>
              <Button 
                onClick={handleGenerateReport}
                disabled={generatingReport}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <FileBarChart className="h-4 w-4 mr-2" />
                {generatingReport ? 'Generating...' : 'Generate Report'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Package Information */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Package Information</h2>
                  <Badge variant={getStatusVariant(packageData.status)}>
                    {packageData.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start space-x-3">
                    <User className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Customer Name</p>
                      <p className="text-base text-gray-900">{packageData.customerName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Property Address</p>
                      <p className="text-base text-gray-900">{packageData.propertyAddress}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="h-5 w-5 bg-primary-100 rounded mt-0.5 flex items-center justify-center">
                      <div className="h-2 w-2 bg-primary-600 rounded"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">County</p>
                      <p className="text-base text-gray-900">{packageData.county}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Created Date</p>
                      <p className="text-base text-gray-900">
                        {new Date(packageData.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contractors Section */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Contractors
                </h2>
              </CardHeader>
              <CardContent>
                {displayContractors && displayContractors.length > 0 ? (
                  <div className="space-y-4">
                    {displayContractors.map((contractor) => (
                      <div key={contractor.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-lg">{contractor.name}</h4>
                              <Badge variant={contractor.role === 'Primary Contractor' ? 'default' : 'secondary'}>
                                {contractor.role}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                              <p><strong>License:</strong> {contractor.license}</p>
                              <p><strong>Phone:</strong> {contractor.phone}</p>
                              <p><strong>Email:</strong> {contractor.email}</p>
                              {contractor.specialties && (
                                <p><strong>Specialties:</strong> {contractor.specialties}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No contractors assigned</p>
                )}
              </CardContent>
            </Card>

            {/* Checklist Section */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Permit Checklist
                </h2>
              </CardHeader>
              <CardContent>
                {displayChecklist && displayChecklist.length > 0 ? (
                  <div className="space-y-3">
                    {displayChecklist.map((item) => (
                      <div key={item.id} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 mt-1">
                          <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                            item.completed 
                              ? 'border-green-500 bg-green-500 text-white' 
                              : 'border-gray-300'
                          }`}>
                            {item.completed && <span className="text-xs">✓</span>}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900">{item.title}</h4>
                            {item.required && (
                              <span className="inline-block px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                                Required
                              </span>
                            )}
                            {item.completed && (
                              <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                                Completed
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                          )}
                          <div className="flex items-center gap-2">
                            <input
                              type="file"
                              className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                              onChange={(e) => {
                                if (e.target.files[0]) {
                                  // Handle file upload for this checklist item
                                  console.log(`Uploading file for ${item.title}:`, e.target.files[0]);
                                }
                              }}
                            />
                            {item.completed && (
                              <Button variant="secondary" size="sm">
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No checklist items available</p>
                )}
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
                  <div className="flex space-x-2">
                    {packageData.documents && packageData.documents.length > 0 && (
                      <Button 
                        variant="outline" 
                        onClick={handleDownloadAll}
                        disabled={loading}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {loading ? 'Preparing...' : 'Download All'}
                      </Button>
                    )}
                    <Button onClick={() => setShowUploadModal(true)}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {packageData.documents && packageData.documents.length > 0 ? (
                  <div className="space-y-3">
                    {packageData.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{doc.name}</span>
                        </div>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No documents uploaded</h3>
                    <p className="mt-1 text-sm text-gray-500">Upload your first document to get started.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Management */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Status Management</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Draft', 'Submitted', 'Completed'].map((status) => (
                    <Button
                      key={status}
                      variant={packageData.status === status ? 'primary' : 'outline'}
                      className="w-full justify-start"
                      onClick={() => handleStatusChange(status)}
                      disabled={loading}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    Generate Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Send Notification
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Export Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <Modal onClose={() => setShowUploadModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Upload Document</h3>
            </div>
            <form onSubmit={handleUploadDocument} className="p-6 space-y-4">
              <Input
                label="Document Name"
                value={uploadData.name}
                onChange={(e) => setUploadData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter document name"
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select File
                </label>
                <input
                  type="file"
                  onChange={(e) => setUploadData(prev => ({ ...prev, file: e.target.files[0] }))}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}
