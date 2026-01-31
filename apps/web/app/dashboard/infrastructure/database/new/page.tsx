"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { apiGet, apiPost } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";

interface Product {
  id: string;
  name: string;
  engine: string;
  tier: string;
  ratePerHour: number;
  description: string;
}

export default function NewInstancePage() {
  const { session } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedEngine, setSelectedEngine] = useState<string>("");
  const [dbName, setDbName] = useState("");
  const [storageSize, setStorageSize] = useState(5); // Default 5GB
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session?.access_token) {
      loadProducts();
    }
  }, [session]);

  async function loadProducts() {
    const token = session!.access_token;
    const res = await apiGet<Product[]>("/products", token);
    if (res.success && res.data) {
      setProducts(res.data);
      // Pre-select first engine if available
      const engines = Array.from(new Set(res.data.map(p => p.engine)));
      if (engines.length > 0) {
        const sorted = sortEngines(engines);
        if (sorted.length > 0) setSelectedEngine(sorted[0]);
      }
    }
    setLoading(false);
  }
  
  function sortEngines(engs: string[]) {
      // Include mongodb
      return engs.filter(e => ['mysql', 'postgresql', 'mongodb'].includes(e)).sort();
  }

  async function handleSubmit() {
    if (!selectedEngine) {
      setError("Please select a database type");
      return;
    }
    
    // Find the product to use (e.g. Basic tier) for the selected engine
    // Preference: 'basic' tier, else first one found
    const productToUse = products.find(p => p.engine === selectedEngine && p.tier.toLowerCase() === 'basic') 
                      || products.find(p => p.engine === selectedEngine);

    if (!productToUse) {
       setError("Product unavailable");
       return;
    }

    setSubmitting(true);
    setError("");

    const token = session!.access_token;
    const res = await apiPost<{ id: string }>("/instances", token, {
      productId: productToUse.id,
      name: dbName, // Sending user friendly name
    });

    if (res.success && res.data) {
      router.push(`/dashboard/infrastructure/database/${res.data.id}`);
    } else {
      setError(res.error || "Failed to create instance");
      setSubmitting(false);
    }
  }

  // Get distinct engines
  const engines = Array.from(new Set(products
    .filter(p => ['mysql', 'postgresql', 'mongodb'].includes(p.engine))
    .map(p => p.engine)
  )).sort();

  const selectedProductData = products.find(p => p.engine === selectedEngine); // Just for summary cost estimation (rough)
  const estimatedMonthly = selectedProductData 
    ? selectedProductData.ratePerHour * 24 * 30 
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  function calculateStorageCost(gb: number) {
    const basePricePerGb = 5000;
    const profitMargin = 0.10; // 10%
    
    // Monthly Calculations
    const baseMonthly = gb * basePricePerGb;
    const sellingMonthly = baseMonthly * (1 + profitMargin);
    const profitMonthly = sellingMonthly - baseMonthly;
    
    // Hourly Calculations (1 month = 730 hours)
    const hourlyPrice = sellingMonthly / 730;

    return { 
      baseMonthly,
      profitMonthly,
      sellingMonthly,
      hourlyPrice,
      profitMargin
    };
  }

  const pricing = calculateStorageCost(storageSize);

  return (
    <div className="max-w-7xl mx-auto min-h-screen pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Create Database</h1>
           <p className="text-sm text-gray-500">Choose a database type and configure your managed database</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Configuration */}
        <div className="lg:col-span-2 space-y-6">
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Database Configuration */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Database Configuration</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Database Name
              </label>
              <input
                type="text"
                value={dbName}
                onChange={(e) => setDbName(e.target.value)}
                placeholder="unique-database-name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              />
              <p className="mt-2 text-xs text-gray-500">
                Choose a unique name for your database instance
              </p>
            </div>
          </div>

          {/* Select Database Type */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Select Database Type</h2>
            
            {engines.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
                <p className="text-gray-500 font-medium">No Database Types Available</p>
              </div>
            ) : (
             <div className="grid sm:grid-cols-2 gap-4">
               {engines.map((engine) => {
                 // Format functionality: Find lowest price
                 const engineProducts = products.filter(p => p.engine === engine);
                 const minPrice = Math.min(...engineProducts.map(p => Number(p.ratePerHour)));
                 
                 let displayName = engine;
                 let displayDescription = engine;
                 let iconPath = ''; // fallback
                 
                 if (engine === 'mysql') {
                     displayName = 'MySQL';
                     displayDescription = 'Managed MySQL Database';
                     iconPath = '/assets/MySQL.png';
                 } else if (engine === 'postgresql') {
                     displayName = 'PostgreSQL';
                     displayDescription = 'Advanced Relational Database';
                     iconPath = '/assets/PostgresSQL.png';
                 } else if (engine === 'mongodb') {
                     displayName = 'MongoDB';
                     displayDescription = 'NoSQL Document Database';
                     iconPath = '/assets/MongoDB.png';
                 }

                 return (
                  <label
                    key={engine}
                    className={`relative flex flex-col p-5 bg-white rounded-xl border-2 cursor-pointer transition-all ${
                      selectedEngine === engine
                        ? "border-primary-600 ring-1 ring-primary-600"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="engine"
                      value={engine}
                      checked={selectedEngine === engine}
                      onChange={() => setSelectedEngine(engine)}
                      className="sr-only"
                    />
                    
                    {/* Selection Indicator */}
                    {selectedEngine === engine && (
                        <div className="absolute top-4 right-4 text-primary-600">
                            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                        </div>
                    )}

                    <div className="flex items-start gap-4 mb-4">
                        <div className="flex-shrink-0">
                            <Image 
                                src={iconPath} 
                                alt={displayName} 
                                width={48} 
                                height={48}
                                className="object-contain"
                            />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 leading-tight">{displayName}</h3>
                            <p className="text-xs text-gray-500 capitalize mt-1">{engine}</p>
                        </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-6 line-clamp-2">{displayDescription}</p>
                    
                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-baseline gap-1">
                      <span className="text-sm text-gray-500">Starts at</span>
                      <span className="text-xl font-bold text-gray-900 ml-1">Rp {pricing.hourlyPrice.toLocaleString('id-ID', {maximumFractionDigits: 2})}</span>
                      <span className="text-sm text-gray-500">/hr</span>
                    </div>
                  </label>
                 );
               })}
             </div>
            )}
          </div>

          {/* Storage Size */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
             <h2 className="text-lg font-semibold text-gray-900 mb-6">Storage Size</h2>
             <div className="mb-8">
                <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                    <span>Storage: {storageSize} GB</span>
                    <span>20 GB</span>
                </div>
                <input 
                    type="range" 
                    min="1" 
                    max="20" 
                    value={storageSize} 
                    onChange={(e) => setStorageSize(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>Rp 5.000 / GB (Base)</span>
                    <span>Total: {formatCurrency(pricing.sellingMonthly)}/bulan</span>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Summary */}
        <div className="lg:col-span-1">
            <div className="sticky top-6 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Summary</h2>
                
                <div className="space-y-4 mb-6">
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Database Name</label>
                        <p className="text-gray-900 font-medium truncate">{dbName || "—"}</p>
                    </div>
                    
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Database Type</label>
                        <p className="text-gray-900 font-medium">
                          {selectedEngine === 'mysql' ? 'MySQL' : 
                           selectedEngine === 'postgresql' ? 'PostgreSQL' : 
                           selectedEngine === 'mongodb' ? 'MongoDB' : 'None selected'}
                        </p>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Storage Size</label>
                        <p className="text-gray-900 font-medium">{storageSize} GB</p>
                    </div>
                    
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</label>
                        <p className="text-gray-900 font-medium">Shared</p>
                    </div>
                </div>

                <div className="py-4 border-t border-b border-gray-100 mb-6">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-600">Price</span>
                        <span className="font-medium text-blue-600">
                          {formatCurrency(pricing.sellingMonthly)}/month
                        </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                        * Estimated monthly cost based on 730 hours usage.
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={submitting || !selectedEngine}
                    className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 shadow-md hover:shadow-lg transform active:scale-[0.98] transition-all"
                >
                    {submitting ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Creating Database...
                        </span>
                    ) : (
                        "Create Database"
                    )}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
