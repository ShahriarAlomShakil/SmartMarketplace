import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { productAPI } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { BackdropBlur } from '../ui/BackdropBlur';
import { ModernButton } from '../ui/ModernButton';
import { 
  DocumentArrowDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface ProductExportProps {
  onClose?: () => void;
}

interface ExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  fields: string[];
  status: string[];
  dateRange: {
    from: string;
    to: string;
  };
}

export const ProductExport: React.FC<ProductExportProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'csv',
    fields: ['title', 'description', 'category', 'pricing', 'status', 'createdAt'],
    status: ['active', 'sold', 'draft'],
    dateRange: {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
      to: new Date().toISOString().split('T')[0] // today
    }
  });

  const availableFields = [
    { key: 'title', label: 'Title' },
    { key: 'description', label: 'Description' },
    { key: 'category', label: 'Category' },
    { key: 'condition', label: 'Condition' },
    { key: 'pricing', label: 'Pricing Information' },
    { key: 'location', label: 'Location' },
    { key: 'status', label: 'Status' },
    { key: 'analytics', label: 'Analytics (Views, Favorites)' },
    { key: 'tags', label: 'Tags' },
    { key: 'createdAt', label: 'Created Date' },
    { key: 'updatedAt', label: 'Updated Date' }
  ];

  const statusOptions = [
    { key: 'active', label: 'Active' },
    { key: 'sold', label: 'Sold' },
    { key: 'draft', label: 'Draft' },
    { key: 'inactive', label: 'Inactive' },
    { key: 'deleted', label: 'Deleted' }
  ];

  const handleFieldChange = (field: string, checked: boolean) => {
    setExportOptions(prev => ({
      ...prev,
      fields: checked 
        ? [...prev.fields, field]
        : prev.fields.filter(f => f !== field)
    }));
  };

  const handleStatusChange = (status: string, checked: boolean) => {
    setExportOptions(prev => ({
      ...prev,
      status: checked 
        ? [...prev.status, status]
        : prev.status.filter(s => s !== status)
    }));
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      // Fetch products based on criteria
      const products = await productAPI.getBySeller(user?._id || '', {
        page: 1,
        limit: 1000, // Get all products
        status: 'all'
      });

      // Filter products based on export options
      const filteredProducts = products.data.products.filter((product: any) => {
        // Filter by status
        if (!exportOptions.status.includes(product.status)) return false;
        
        // Filter by date range
        const createdDate = new Date(product.createdAt);
        const fromDate = new Date(exportOptions.dateRange.from);
        const toDate = new Date(exportOptions.dateRange.to);
        
        if (createdDate < fromDate || createdDate > toDate) return false;
        
        return true;
      });

      // Prepare export data
      const exportData = filteredProducts.map((product: any) => {
        const data: any = {};
        
        exportOptions.fields.forEach(field => {
          switch (field) {
            case 'title':
              data.Title = product.title;
              break;
            case 'description':
              data.Description = product.description;
              break;
            case 'category':
              data.Category = product.category;
              break;
            case 'condition':
              data.Condition = product.condition;
              break;
            case 'pricing':
              data['Base Price'] = product.pricing.basePrice;
              data['Min Price'] = product.pricing.minPrice;
              data.Currency = product.pricing.currency;
              break;
            case 'location':
              data.City = product.location?.city || '';
              data.State = product.location?.state || '';
              data.Country = product.location?.country || '';
              break;
            case 'status':
              data.Status = product.status;
              break;
            case 'analytics':
              data.Views = product.analytics?.views || 0;
              data.Favorites = product.analytics?.favorites || 0;
              data.Negotiations = product.analytics?.negotiations || 0;
              break;
            case 'tags':
              data.Tags = product.tags?.join(', ') || '';
              break;
            case 'createdAt':
              data['Created Date'] = new Date(product.createdAt).toLocaleDateString();
              break;
            case 'updatedAt':
              data['Updated Date'] = new Date(product.updatedAt).toLocaleDateString();
              break;
          }
        });
        
        return data;
      });

      // Generate and download file
      if (exportOptions.format === 'csv') {
        downloadCSV(exportData);
      } else if (exportOptions.format === 'json') {
        downloadJSON(exportData);
      } else if (exportOptions.format === 'xlsx') {
        // For now, fallback to CSV
        downloadCSV(exportData);
      }

      onClose?.();
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export products. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const downloadCSV = (data: any[]) => {
    if (data.length === 0) {
      alert('No products found matching your criteria.');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => 
          `"${String(row[header] || '').replace(/"/g, '""')}"`)
        .join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `products-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadJSON = (data: any[]) => {
    if (data.length === 0) {
      alert('No products found matching your criteria.');
      return;
    }

    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `products-export-${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <BackdropBlur className="fixed inset-0 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <DocumentArrowDownIcon className="w-6 h-6" />
              Export Products
            </h2>
            <ModernButton variant="secondary" onClick={onClose}>
              Cancel
            </ModernButton>
          </div>

          {/* Export Format */}
          <div className="mb-6">
            <h3 className="text-white font-semibold mb-3">Export Format</h3>
            <div className="grid grid-cols-3 gap-3">
              {(['csv', 'json', 'xlsx'] as const).map((format) => (
                <label
                  key={format}
                  className={`flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-colors ${
                    exportOptions.format === format
                      ? 'bg-blue-500/20 border-blue-400 text-white'
                      : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <input
                    type="radio"
                    name="format"
                    value={format}
                    checked={exportOptions.format === format}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as any }))}
                    className="sr-only"
                  />
                  <span className="uppercase font-medium">{format}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Fields Selection */}
          <div className="mb-6">
            <h3 className="text-white font-semibold mb-3">Fields to Include</h3>
            <div className="grid grid-cols-2 gap-2">
              {availableFields.map((field) => (
                <label
                  key={field.key}
                  className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10"
                >
                  <input
                    type="checkbox"
                    checked={exportOptions.fields.includes(field.key)}
                    onChange={(e) => handleFieldChange(field.key, e.target.checked)}
                    className="rounded border-white/30 bg-white/10"
                  />
                  <span className="text-white text-sm">{field.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div className="mb-6">
            <h3 className="text-white font-semibold mb-3">Product Status</h3>
            <div className="grid grid-cols-3 gap-2">
              {statusOptions.map((status) => (
                <label
                  key={status.key}
                  className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10"
                >
                  <input
                    type="checkbox"
                    checked={exportOptions.status.includes(status.key)}
                    onChange={(e) => handleStatusChange(status.key, e.target.checked)}
                    className="rounded border-white/30 bg-white/10"
                  />
                  <span className="text-white text-sm">{status.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="mb-6">
            <h3 className="text-white font-semibold mb-3">Date Range</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white/70 text-sm mb-1">From</label>
                <input
                  type="date"
                  value={exportOptions.dateRange.from}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, from: e.target.value }
                  }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-1">To</label>
                <input
                  type="date"
                  value={exportOptions.dateRange.to}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, to: e.target.value }
                  }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>

          {/* Export Button */}
          <div className="flex gap-3">
            <ModernButton
              onClick={handleExport}
              disabled={isExporting || exportOptions.fields.length === 0}
              className="flex-1 flex items-center justify-center gap-2"
            >
              {isExporting ? (
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
              ) : (
                <DocumentArrowDownIcon className="w-4 h-4" />
              )}
              {isExporting ? 'Exporting...' : 'Export Products'}
            </ModernButton>
          </div>

          {/* Help Text */}
          <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-start gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-white/70 text-sm">
                <p className="font-medium text-white mb-1">Export Tips:</p>
                <ul className="space-y-1 text-xs">
                  <li>• CSV format is recommended for spreadsheet applications</li>
                  <li>• JSON format preserves data structure for technical use</li>
                  <li>• Large exports may take a few moments to process</li>
                  <li>• All times are in your local timezone</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </BackdropBlur>
  );
};
