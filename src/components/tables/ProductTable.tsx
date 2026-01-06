import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Pagination } from "../ui/pagination/Pagination";
import ModalWrapper from "../../layout/ModalWrapper.tsx";
import { 
  useProducts, 
  useDeleteProduct, 
  useCategories, 
  useCreateProduct, 
  useUpdateProduct 
} from "../../hooks/useApiHooks";

type ProductRow = {
  _id: string;
  name: string;
  description?: string;
  categories?: { _id: string; name: string }[];
  variants: {
    sku?: string;
    unit?: string;
    price: number;
    mrp?: number;
    stock: number;
    images?: string[];
  }[];
  isActive: boolean;
};

export default function ProductTable() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  // API Hooks
  const { data: response, isLoading } = useProducts({
    page: currentPage,
    limit: productsPerPage,
    search: search
  });
  const { data: categories } = useCategories();
  const deleteMutation = useDeleteProduct();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    variants: [
      { unit: "1kg", price: 0, mrp: 0, stock: 0, sku: "", images: [] as string[] }
    ]
  });
  const [variantFiles, setVariantFiles] = useState<Record<number, File[]>>({});

  const displayProducts: ProductRow[] = response?.products || [];
  const totalPages = response?.totalPages || 1;
  const current = displayProducts;

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: "",
      description: "",
      category: "",
      variants: [{ unit: "1kg", price: 0, mrp: 0, stock: 0, sku: "", images: [] }]
    });
    setVariantFiles({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: ProductRow) => {
    setEditingId(p._id);
    setFormData({
      name: p.name,
      description: p.description || "",
      category: p.categories?.[0]?._id || "",
      variants: p.variants.map(v => ({
        unit: v.unit || "",
        price: v.price,
        mrp: v.mrp || 0,
        stock: v.stock,
        sku: v.sku || "",
        images: v.images || []
      }))
    });
    setVariantFiles({});
    setIsModalOpen(true);
  };

  const handleAddVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { unit: "", price: 0, mrp: 0, stock: 0, sku: "", images: [] }]
    }));
  };

  const handleRemoveVariant = (index: number) => {
    if (formData.variants.length === 1) return;
    const newVariants = [...formData.variants];
    newVariants.splice(index, 1);
    setFormData(prev => ({ ...prev, variants: newVariants }));
    
    // Also cleanup files for shifted indices
    const newFiles: Record<number, File[]> = {};
    Object.keys(variantFiles).forEach(key => {
      const k = parseInt(key);
      if (k < index) newFiles[k] = variantFiles[k];
      if (k > index) newFiles[k - 1] = variantFiles[k];
    });
    setVariantFiles(newFiles);
  };

  const handleFileChange = (index: number, files: FileList | null) => {
    if (!files) return;
    setVariantFiles(prev => ({
      ...prev,
      [index]: [...(prev[index] || []), ...Array.from(files)]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("description", formData.description);
    submitData.append("category", formData.category);
    
    // Backend expects variants as JSON string
    // But we need to keep existing image URLs for editing
    submitData.append("variants", JSON.stringify(formData.variants));

    // Append files with field name variantImages_i
    Object.keys(variantFiles).forEach(index => {
      variantFiles[parseInt(index)].forEach(file => {
        submitData.append(`variantImages_${index}`, file);
      });
    });

    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, formData: submitData });
      } else {
        await createMutation.mutateAsync(submitData);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save product. Check console.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-white/10 bg-white/40 backdrop-blur-xl dark:bg-slate-900/40">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500/30 border-t-blue-500" />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/80 via-white/60 to-white/30 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.35)] backdrop-blur-2xl dark:from-slate-950/80 dark:via-slate-950/70 dark:to-slate-900/60 dark:border-white/5">
      <div className="relative">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Inventory Control
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage your vegetable stock and pricing across all categories.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-slate-400 dark:text-slate-500">
                ⌕
              </span>
              <input
                type="text"
                placeholder="Product name..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-xl border border-white/30 bg-white/40 px-3 py-2 pl-8 text-sm text-slate-900 shadow-sm outline-none backdrop-blur-xl placeholder:text-slate-400 transition focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/10 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-100"
              />
            </div>
            <button 
              onClick={handleOpenAdd}
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-500 active:scale-95"
            >
              Add New
            </button>
          </div>
        </div>

        <div className="max-w-full overflow-x-auto rounded-xl border border-white/20 bg-white/30 shadow-inner backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/40">
          <Table>
            <TableHeader className="border-b border-white/20 bg-gradient-to-r from-slate-100/60 via-white/40 to-slate-100/60 text-[10px] uppercase font-bold tracking-[0.2em] text-slate-500 dark:border-white/10 dark:from-slate-900/80 dark:text-slate-400">
              <TableRow>
                <TableCell isHeader className="px-5 py-4 text-start">
                  Product Details
                </TableCell>
                <TableCell isHeader className="px-5 py-4 text-start">
                  Base Price
                </TableCell>
                <TableCell isHeader className="px-5 py-4 text-start">
                  Total Stock
                </TableCell>
                <TableCell isHeader className="px-5 py-4 text-start">
                  Status
                </TableCell>
                <TableCell isHeader className="px-5 py-4 text-center">
                  Management
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-white/10 dark:divide-white/10">
              {current.length > 0 ? (
                current.map((product) => {
                  const totalStock = product.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) || 0;
                  const firstPrice = product.variants?.[0]?.price || 0;
                  const img = product.variants?.[0]?.images?.[0];

                  return (
                    <TableRow key={product._id} className="group hover:bg-white/60 dark:hover:bg-slate-900/80 transition-all duration-200">
                      <TableCell className="px-5 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 overflow-hidden rounded-xl border border-white/20 bg-slate-200 shadow-sm dark:border-white/5 dark:bg-slate-800">
                             {img ? (
                               <img src={img} alt={product.name} className="h-full w-full object-cover" />
                             ) : (
                               <div className="flex h-full w-full items-center justify-center text-xl">🥦</div>
                             )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900 dark:text-slate-50">
                              {product.name}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                              {product.categories?.[0]?.name || "Uncategorized"}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="px-5 py-4 text-sm font-black text-slate-900 dark:text-slate-100">
                        ₹{firstPrice.toLocaleString()}
                      </TableCell>

                      <TableCell className="px-5 py-4">
                         <div className="flex flex-col gap-1">
                           <span className={`text-sm font-bold ${totalStock < 10 ? "text-rose-500" : "text-emerald-500"}`}>
                             {totalStock} units
                           </span>
                           {totalStock < 10 && (
                             <span className="text-[9px] font-black uppercase tracking-tighter text-rose-400">Low Stock</span>
                           )}
                         </div>
                      </TableCell>

                      <TableCell className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${product.isActive ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                          <span className={`h-1 w-1 rounded-full ${product.isActive ? "bg-emerald-500" : "bg-rose-500"}`} />
                          {product.isActive ? "ACTIVE" : "DISABLED"}
                        </span>
                      </TableCell>

                      <TableCell className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleOpenEdit(product)}
                            className="rounded-lg bg-slate-100 p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-500 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-blue-500/10"
                            title="Edit Product"
                          >
                            ✎
                          </button>
                          <button 
                            onClick={() => handleDelete(product._id)}
                            className="rounded-lg bg-slate-100 p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-500 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-rose-500/10"
                            title="Delete"
                          >
                            🗑
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow className="border-0">
                  <td colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                       <span className="text-4xl opacity-10 font-bold">INVENTORY EMPTY</span>
                       <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        {search ? "No products found for your search." : "Start by adding your first vegetable."}
                      </p>
                    </div>
                  </td>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {(response?.total || 0) > productsPerPage && (
          <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/30 px-5 py-3 text-xs text-slate-600 shadow-sm backdrop-blur-xl sm:flex-row dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-300">
             <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
               Page {currentPage} of {totalPages}
             </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {/* Add/Edit Product Modal */}
        <ModalWrapper 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          className="max-w-4xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto max-h-[80vh] px-2 custom-scrollbar">
            <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md pb-4 border-b border-white/10">
              <h3 className="text-2xl font-black text-slate-900 dark:text-slate-50">
                {editingId ? "Refine Product" : "Launch New Product"}
              </h3>
              <p className="text-sm text-slate-500">
                Configure your vegetable offerings and variants.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Product Name</label>
                <input 
                  required
                  value={formData.name}
                  onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-xl border-white/20 bg-slate-100/50 p-3 text-sm font-semibold outline-none focus:ring-4 focus:ring-blue-500/10 dark:bg-slate-800/50" 
                  placeholder="e.g. Organic Tomatoes"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Category</label>
                <select 
                  required
                  value={formData.category}
                  onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}
                  className="w-full rounded-xl border-white/20 bg-slate-100/50 p-3 text-sm font-semibold outline-none focus:ring-4 focus:ring-blue-500/10 dark:bg-slate-800/50"
                >
                  <option value="">Select Category...</option>
                  {Array.isArray(categories) && categories.map((c: any) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                  className="w-full rounded-xl border-white/20 bg-slate-100/50 p-3 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 dark:bg-slate-800/50"
                  rows={3}
                  placeholder="Tell the story of this vegetable..."
                />
              </div>
            </div>

            {/* Variants Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-blue-500">Product Variants</h4>
                <button 
                  type="button"
                  onClick={handleAddVariant}
                  className="text-[10px] font-black uppercase text-blue-500 hover:underline"
                >
                  + Add Variant
                </button>
              </div>

              <div className="space-y-6">
                {formData.variants.map((v, i) => (
                  <div key={i} className="relative rounded-2xl border border-white/10 bg-white/20 p-5 dark:bg-white/5">
                    {formData.variants.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => handleRemoveVariant(i)}
                        className="absolute right-4 top-4 text-rose-500 hover:scale-110 transition"
                      >
                        ✕
                      </button>
                    )}
                    
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400">Unit</label>
                        <input 
                          value={v.unit}
                          onChange={e => {
                            const nv = [...formData.variants];
                            nv[i].unit = e.target.value;
                            setFormData(f => ({ ...f, variants: nv }));
                          }}
                          className="w-full bg-transparent border-b border-slate-300 dark:border-slate-700 py-1 text-sm outline-none focus:border-blue-500" 
                          placeholder="1kg / 500g"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400">Price (₹)</label>
                        <input 
                          type="number"
                          value={v.price}
                          onChange={e => {
                            const nv = [...formData.variants];
                            nv[i].price = Number(e.target.value);
                            setFormData(f => ({ ...f, variants: nv }));
                          }}
                          className="w-full bg-transparent border-b border-slate-300 dark:border-slate-700 py-1 text-sm outline-none focus:border-blue-500" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400">MRP (₹)</label>
                        <input 
                          type="number"
                          value={v.mrp}
                          onChange={e => {
                            const nv = [...formData.variants];
                            nv[i].mrp = Number(e.target.value);
                            setFormData(f => ({ ...f, variants: nv }));
                          }}
                          className="w-full bg-transparent border-b border-slate-300 dark:border-slate-700 py-1 text-sm outline-none focus:border-blue-500" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400">Stock</label>
                        <input 
                          type="number"
                          value={v.stock}
                          onChange={e => {
                            const nv = [...formData.variants];
                            nv[i].stock = Number(e.target.value);
                            setFormData(f => ({ ...f, variants: nv }));
                          }}
                          className="w-full bg-transparent border-b border-slate-300 dark:border-slate-700 py-1 text-sm outline-none focus:border-blue-500" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400">SKU</label>
                        <input 
                          value={v.sku}
                          onChange={e => {
                            const nv = [...formData.variants];
                            nv[i].sku = e.target.value;
                            setFormData(f => ({ ...f, variants: nv }));
                          }}
                          className="w-full bg-transparent border-b border-slate-300 dark:border-slate-700 py-1 text-sm outline-none focus:border-blue-500" 
                        placeholder="TOM-001"
                        />
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                       <label className="text-[10px] font-bold text-slate-400">Variant Media</label>
                       <div className="flex flex-wrap gap-2">
                         {v.images?.map((img, idx) => (
                           <div key={idx} className="h-14 w-14 rounded-lg border border-white/10 bg-slate-100 dark:bg-slate-800 overflow-hidden relative group">
                             <img src={img} className="h-full w-full object-cover" />
                             <button 
                                type="button"
                                onClick={() => {
                                  const nv = [...formData.variants];
                                  nv[i].images = nv[i].images?.filter((_, x) => x !== idx);
                                  setFormData(f => ({ ...f, variants: nv }));
                                }}
                                className="absolute inset-0 bg-rose-500/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs transition"
                             >
                               ✕
                             </button>
                           </div>
                         ))}
                         <label className="h-14 w-14 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center cursor-pointer hover:border-blue-500 transition text-slate-400 hover:text-blue-500">
                           <span className="text-lg">+</span>
                           <input 
                              type="file" 
                              multiple 
                              className="hidden" 
                              onChange={e => handleFileChange(i, e.target.files)} 
                           />
                         </label>
                         {variantFiles[i]?.map((file, idx) => (
                           <div key={idx} className="h-14 w-14 rounded-lg border border-blue-500/20 bg-blue-50 dark:bg-blue-900/20 flex flex-col items-center justify-center text-[8px] text-blue-500 font-bold overflow-hidden">
                              <span className="truncate w-full text-center px-1">{file.name}</span>
                              <button 
                                type="button"
                                onClick={() => {
                                  setVariantFiles(prev => {
                                    const nf = [...prev[i]];
                                    nf.splice(idx, 1);
                                    return { ...prev, [i]: nf };
                                  });
                                }}
                                className="text-rose-500 mt-0.5"
                              >remove</button>
                           </div>
                         ))}
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl px-8 py-3 text-sm font-bold text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="rounded-xl bg-blue-600 px-10 py-3 text-sm font-black text-white shadow-xl shadow-blue-500/30 transition hover:bg-blue-500 active:scale-95 disabled:opacity-50"
              >
                {(createMutation.isPending || updateMutation.isPending) ? "Uploading Media..." : (editingId ? "Update Product" : "Release Product")}
              </button>
            </div>
          </form>
        </ModalWrapper>
      </div>
    </div>
  );
}
