"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const [selectedProduct, setSelectedProduct] = useState<string>("");
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
      if (res.data.length > 0) {
        setSelectedProduct(res.data[0].id);
      }
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProduct) {
      setError("Please select a product");
      return;
    }
    setSubmitting(true);
    setError("");

    const token = session!.access_token;
    const res = await apiPost<{ id: string }>("/instances", token, {
      productId: selectedProduct,
    });

    if (res.success && res.data) {
      router.push(`/dashboard/instances/${res.data.id}`);
    } else {
      setError(res.error || "Failed to create instance");
      setSubmitting(false);
    }
  }

  const mysqlProducts = products.filter((p) => p.engine === "mysql");
  const postgresProducts = products.filter((p) => p.engine === "postgresql");

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Create Database Instance</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
              1
            </span>
            MySQL
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {mysqlProducts.map((product) => (
              <label
                key={product.id}
                className={`relative flex flex-col p-6 bg-white rounded-xl border-2 cursor-pointer transition-all ${
                  selectedProduct === product.id
                    ? "border-primary-500 ring-2 ring-primary-100"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="product"
                  value={product.id}
                  checked={selectedProduct === product.id}
                  onChange={() => setSelectedProduct(product.id)}
                  className="sr-only"
                />
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold text-gray-800">
                    {product.name}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                    {product.tier}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4">{product.description}</p>
                <div className="mt-auto text-2xl font-bold text-gray-800">
                  {formatCurrency(product.ratePerHour)}
                  <span className="text-sm font-normal text-gray-500">/hour</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold">
              2
            </span>
            PostgreSQL
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {postgresProducts.map((product) => (
              <label
                key={product.id}
                className={`relative flex flex-col p-6 bg-white rounded-xl border-2 cursor-pointer transition-all ${
                  selectedProduct === product.id
                    ? "border-primary-500 ring-2 ring-primary-100"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="product"
                  value={product.id}
                  checked={selectedProduct === product.id}
                  onChange={() => setSelectedProduct(product.id)}
                  className="sr-only"
                />
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold text-gray-800">
                    {product.name}
                  </span>
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded">
                    {product.tier}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4">{product.description}</p>
                <div className="mt-auto text-2xl font-bold text-gray-800">
                  {formatCurrency(product.ratePerHour)}
                  <span className="text-sm font-normal text-gray-500">/hour</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 text-gray-600 font-medium hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !selectedProduct}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create Instance"}
          </button>
        </div>
      </form>
    </div>
  );
}
