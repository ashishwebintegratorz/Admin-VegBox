import { useState } from "react";
import PageMeta from "../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../components/ui/table";
import ModalWrapper from "../layout/ModalWrapper";
import { useBanners, useCreateBanner, useUpdateBanner, useDeleteBanner, useCategories, useProducts } from "../hooks/useApiHooks";

type BannerRow = {
  _id: string;
  title?: string;
  imageUrl: string;
  linkType?: string;
  linkId?: string;
  isActive: boolean;
};

export default function BannerManagement() {
  const { data: banners, isLoading } = useBanners();
  const { data: categories } = useCategories();
  const { data: productsData } = useProducts({ limit: 100 });
  const products = productsData?.products || productsData?.data?.products || (Array.isArray(productsData) ? productsData : []);

  const createMutation = useCreateBanner();
  const updateMutation = useUpdateBanner();
  const deleteMutation = useDeleteBanner();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    image: File | null;
    linkType: string;
    linkIds: string[];
    isActive: boolean;
  }>({
    title: "",
    image: null,
    linkType: "",
    linkIds: [],
    isActive: true,
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ title: "", image: null, linkType: "", linkIds: [], isActive: true });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: BannerRow) => {
    setEditingId(b._id);
    setFormData({
      title: b.title || "",
      image: null,
      linkType: b.linkType || "",
      linkIds: b.linkId ? b.linkId.split(',') : [],
      isActive: b.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("linkType", formData.linkType);
      data.append("linkId", formData.linkIds.join(','));
      data.append("isActive", String(formData.isActive));
      if (formData.image) {
        data.append("image", formData.image);
      }

      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Save failed:", err);
      alert(err.response?.data?.message || err.message || "Failed to save banner.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this banner?")) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500/30 border-t-emerald-500" />
      </div>
    );
  }

  return (
    <>
      <PageMeta title="Banner Management | VegBox Admin" description="Manage promotional banners." />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Banners</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Manage home screen promotional banners.</p>
          </div>
          <button 
            onClick={handleOpenAdd}
            className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-500 active:scale-95"
          >
            Add New Banner
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                  <TableCell className="font-bold text-slate-700 dark:text-slate-300 py-4 px-5">Image</TableCell>
                  <TableCell className="font-bold text-slate-700 dark:text-slate-300 py-4 px-5">Title</TableCell>
                  <TableCell className="font-bold text-slate-700 dark:text-slate-300 py-4 px-5">Link</TableCell>
                  <TableCell className="font-bold text-slate-700 dark:text-slate-300 py-4 px-5">Status</TableCell>
                  <TableCell className="font-bold text-slate-700 dark:text-slate-300 py-4 px-5 text-right">Action</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners?.map((banner: BannerRow) => (
                  <TableRow key={banner._id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <TableCell className="px-5 py-4">
                      <div className="h-16 w-32 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                        <img src={banner.imageUrl} alt={banner.title || "Banner"} className="h-full w-full object-cover" />
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                      {banner.title || "No Title"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-xs text-blue-500 max-w-[200px]">
                      {banner.linkType ? (
                        <div className="flex flex-col">
                          <span className="font-semibold uppercase text-[10px] text-slate-500">{banner.linkType}</span>
                          <span className="truncate" title={banner.linkId}>{banner.linkId?.split(',').length} selected</span>
                        </div>
                      ) : (
                        "No Link"
                      )}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        banner.isActive 
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                          : "bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400"
                      }`}>
                        {banner.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEdit(banner)}
                          className="rounded-lg bg-slate-100 p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-500 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-blue-500/10"
                          title="Edit"
                        >
                          ✎
                        </button>
                        <button 
                          onClick={() => handleDelete(banner._id)}
                          className="rounded-lg bg-slate-100 p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-500 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-rose-500/10"
                          title="Delete"
                        >
                          🗑
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!banners || banners.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-slate-500">
                      No banners found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <ModalWrapper isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {editingId ? "Edit Banner" : "Add Banner"}
            </h3>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Image</label>
              
              {/* Image Preview */}
              {(formData.image || (editingId && banners?.find((b: BannerRow) => b._id === editingId)?.imageUrl)) && (
                <div className="mt-2 mb-3 h-32 w-full max-w-sm overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                  <img 
                    src={formData.image ? URL.createObjectURL(formData.image) : banners?.find((b: BannerRow) => b._id === editingId)?.imageUrl} 
                    alt="Preview" 
                    className="h-full w-full object-contain"
                  />
                </div>
              )}

              <div className="mt-1.5 flex items-center w-full">
                <input 
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setFormData(f => ({ ...f, image: e.target.files![0] }));
                    }
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm font-medium text-slate-700 outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:file:bg-blue-900/30 dark:file:text-blue-400" 
                />
              </div>
              {editingId && !formData.image && (
                <p className="mt-1.5 text-xs font-medium text-amber-600 dark:text-amber-500">Leave blank to keep the existing image.</p>
              )}
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Title (Optional)</label>
              <input 
                value={formData.title}
                onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
                className="mt-1.5 w-full rounded-xl border border-slate-300 p-3.5 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white" 
              />
            </div>
            
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className={formData.linkType ? "sm:col-span-2" : ""}>
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Link Type (Optional)</label>
                <select 
                  value={formData.linkType}
                  onChange={e => setFormData(f => ({ ...f, linkType: e.target.value, linkIds: [] }))}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 p-3.5 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white" 
                >
                  <option value="">None</option>
                  <option value="category">Category</option>
                  <option value="product">Product</option>
                </select>
              </div>

              {formData.linkType && (
                <div className="sm:col-span-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">
                    Select {formData.linkType === 'category' ? 'Categories' : 'Products'} (Multiple allowed)
                  </label>
                  <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-300 p-3 space-y-2 dark:border-slate-700 dark:bg-slate-800">
                    {formData.linkType === 'category' && categories?.map((c: any) => (
                      <label key={c._id} className="flex items-center gap-3 cursor-pointer p-1 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition">
                        <input 
                          type="checkbox" 
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          checked={formData.linkIds.includes(c._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(f => ({ ...f, linkIds: [...f.linkIds, c._id] }));
                            } else {
                              setFormData(f => ({ ...f, linkIds: f.linkIds.filter(id => id !== c._id) }));
                            }
                          }}
                        />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{c.name}</span>
                      </label>
                    ))}
                    {formData.linkType === 'product' && products?.map((p: any) => (
                      <label key={p._id} className="flex items-center gap-3 cursor-pointer p-1 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition">
                        <input 
                          type="checkbox" 
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          checked={formData.linkIds.includes(p._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(f => ({ ...f, linkIds: [...f.linkIds, p._id] }));
                            } else {
                              setFormData(f => ({ ...f, linkIds: f.linkIds.filter(id => id !== p._id) }));
                            }
                          }}
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{p.name}</span>
                          <span className="text-xs text-slate-500">₹{p.variants?.[0]?.price || p.price}</span>
                        </div>
                      </label>
                    ))}
                    
                    {(formData.linkType === 'category' && categories?.length === 0) || (formData.linkType === 'product' && products?.length === 0) ? (
                      <p className="text-xs text-slate-500 p-2 text-center">No items found.</p>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input 
                type="checkbox"
                checked={formData.isActive}
                onChange={e => setFormData(f => ({ ...f, isActive: e.target.checked }))}
                id="isActive"
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Active (Show on app)
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-lg px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-bold text-white shadow-md hover:bg-blue-500"
            >
              {editingId ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </ModalWrapper>
    </>
  );
}
