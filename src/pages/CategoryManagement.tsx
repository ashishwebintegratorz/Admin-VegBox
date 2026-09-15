import { useState } from "react";
import PageMeta from "../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../components/ui/table";
import ModalWrapper from "../layout/ModalWrapper";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "../hooks/useApiHooks";

type CategoryRow = {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  parent?: string;
  ordering: number;
};

export default function CategoryManagement() {
  const { data: categories, isLoading } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    image: File | null;
    parent: string;
    ordering: number;
  }>({
    name: "",
    image: null,
    parent: "",
    ordering: 0,
  });


  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ name: "", image: null, parent: "", ordering: 0 });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: CategoryRow) => {
    setEditingId(c._id);
    setFormData({
      name: c.name,
      image: null,
      parent: c.parent || "",
      ordering: c.ordering || 0,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("ordering", String(formData.ordering));
      if (formData.parent) {
        data.append("parent", formData.parent);
      }
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
      alert(err.response?.data?.message || err.message || "Failed to save category.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
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
      <PageMeta title="Category Management | VegBox Admin" description="Manage product categories." />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Categories</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Manage categories and their display images.</p>
          </div>
          <button 
            onClick={handleOpenAdd}
            className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-500 active:scale-95"
          >
            Add New Category
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                  <TableCell className="font-bold text-slate-700 dark:text-slate-300 py-4 px-5">Image</TableCell>
                  <TableCell className="font-bold text-slate-700 dark:text-slate-300 py-4 px-5">Name</TableCell>
                  <TableCell className="font-bold text-slate-700 dark:text-slate-300 py-4 px-5">Order</TableCell>
                  <TableCell className="font-bold text-slate-700 dark:text-slate-300 py-4 px-5 text-right">Action</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories?.map((cat: CategoryRow) => (
                  <TableRow key={cat._id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <TableCell className="px-5 py-4">
                      <div className="h-12 w-12 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        {cat.image ? (
                          <img src={cat.image} alt={cat.name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-xl">📁</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                      {cat.name}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-slate-600">
                      {cat.ordering || 0}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEdit(cat)}
                          className="rounded-lg bg-slate-100 p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-500 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-blue-500/10"
                          title="Edit"
                        >
                          ✎
                        </button>
                        <button 
                          onClick={() => handleDelete(cat._id)}
                          className="rounded-lg bg-slate-100 p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-500 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-rose-500/10"
                          title="Delete"
                        >
                          🗑
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!categories || categories.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-12 text-center text-slate-500">
                      No categories found.
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
              {editingId ? "Edit Category" : "Add Category"}
            </h3>
          </div>
          
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Name</label>
                <input 
                  required
                  value={formData.name}
                  onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 p-3.5 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white" 
                  placeholder="e.g. Apples"
                />
              </div>


              <div className="sm:col-span-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Image</label>
                
                {/* Image Preview */}
                {(formData.image || (editingId && categories?.find((c: CategoryRow) => c._id === editingId)?.image)) && (
                  <div className="mt-2 mb-3 h-32 w-full max-w-sm overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                    <img 
                      src={formData.image ? URL.createObjectURL(formData.image) : categories?.find((c: CategoryRow) => c._id === editingId)?.image} 
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

              <div className="sm:col-span-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Ordering</label>
                <input 
                  type="number"
                  value={formData.ordering}
                  onChange={e => setFormData(f => ({ ...f, ordering: Number(e.target.value) }))}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 p-3.5 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white" 
                />
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
