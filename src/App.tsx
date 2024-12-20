import React, { useState, useEffect } from 'react';
import { LineChart } from 'lucide-react';
import { Product, ProductFormData, PricePoint } from './types';
import { AddProductForm } from './components/AddProductForm';
import { ProductTabs } from './components/ProductGroup/ProductTabs';
import { ImportExportButtons } from './components/ImportExport/ImportExportButtons';
import { groupProductsByName } from './utils/groupUtils';
import { updateProductPrice } from './utils/productUtils';
import { useNotification } from './contexts/NotificationContext';
import { storage } from './services/storage';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const { showNotification } = useNotification();

  // Load products from localStorage on initial render
  useEffect(() => {
    setProducts(storage.getProducts());
  }, []);

  // Save products to localStorage whenever they change
  useEffect(() => {
    storage.saveProducts(products);
  }, [products]);

  const handleAddProduct = (formData: ProductFormData) => {
    const timestamp = formData.date || new Date().toISOString();
    const newProduct: Product = {
      id: crypto.randomUUID(),
      name: formData.name.toUpperCase(),
      currentPrice: formData.price,
      location: formData.location,
      photoUrl: formData.photoUrl,
      photoData: formData.photoData,
      lastChecked: timestamp,
      priceHistory: [{ price: formData.price, date: timestamp }],
      packagingSize: formData.packagingSize,
      pricePerCTN: formData.pricePerCTN
    };
    setProducts(prevProducts => [...prevProducts, newProduct]);
    showNotification('success', `${newProduct.name} has been added successfully!`);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(prevProducts => prevProducts.filter(product => product.id !== id));
    showNotification('success', 'Product deleted successfully');
  };

  const handleUpdatePrice = (productId: string, newPrice: number, newDate: string) => {
    setProducts(prevProducts => prevProducts.map(product => 
      product.id === productId 
        ? updateProductPrice(product, newPrice, newDate)
        : product
    ));
    showNotification('success', 'Price updated successfully');
  };

  const handleDeletePrice = (productId: string, pricePoint: PricePoint) => {
    setProducts(prevProducts => prevProducts.map(product => {
      if (product.id !== productId) return product;

      const newHistory = product.priceHistory.filter(p => p.date !== pricePoint.date);
      if (newHistory.length === 0) return product;

      const latestPoint = newHistory[newHistory.length - 1];
      return {
        ...product,
        currentPrice: latestPoint.price,
        lastChecked: latestPoint.date,
        priceHistory: newHistory,
      };
    }));
    showNotification('success', 'Price point deleted successfully');
  };

  const handleImport = (importedProducts: Product[]) => {
    setProducts(prevProducts => [...prevProducts, ...importedProducts]);
    showNotification('success', 'Products imported successfully');
  };

  const productGroups = groupProductsByName(products);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center mb-8">
          <LineChart size={32} className="text-blue-600 mr-2" />
          <h1 className="text-3xl font-bold text-gray-900">Price Tracker</h1>
        </div>

        <ImportExportButtons products={products} onImport={handleImport} />
        <AddProductForm onAdd={handleAddProduct} existingProducts={products} />

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No products added yet. Add your first product above!</p>
          </div>
        ) : (
          <ProductTabs
            productGroups={productGroups}
            onDelete={handleDeleteProduct}
            onUpdatePrice={handleUpdatePrice}
            onDeletePrice={handleDeletePrice}
          />
        )}
      </div>
    </div>
  );
}