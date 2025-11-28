import { useEffect, useRef, useState } from "react";
import axios from "axios";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";

import Badge from "../../ui/badge/Badge";

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  images: string[];
  createdAt: string;
}

export default function BasicTableOne() {
  const BaseUrl = import.meta.env.VITE_BASIC_API_URL;
  
  const [products, setProducts] = useState<Product[]>([]);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  // Search
  const [search, setSearch] = useState("");

  // Filters
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minStock, setMinStock] = useState("");
  const [status, setStatus] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch products
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${BaseUrl}/products/all`, {
        params: {
          page,
          limit,
          search,
          minPrice,
          maxPrice,
          minStock,
          status,
        },
      });

      setProducts(res.data.products);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Failed to load products", err);
    }
  };

  // Search on CTRL + K
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch whenever filters change
  useEffect(() => {
    fetchProducts();
  }, [page, search, minPrice, maxPrice, minStock, status]);

  return (
    <div className="space-y-6">

      {/* ---------------------- SEARCH BAR ---------------------- */}
      <div className="flex justify-between items-center">
        <div className="relative w-full max-w-sm">
          <span className="absolute -translate-y-1/2 pointer-events-none left-4 top-1/2">
            <svg
              className="fill-gray-500 dark:fill-gray-400"
              width="20"
              height="20"
              viewBox="0 0 20 20"
            >
              <path d="M9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z" />
            </svg>
          </span>

          <input
            ref={inputRef}
            type="text"
            placeholder="Search product..."
            className="h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-4 
                       text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 
                       dark:border-gray-800 dark:bg-gray-900 dark:text-white/90"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* ---------------------- FILTER BAR ---------------------- */}
      <div className="flex flex-wrap gap-4 bg-white p-4 rounded-lg border dark:bg-gray-900 dark:border-gray-800">

        <input
          type="number"
          placeholder="Min Price"
          className="px-3 py-2 border rounded text-gray-500 text-theme-xs dark:text-gray-400 appearance:textfield"
          value={minPrice}
          onChange={(e) => {
            setMinPrice(e.target.value);
            setPage(1);
          }}
        />

        <input
          type="number"
          placeholder="Max Price"
          className="px-3 py-2 border rounded text-gray-500 text-theme-xs dark:text-gray-400 appearance:textfield"
          value={maxPrice}
          onChange={(e) => {
            setMaxPrice(e.target.value);
            setPage(1);
          }}
        />

        <input
          type="number"
          placeholder="Min Stock"
          className="px-3 py-2 border rounded text-gray-500 text-theme-xs dark:text-gray-400 appearance:textfield"
          value={minStock}
          onChange={(e) => {
            setMinStock(e.target.value);
            setPage(1);
          }}
        />

        <select
          className="px-3 py-2 border rounded text-gray-500 text-theme-xs dark:text-gray-400"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="out">Out of Stock</option>
        </select>
      </div>

      {/* ---------------------- PRODUCT TABLE ---------------------- */}
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
              </TableRow>
            </TableHeader>

            <TableBody>
              {products.map((p) => (
                <TableRow key={p._id}>
                  <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400 text-center">
                    {p.name}
                  </TableCell>

                  <TableCell className="px-4 py-3">
                    <div className="flex justify-center">
                      <div className="flex -space-x-2">
                        {p.images.map((img, i) => (
                          <div
                            key={i}
                            className="w-8 h-8 rounded-full overflow-hidden border-2 border-white dark:border-gray-900"
                          >
                            <img src={img} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400 text-center">
                    {p.stock}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400 text-center">
                    ₹{p.price}
                  </TableCell>

                  <TableCell className="px-4 py-3  text-center">
                    <Badge size="sm" color={p.stock > 0 ? "success" : "error"}>
                      {p.stock > 0 ? "Available" : "Out of stock"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ---------------------- PAGINATION ---------------------- */}
      <div className="flex justify-end items-center gap-2 mt-4">
        <button
          disabled={page <= 1}
          onClick={() => setPage((prev) => prev - 1)}
          className="px-3 py-1 border rounded disabled:opacity-40 dark:border-gray-700 text-gray-500 dark:text-gray-400"
        >
          Prev
        </button>

        <span className="text-sm text-gray-700 dark:text-gray-300">
          Page {page} / {totalPages}
        </span>

        <button
          disabled={page >= totalPages}
          onClick={() => setPage((prev) => prev + 1)}
          className="px-3 py-1 border rounded disabled:opacity-40 dark:border-gray-700 text-gray-500 dark:text-gray-400"
        >
          Next
        </button>
      </div>

      {/* REMOVE ARROWS IN NUMBER INPUTS */}
      <style>{`
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
