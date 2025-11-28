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

import Badge from "../../ui/badge/Badge";

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  images: string[];
}

const AddProductTableOne = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
  });

  const [images, setImages] = useState<FileList | null>(null);
  const [preview, setPreview] = useState<string[]>([]);

  const BaseUrl = import.meta.env.VITE_BASIC_API_URL;

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${BaseUrl}/products/all`);
      setProducts(res.data.products);
    } catch (err) {
      console.error("Failed to load products", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const body = new FormData();
    body.append("name", formData.name);
    body.append("price", formData.price);
    body.append("stock", formData.stock);

    if (images) {
      for (let i = 0; i < images.length; i++) {
        body.append("images", images[i]);
      }
    }

    await axios.post(`${BaseUrl}/products/add`, body, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setShowModal(false);
    setPreview([]);
    fetchProducts();
  };

  return (
    <>
      {/* Blur Behind Modal */}
      <div className={`${showModal ? "blur-sm pointer-events-none" : ""}`}>
        <div className="flex justify-end mb-3">
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
          >
            + Add Product
          </button>
        </div>

        {/* Product Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-gray-500 text-theme-xs dark:text-gray-400"
                  >
                    Product
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-gray-500 text-theme-xs dark:text-gray-400"
                  >
                    Images
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-gray-500 text-theme-xs dark:text-gray-400"
                  >
                    Stock
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-gray-500 text-theme-xs dark:text-gray-400"
                  >
                    Price
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-gray-500 text-theme-xs dark:text-gray-400"
                  >
                    Status
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {products.map((p) => (
                  <TableRow key={p._id}>
                    <TableCell className="px-5 py-4 text-gray-500 text-theme-xs dark:text-gray-400 text-center">
                      {p.name}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-theme-xs dark:text-gray-400">
                      <div className="flex justify-center">
                        <div className="flex -space-x-2">
                          {p.images.map((img, i) => (
                            <div
                              key={i}
                              className="w-8 h-8 rounded-full overflow-hidden border-2 border-white dark:border-gray-900 
                     flex items-center justify-center bg-gray-100"
                            >
                              <img
                                src={img}
                                alt="product"
                                className="max-w-full max-h-full object-contain object-center"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-theme-xs dark:text-gray-400 text-center">
                      {p.stock}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-xs dark:text-gray-400 text-center">
                      ₹{p.price}
                    </TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-theme-xs dark:text-gray-400 text-center">
                      <Badge
                        size="sm"
                        color={p.stock > 0 ? "success" : "error"}
                      >
                        {p.stock > 0 ? "Available" : "Out of Stock"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* --- MODAL POPUP --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-[430px] shadow-xl">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Add Product
            </h2>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* NAME */}
              <div>
                <label className=" text-gray-500 text-theme-xs dark:text-gray-400">
                  Product Name
                </label>
                <input
                  type="text"
                  className="w-full mt-1 px-3 py-2 border rounded  text-gray-500 text-theme-xs dark:text-gray-400"
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              {/* PRICE */}
              <div>
                <label className=" text-gray-500 text-theme-xs dark:text-gray-400">
                  Price
                </label>
                <input
                  type="number"
                  className="w-full mt-1 px-3 py-2 border rounded  text-gray-500 text-theme-xs dark:text-gray-400"
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                />
              </div>

              {/* STOCK */}
              <div>
                <label className=" text-gray-500 text-theme-xs dark:text-gray-400">
                  Stock
                </label>
                <input
                  type="number"
                  className="w-full mt-1 px-3 py-2 border rounded  text-gray-500 text-theme-xs dark:text-gray-400"
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                />
              </div>

              {/* UPLOAD INPUT WITH ICON */}
              <div>
                <label className="text-sm text-gray-700 dark:text-gray-300">
                  Upload Images
                </label>

                <label
                  htmlFor="uploadImages"
                  className="mt-2 flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-400 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  {/* Upload Icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 12v9m0-9l-3-3m3 3l3-3"
                    />
                  </svg>
                  <span className="text-gray-600 dark:text-gray-300">
                    Click to upload
                  </span>
                </label>

                <input
                  id="uploadImages"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    setImages(e.target.files);

                    const files = e.target.files;
                    const previews: string[] = [];

                    if (files) {
                      for (let i = 0; i < files.length; i++) {
                        previews.push(URL.createObjectURL(files[i]));
                      }
                    }
                    setPreview(previews);
                  }}
                />
              </div>

              {/* PREVIEW IMAGES */}
              {preview.length > 0 && (
                <div className="grid grid-cols-4 gap-3 mt-3">
                  {preview.map((img, i) => (
                    <div
                      key={i}
                      className="w-20 h-20 rounded border overflow-hidden"
                    >
                      <img src={img} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              {/* BUTTONS */}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setPreview([]);
                  }}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded"
                >
                  Cancel
                </Button>

                <Button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Save
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
