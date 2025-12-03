import { useEffect, useState } from "react";
import axios from "axios";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import Button from "../../ui/button/Button";
import { PencilIcon, TrashBinIcon } from "../../../icons";

import Badge from "../../ui/badge/Badge";

interface ProductVariant {
  unit?: string;
  price: number;
  mrp?: number;
  stock: number;
  images: string[];
}

interface Category {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  description?: string;
  variants: ProductVariant[];
  categories?: Category[];
}

interface VariantForm {
  unit: string;
  price: string;
  mrp: string;
  stock: string;
  previewUrls: string[];
  files: File[];
}

interface ProductFormState {
  name: string;
  description: string;
  categoryId: string;
  variants: VariantForm[];
}

const createEmptyVariant = (): VariantForm => ({
  unit: "",
  price: "",
  mrp: "",
  stock: "",
  previewUrls: [],
  files: [],
});

const AddProductTableOne = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState<ProductFormState>({
    name: "",
    description: "",
    categoryId: "",
    variants: [createEmptyVariant()],
  });

  const BaseUrl = import.meta.env.VITE_BASIC_API_URL;

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${BaseUrl}/products/all`, {
        params: { page, limit },
      });

      setProducts(res.data.products || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Failed to load products", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${BaseUrl}/categories`);
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      categoryId: "",
      variants: [createEmptyVariant()],
    });
    setEditingProduct(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (product: Product) => {
    const mappedVariants: VariantForm[] =
      product.variants?.length > 0
        ? product.variants.map((v) => ({
            unit: v.unit || "",
            price: v.price?.toString() || "",
            mrp: v.mrp != null ? v.mrp.toString() : "",
            stock: v.stock?.toString() || "",
            previewUrls: v.images || [],
            files: [],
          }))
        : [createEmptyVariant()];

    setFormData({
      name: product.name,
      description: product.description || "",
      categoryId: product.categories?.[0]?._id || "",
      variants: mappedVariants,
    });

    setEditingProduct(product);
    setShowModal(true);
  };

  const handleVariantChange = (index: number, field: keyof VariantForm, value: string) => {
    setFormData((prev) => {
      const variants = [...prev.variants];
      variants[index] = { ...variants[index], [field]: value };
      return { ...prev, variants };
    });
  };

  const handleVariantImagesChange = (index: number, filesList: FileList | null) => {
    if (!filesList) return;

    const filesArray = Array.from(filesList);
    const previews = filesArray.map((file) => URL.createObjectURL(file));

    setFormData((prev) => {
      const variants = [...prev.variants];
      variants[index] = {
        ...variants[index],
        files: filesArray,
        previewUrls: previews.length > 0 ? previews : variants[index].previewUrls,
      };
      return { ...prev, variants };
    });
  };

  const handleAddVariantBlock = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, createEmptyVariant()],
    }));
  };

  const handleRemoveVariantBlock = (index: number) => {
    setFormData((prev) => {
      if (prev.variants.length === 1) return prev;
      const variants = prev.variants.filter((_, i) => i !== index);
      return { ...prev, variants };
    });
  };

  // ---------------------------------------------------------------------
  // ✔ FIXED handleSubmit() to match your backend Option B format
  // ---------------------------------------------------------------------
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const body = new FormData();

    body.append("name", formData.name);
    body.append("description", formData.description);
    if (formData.categoryId) body.append("category", formData.categoryId);

    // Send variants as JSON — the backend requires this
    const variantsJson = formData.variants.map((variant) => ({
      unit: variant.unit,
      price: variant.price,
      mrp: variant.mrp,
      stock: variant.stock,
      images: variant.previewUrls.filter((u) => u.startsWith("http")),
    }));

    body.append("variants", JSON.stringify(variantsJson));

    // Send files matching backend pattern: variantImages_0, variantImages_1
    formData.variants.forEach((variant, index) => {
      variant.files.forEach((file) => {
        body.append(`variantImages_${index}`, file);
      });
    });

    try {
      if (editingProduct) {
        await axios.put(`${BaseUrl}/products/${editingProduct._id}`, body, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post(`${BaseUrl}/products/add`, body, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setShowModal(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error("Failed to save product", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${BaseUrl}/products/${id}`);
      fetchProducts();
    } catch (err) {
      console.error("Failed to delete product", err);
    }
  };

  const getTotalStock = (variants: ProductVariant[]) =>
    variants.reduce((sum, v) => sum + (v.stock || 0), 0);

  const getPriceLabel = (variants: ProductVariant[]) => {
    if (!variants || variants.length === 0) return "₹0";

    const prices = variants.map((v) => v.price || 0).filter((p) => p > 0);
    if (prices.length === 0) return "₹0";

    const min = Math.min(...prices);
    const max = Math.max(...prices);

    if (min === max) return `₹${min}`;
    return `₹${min} - ₹${max}`;
  };

  const getImagesForTable = (variants: ProductVariant[]) => {
    const imgs: string[] = [];
    variants.forEach((v) => {
      if (v.images && v.images.length) imgs.push(...v.images);
    });
    return imgs.slice(0, 4);
  };

  return (
    <>
      {/* blur wrapper unchanged */}
      <div className={`${showModal ? "blur-sm pointer-events-none" : ""}`}>
        <div className="flex justify-end mb-3">
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
          >
            + Add Product
          </button>
        </div>

        {/* TABLE UI untouched */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 text-gray-500 text-theme-xs dark:text-gray-400">
                    Product
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-gray-500 text-theme-xs dark:text-gray-400">
                    Images
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-gray-500 text-theme-xs dark:text-gray-400">
                    Stock
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-gray-500 text-theme-xs dark:text-gray-400">
                    Price
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-gray-500 text-theme-xs dark:text-gray-400">
                    Status
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-gray-500 text-theme-xs dark:text-gray-400 text-center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {products.map((p) => {
                  const totalStock = getTotalStock(p.variants || []);
                  const priceLabel = getPriceLabel(p.variants || []);
                  const images = getImagesForTable(p.variants || []);

                  return (
                    <TableRow key={p._id}>
                      <TableCell className="px-5 py-4 text-gray-500 text-theme-xs dark:text-gray-400 text-center">
                        {p.name}
                      </TableCell>

                      <TableCell className="px-4 py-3 text-gray-500 text-theme-xs dark:text-gray-400">
                        <div className="flex justify-center">
                          <div className="flex -space-x-2">
                            {images.map((img, i) => (
                              <div
                                key={i}
                                className="w-8 h-8 rounded-full overflow-hidden border-2 border-white dark:border-gray-900 flex items-center justify-center bg-gray-100"
                              >
                                <img src={img} className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="px-4 py-3 text-center text-gray-500 text-theme-xs dark:text-gray-400">
                        {totalStock}
                      </TableCell>

                      <TableCell className="px-4 py-3 text-center text-gray-500 text-theme-xs dark:text-gray-400">
                        {priceLabel}
                      </TableCell>

                      <TableCell className="px-4 py-3 text-center">
                        <Badge size="sm" color={totalStock > 0 ? "success" : "error"}>
                          {totalStock > 0 ? "Available" : "Out of Stock"}
                        </Badge>
                      </TableCell>

                      <TableCell className="px-4 py-3 text-center flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-2 rounded-md bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-600 dark:text-yellow-400"
                          title="Edit Product"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(p._id)}
                          className="p-2 rounded-md bg-red-500/20 hover:bg-red-500/30 text-red-600 dark:text-red-400"
                          title="Delete Product"
                        >
                          <TrashBinIcon className="w-4 h-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* pagination unchanged */}
        <div className="flex justify-end items-center gap-2 mt-4">
          <button
            disabled={page <= 1}
            onClick={() => setPage((prev) => prev - 1)}
            className="px-3 py-1 border rounded disabled:opacity-30 text-gray-700 dark:text-gray-400"
          >
            Prev
          </button>

          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            className="px-3 py-1 border rounded disabled:opacity-30 text-gray-700 dark:text-gray-400"
          >
            Next
          </button>
        </div>
      </div>

      {/* MODAL UI unchanged */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-100000 table-scrollbar">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-[520px] max-h-[90vh] overflow-y-auto shadow-xl">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
              {editingProduct ? "Edit Product" : "Add Product"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-gray-600 text-theme-xs dark:text-gray-400">
                  Product Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  className="w-full mt-1 px-3 py-2 border rounded text-gray-700 dark:text-gray-400"
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>

              <div>
                <label className="text-gray-600 text-theme-xs dark:text-gray-400">
                  Category
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, categoryId: e.target.value }))
                  }
                  className="w-full mt-1 px-3 py-2 border rounded text-gray-700 dark:text-gray-400 bg-white dark:bg-gray-800"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-gray-600 text-theme-xs dark:text-gray-400">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  className="w-full mt-1 px-3 py-2 border rounded text-gray-700 dark:text-gray-400"
                  rows={3}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                    Variants
                  </span>
                  <Button
                    type="button"
                    onClick={handleAddVariantBlock}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                  >
                    + Add Variant
                  </Button>
                </div>

                {formData.variants.map((variant, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                        Variant {index + 1}
                      </span>
                      {formData.variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveVariantBlock(index)}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-gray-600 text-theme-xs dark:text-gray-400">
                          Unit (e.g., 1kg, piece)
                        </label>
                        <input
                          type="text"
                          value={variant.unit}
                          className="w-full mt-1 px-3 py-2 border rounded text-gray-700 dark:text-gray-400"
                          onChange={(e) =>
                            handleVariantChange(index, "unit", e.target.value)
                          }
                        />
                      </div>

                      <div>
                        <label className="text-gray-600 text-theme-xs dark:text-gray-400">
                          Price
                        </label>
                        <input
                          type="number"
                          value={variant.price}
                          className="w-full mt-1 px-3 py-2 border rounded text-gray-700 dark:text-gray-400"
                          onChange={(e) =>
                            handleVariantChange(index, "price", e.target.value)
                          }
                          required
                        />
                      </div>

                      <div>
                        <label className="text-gray-600 text-theme-xs dark:text-gray-400">
                          MRP
                        </label>
                        <input
                          type="number"
                          value={variant.mrp}
                          className="w-full mt-1 px-3 py-2 border rounded text-gray-700 dark:text-gray-400"
                          onChange={(e) =>
                            handleVariantChange(index, "mrp", e.target.value)
                          }
                        />
                      </div>

                      <div>
                        <label className="text-gray-600 text-theme-xs dark:text-gray-400">
                          Stock
                        </label>
                        <input
                          type="number"
                          value={variant.stock}
                          className="w-full mt-1 px-3 py-2 border rounded text-gray-700 dark:text-gray-400"
                          onChange={(e) =>
                            handleVariantChange(index, "stock", e.target.value)
                          }
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-gray-600 text-theme-xs dark:text-gray-400">
                        Images (Variant {index + 1})
                      </label>

                      <label
                        htmlFor={`uploadImages-${index}`}
                        className="mt-2 flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-400 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-400 text-sm"
                      >
                        📤 Upload Images
                      </label>

                      {/* ✔ FIX: add name="variantImages_x" to match backend */}
                      <input
                        id={`uploadImages-${index}`}
                        name={`variantImages_${index}`}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) =>
                          handleVariantImagesChange(index, e.target.files)
                        }
                      />

                      {variant.previewUrls.length > 0 && (
                        <div className="grid grid-cols-4 gap-3 mt-3">
                          {variant.previewUrls.map((img, i) => (
                            <div key={i} className="w-20 h-20 rounded border overflow-hidden">
                              <img src={img} className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded"
                >
                  Cancel
                </Button>

                <Button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  {editingProduct ? "Update" : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AddProductTableOne;
