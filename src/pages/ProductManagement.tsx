import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  MoreVertical,
  Plus,
  X,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  addProduct,
  deleteProduct,
  getAllProducts,
  updateProduct,
} from "../adminApi/productApi";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useNavigate } from "react-router-dom";
import {
  addCategory,
  addSubCategory,
  getAllCategories,
} from "@/adminApi/categoryApi";
import axios from "axios";
import { toast } from "sonner";

const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const modalBackdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalContentVariants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: { scale: 0.95, opacity: 0, transition: { duration: 0.2, ease: "easeIn" } },
};

export default function ProductManagement() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [addCategoryDialogOpen, setAddCategoryDialogOpen] = useState(false);
  const [addSubCategoryDialogOpen, setAddSubCategoryDialogOpen] =
    useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedParentCategory, setSelectedParentCategory] = useState("");
  const [newSubCategoryName, setNewSubCategoryName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedProductForDetails, setSelectedProductForDetails] = useState(null);

  const [formData, setFormData] = useState({
    brandName: "",
    productName: "",
    category: "",
    company: "",
    mrp: "",
    costPrice: "",
    stock: "",
    itemCode: "",
    gst: "",
    hsnCode: "",
    size: "",
    discount: "",
    packSize: "",
    description: "",
    image: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [errors, setErrors] = useState({});
  const productsPerPage = 5;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      fetchProducts();
      fetchCategories();
      setAuthLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchProducts = async () => {
    try {
      const res = await getAllProducts();
      const productData = res?.data?.data?.rows || [];
      if (!Array.isArray(productData)) {
        throw new Error("Product data is not an array");
      }

      setProducts(productData);
    } catch (err) {
      console.error("Fetch error:", err);
      setProducts([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await getAllCategories();
      let categoryData = [];

      if (res?.data?.data?.rows && Array.isArray(res.data.data.rows)) {
        categoryData = res.data.data.rows;
      } else if (res?.data?.rows && Array.isArray(res.data.rows)) {
        categoryData = res.data.rows;
      } else if (Array.isArray(res?.data)) {
        categoryData = res.data;
      }
      setCategories(categoryData);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCategoryChange = (value) => {
    setFormData({ ...formData, category: value });
  };

  const validate = () => {
    const requiredFields = {
      productName: "Product Name",
      category: "Category",
      mrp: "MRP",
      costPrice: "Cost Price",
      stock: "Stock",
      gst: "GST",
    };
    const newErrors = {};

    Object.keys(requiredFields).forEach((field) => {
      const value = formData[field];
      
      if (!value || String(value).trim() === "") {
        newErrors[field] = `${requiredFields[field]} is required.`;
      }
      
      if (field === "mrp" || field === "costPrice") {
        if (Number(value) <= 0) {
          newErrors[field] = `${requiredFields[field]} must be greater than 0.`;
        }
      }
      
      if (field === "stock" || field === "gst") {
        if (Number(value) < 0) {
          newErrors[field] = `${requiredFields[field]} cannot be negative.`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      const requiredFields = {
        productName: "Product Name",
        category: "Category",
        mrp: "MRP",
        costPrice: "Cost Price",
        stock: "Stock",
        gst: "GST",
      };
      const missingFields = Object.keys(requiredFields)
        .filter((field) => !formData[field])
        .map((field) => requiredFields[field]);
      toast.warning(
        `Please fill the following required fields: ${missingFields.join(", ")}`
      );
      return;
    }

    setLoading(true);

    try {
      let imageData = formData.image || "";
      if (imageFile && imageFile instanceof File) {
        imageData = imagePreview;
      }

      const payload = {
        brandName: formData.brandName || "",
        productName: formData.productName,
        category: formData.category,
        company: formData.company || "",
        mrp: parseFloat(formData.mrp),
        costPrice: parseFloat(formData.costPrice),
        stock: parseInt(formData.stock),
        itemCode: formData.itemCode || "",
        gst: parseFloat(formData.gst),
        hsnCode: formData.hsnCode || "",
        size: formData.size || "",
        discount: formData.discount || "",
        packSize: formData.packSize || "",
        description: formData.description || "",
        image: imageData,
      };

      let response;
      if (editingProduct) {
        response = await updateProduct({ id: editingProduct._id, data: payload });
      } else {
        response = await addProduct({ data: payload });
      }

      if (response.data?.status) {
        toast.success(response.data.message ||
            (editingProduct
              ? "✅ Product updated successfully!"
              : "✅ Product added successfully!")
        );
        setShowForm(false);
        setEditingProduct(null);
        resetForm();
        await fetchProducts();
      } else {
        toast.error(response.data?.message || "Failed to save product");
      }
    } catch (err) {
      console.error("❌ Submit Error:", err);
      toast.error(err.response?.data?.message || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.warning("Please enter a category name.");
      return;
    }
    if (!newCategoryDescription.trim()) {
      toast.warning("Please enter a category description.");
      return;
    }
    try {
      await addCategory({
        name: newCategoryName,
        description: newCategoryDescription,
        parent: null,
      });
      toast.success("✅ Category added successfully!");
      setAddCategoryDialogOpen(false);
      setNewCategoryName("");
      setNewCategoryDescription("");
      await fetchCategories();
    } catch (err) {
      console.error("Add category error:", err.response?.data || err);
      toast.error(err.response?.data?.message || "Failed to add category");
    }
  };

  const handleAddSubCategory = async () => {
    if (!selectedParentCategory) {
      toast.warning("Please select a parent category.");
      return;
    }
    if (!newSubCategoryName.trim()) {
      toast.warning("Please enter a sub-category name.");
      return;
    }
    try {
      await addSubCategory({
        name: newSubCategoryName,
        description: "",
        parent: selectedParentCategory,
      });
      toast.success("✅ Sub-category added successfully!");
      setAddSubCategoryDialogOpen(false);
      setNewSubCategoryName("");
      setSelectedParentCategory("");
      await fetchCategories();
    } catch (err) {
      console.error("Add sub-category error:", err.response?.data || err);
      toast.error(err.response?.data?.message || "Failed to add sub-category");
    }
  };

  const resetForm = () => {
    setFormData({
      brandName: "",
      productName: "",
      category: "",
      company: "",
      mrp: "",
      costPrice: "",
      stock: "",
      itemCode: "",
      gst: "",
      hsnCode: "",
      size: "",
      discount: "",
      packSize: "",
      description: "",
      image: "",
    });
    setImagePreview(null);
    setImageFile(null);
    setErrors({});
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      brandName: product.brandName !== undefined ? product.brandName : "",
      productName: product.productName !== undefined ? product.productName : "",
      category: product.category?._id || "",
      company: product.company !== undefined ? product.company : "",
      mrp: product.mrp !== undefined ? product.mrp : "",
      costPrice: product.costPrice !== undefined ? product.costPrice : "",
      stock: product.stock !== undefined ? product.stock : "",
      itemCode: product.itemCode !== undefined ? product.itemCode : "",
      gst: product.gst !== undefined ? product.gst : "",
      hsnCode: product.hsnCode !== undefined ? product.hsnCode : "",
      size: product.size !== undefined ? product.size : "",
      discount: product.discount !== undefined ? product.discount : "",
      packSize: product.packSize !== undefined ? product.packSize : "",
      description: product.description !== undefined ? product.description : "",
      image: product.image !== undefined ? product.image : "",
    });
  
    setImagePreview(product.image || null);
    setImageFile(null);
    setShowForm(true);
  };

  const handleViewDetails = (product) => {
    setSelectedProductForDetails(product);
    setIsDetailsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct({ id });
        await fetchProducts();
      } catch (err) {
        console.error("Delete error:", err);
        toast.error("Failed to delete product");
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, image: "" }));
  };

  const capitalizeFirstLetter = (string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

const filteredProducts = Array.isArray(products)
  ? products.filter((product) => {
      // Return all products if search is empty
      if (!searchTerm || searchTerm.trim() === "") {
        return true;
      }

      const search = searchTerm.toLowerCase().trim();

      // Check each field for matches
      const productName = (product?.productName || "").toLowerCase();
      const brandName = (product?.brandName || "").toLowerCase();
      const itemCode = (product?.itemCode || "").toLowerCase();
      const categoryName = (product?.category?.name || "").toLowerCase();
      const company = (product?.company || "").toLowerCase();

      // Return true if any field contains the search term
      return (
        productName.includes(search) ||
        brandName.includes(search) ||
        itemCode.includes(search) ||
        categoryName.includes(search) ||
        company.includes(search)
      );
    })
  : [];

  const indexOfLast = currentPage * productsPerPage;
  const indexOfFirst = indexOfLast - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  if (authLoading) {
    return null;
  }

  return (
    <AdminLayout title="Product Management">
      <motion.div
        className="space-y-4 md:space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Section - Responsive */}
        <motion.div // @ts-ignore 
        variants={itemVariants} className="flex flex-col gap-3 sm:gap-4">
          <div className="flex flex-col xs:flex-row gap-2 xs:gap-3 flex-wrap">
            <Button
              className="bg-[#119D82] hover:bg-[#0e866f] text-white text-xs sm:text-sm px-3 sm:px-4 h-9 sm:h-10"
              onClick={() => setAddCategoryDialogOpen(true)}
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> Add Category
            </Button>

            <Button
              className="bg-[#119D82] hover:bg-[#0e866f] text-white text-xs sm:text-sm px-3 sm:px-4 h-9 sm:h-10"
              onClick={() => setAddSubCategoryDialogOpen(true)}
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> Add Sub-Category
            </Button>

            <Button
              className="bg-[#119D82] hover:bg-[#0e866f] text-white text-xs sm:text-sm px-3 sm:px-4 h-9 sm:h-10"
              onClick={() => {
                setEditingProduct(null);
                resetForm();
                setShowForm(true);
              }}
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> Add Product
            </Button>
          </div>

          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search product..."
              className="pl-10 w-full h-9 sm:h-10 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </motion.div>

        {/* Table Section - Mobile Card View / Desktop Table */}
        <motion.div 
        // @ts-ignore
        variants={itemVariants} className="bg-white rounded-xl shadow">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#E8E8C6]">
                <tr>
                  {[
                    "Item Code",
                    "Brand Name",
                    "Category/Subcategory",
                    "Thumbnail",
                    "Name",
                    "Quantity",
                    "Price",
                    "Stock",
                    "Actions",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-4 xl:px-6 py-3 text-left text-xs xl:text-sm font-semibold whitespace-nowrap"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentProducts.length > 0 ? (
                  currentProducts.map((product) => (
                    <tr key={product._id} className="border-t hover:bg-gray-50">
                      <td className="px-4 xl:px-6 py-3 text-xs xl:text-sm whitespace-nowrap">
                        {product.itemCode || "N/A"}
                      </td>
                      <td className="px-4 xl:px-6 py-3 text-xs xl:text-sm whitespace-nowrap">
                        {product.brandName || "N/A"}
                      </td>
                      <td className="px-4 xl:px-6 py-3 text-xs xl:text-sm whitespace-nowrap">
                        {product.category?.name || "N/A"}
                      </td>
                      <td className="px-4 xl:px-6 py-3 whitespace-nowrap">
                        <div className="w-10 h-10 xl:w-12 xl:h-12 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.productName}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <ImageIcon className="w-5 h-5 xl:w-6 xl:h-6 text-gray-400" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 xl:px-6 py-3 text-xs xl:text-sm whitespace-nowrap">
                        {product.productName || "N/A"}
                      </td>
                      <td className="px-4 xl:px-6 py-3 text-xs xl:text-sm whitespace-nowrap">{product.stock || 0}</td>
                      <td className="px-4 xl:px-6 py-3 text-xs xl:text-sm whitespace-nowrap">₹{product.mrp || 0}</td>
                      <td className="px-4 xl:px-6 py-3 text-xs xl:text-sm font-medium whitespace-nowrap">
                        <span
                          className={`${
                            product.stock > 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {product.stock > 0 ? "In-stock" : "Out of stock"}
                        </span>
                      </td>
                      <td className="px-4 xl:px-6 py-3 whitespace-nowrap">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(product)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(product)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(product._id)}
                              className="text-red-600"
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-6 py-8 text-center text-gray-500 text-sm"
                    >
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden divide-y">
            {currentProducts.length > 0 ? (
              currentProducts.map((product) => (
                <div key={product._id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3 flex-1 min-w-0">
                      <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden flex-shrink-0">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.productName}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">
                          {product.productName || "N/A"}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {product.brandName || "N/A"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {product.category?.name || "N/A"}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(product)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(product)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(product._id)}
                          className="text-red-600"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Item Code:</span>
                      <p className="font-medium">{product.itemCode || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Price:</span>
                      <p className="font-medium">₹{product.mrp || 0}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Stock:</span>
                      <p className={`font-medium ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                        {product.stock || 0} ({product.stock > 0 ? "In-stock" : "Out of stock"})
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500 text-sm">
                No products found
              </div>
            )}
          </div>
        </motion.div>

        {/* Pagination - Responsive */}
        {totalPages > 1 && (<motion.div 
        // @ts-ignore
        variants={itemVariants}>
          <div className="flex justify-center items-center gap-1 sm:gap-2 mt-4 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="rounded-full h-8 w-8 sm:h-9 sm:w-9 p-0 text-xs sm:text-sm"
            >
              ‹
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(
                Math.max(0, currentPage - 2),
                Math.min(totalPages, currentPage + 1)
              )
              .map((page) => (
                <Button
                  key={page}
                  size="sm"
                  variant={page === currentPage ? "default" : "outline"}
                  className={`rounded-full h-8 w-8 sm:h-9 sm:w-9 p-0 text-xs sm:text-sm ${
                    page === currentPage
                      ? "bg-[#119D82] text-white"
                      : "text-gray-700 hover:bg-[#119D82] hover:text-white"
                  }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className="rounded-full h-8 w-8 sm:h-9 sm:w-9 p-0 text-xs sm:text-sm"
            >
              ›
            </Button>
          </div></motion.div>
        )}

        {/* Add/Edit Modal - Responsive */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
              variants={modalBackdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.div
                className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
                // @ts-ignore
                variants={modalContentVariants}
              >
              <div className="p-4 sm:p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                <h2 className="text-base sm:text-lg md:text-xl font-semibold">
                  {editingProduct ? "Edit Product" : "Add Product"}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowForm(false);
                    setEditingProduct(null);
                    resetForm();
                  }}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>

              <div className="p-4 sm:p-6 space-y-4">
                {/* Product Image Upload */}
                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-medium mb-2">
                    Product Image
                  </label>

                  <div className="border-2 border-dashed border-[#119D82] rounded-lg p-4 sm:p-6 text-center hover:bg-gray-50 transition-colors">
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center justify-center space-y-2 sm:space-y-3"
                    >
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Product Preview"
                          className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-md mx-auto border border-gray-200"
                        />
                      ) : (
                        <>
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                          </div>
                          <span className="text-[#119D82] font-medium text-xs sm:text-sm">
                            Click to upload image
                          </span>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, GIF or WEBP (max 5MB)
                          </p>
                        </>
                      )}
                    </label>

                    <input
                      id="image-upload"
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
                      className="hidden"
                      onChange={handleImageChange}
                    />

                    {imagePreview && (
                      <div className="mt-3 flex justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600 text-xs sm:text-sm"
                          onClick={removeImage}
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Input Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {[
                    { label: "Item Code", name: "itemCode", required: false },
                    { label: "Brand Name", name: "brandName", required: false },
                    {
                      label: "Product Name",
                      name: "productName",
                      required: true,
                    },
                    { label: "Category", name: "category", required: true },
                    { label: "Company", name: "company", required: false },
                    {
                      label: "MRP",
                      name: "mrp",
                      type: "number",
                      required: true,
                    },
                    {
                      label: "Cost Price",
                      name: "costPrice",
                      type: "number",
                      required: true,
                    },
                    {
                      label: "Stock",
                      name: "stock",
                      type: "number",
                      required: true,
                    },
                    {
                      label: "GST %",
                      name: "gst",
                      type: "number",
                      required: true,
                    },
                    { label: "HSN Code", name: "hsnCode", required: false },
                    { label: "Size", name: "size", required: false },
                    {
                      label: "Discount %",
                      name: "discount",
                      type: "number",
                      required: false,
                    },
                    { label: "Pack Size", name: "packSize", required: false },
                  ].map((field) => (
                    <div key={field.name}>
                      <label className="block text-xs sm:text-sm font-medium mb-1"> 
                        {field.label}{" "}
                        {field.required && (
                          <span className="text-red-500">*</span>
                        )}
                      </label>
                      {field.name === "category" ? (
                        <Select
                          onValueChange={handleCategoryChange}
                          value={formData.category}
                        >
                          <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat._id} value={cat._id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          name={field.name}
                          type={field.type || "text"}
                          value={formData[field.name]}
                          onChange={handleChange}
                          placeholder={
                            field.name === "hsnCode"
                              ? `Enter ${field.label.toLowerCase()} (for eg., 22011010)`
                              : field.name === "itemCode"
                                ? `Enter ${field.label.toLowerCase()} (for eg., CMT1234)`
                                : field.name === "packSize"
                                  ? `Enter ${field.label.toLowerCase()} (e.g., 1, 2, 3)`
                                  : field.name === "size"
                                    ? `Enter ${field.label.toLowerCase()} (e.g., small, large, medium)`
                                    : `Enter ${field.label.toLowerCase()}`}
                          className="h-9 sm:h-10 text-xs sm:text-sm"
                        />
                      )}
                      {errors[field.name] && (
                        <span className="text-red-500 text-xs mt-1 block">
                          {errors[field.name]}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1">
                    Description
                  </label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter product description"
                    className="min-h-[80px] sm:min-h-[100px] text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="p-4 sm:p-6 border-t flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 sticky bottom-0 bg-white">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto h-9 sm:h-10 text-xs sm:text-sm"
                  onClick={() => {
                    setShowForm(false);
                    setEditingProduct(null);
                    resetForm();
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-[#119D82] hover:bg-[#0e866f] text-white w-full sm:w-auto h-9 sm:h-10 text-xs sm:text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{editingProduct ? "Updating..." : "Adding..."}</span>
                    </div>
                  ) : (
                    editingProduct ? "Update Product" : "Add Product"
                  )}
                </Button>
              </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Category Dialog - Responsive */}
        <Dialog
          open={addCategoryDialogOpen}
          onOpenChange={setAddCategoryDialogOpen}
        >
          <DialogContent className="w-[95vw] max-w-[430px] p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-center text-base sm:text-lg">Add Category</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3 sm:gap-4 py-1">
              <div className="grid gap-2">
                <label htmlFor="category-name" className="text-xs sm:text-sm font-medium">
                  Category Name
                </label>
                <Input
                  id="category-name"
                  placeholder="Enter category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="h-9 sm:h-10 text-xs sm:text-sm"
                />
              </div>
              <div className="grid gap-2">
                <label
                  htmlFor="category-description"
                  className="text-xs sm:text-sm font-medium"
                >
                  Description
                </label>
                <Input
                  id="category-description"
                  placeholder="Enter category description"
                  value={newCategoryDescription}
                  onChange={(e) => setNewCategoryDescription(e.target.value)}
                  className="h-9 sm:h-10 text-xs sm:text-sm"
                />
              </div>
            </div>
            <DialogFooter className="flex flex-col-reverse sm:flex-row justify-between gap-3 sm:gap-4 px-0 sm:px-7 pb-2 sm:pb-6">
              <Button
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-50 rounded-full w-full sm:w-[137px] h-9 sm:h-10 text-xs sm:text-sm"
                onClick={() => setAddCategoryDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-[#119D82] hover:bg-[#0e866f] text-white rounded-full w-full sm:w-[137px] h-9 sm:h-10 text-xs sm:text-sm"
                onClick={handleAddCategory}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Sub-Category Dialog - Responsive */}
        <Dialog
          open={addSubCategoryDialogOpen}
          onOpenChange={setAddSubCategoryDialogOpen}
        >
          <DialogContent className="w-[95vw] max-w-[430px] p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-center text-base sm:text-lg">
                Add Sub-Category
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-3 sm:gap-4 py-1">
              <div className="grid gap-2">
                <Select
                  onValueChange={setSelectedParentCategory}
                  value={selectedParentCategory}
                >
                  <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter((cat) => !cat.parent)
                      .map((cat) => (
                        <SelectItem key={cat._id} value={cat._id}>
                          {capitalizeFirstLetter(cat.name)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Input
                  id="sub-category-name"
                  placeholder="Enter Sub-Category Name"
                  value={newSubCategoryName}
                  onChange={(e) => setNewSubCategoryName(e.target.value)}
                  className="h-9 sm:h-10 text-xs sm:text-sm"
                />
              </div>
            </div>
            <DialogFooter className="flex flex-col-reverse sm:flex-row justify-between gap-3 sm:gap-4 px-0 sm:px-7 pb-2 sm:pb-6">
              <Button
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-50 rounded-full w-full sm:w-[137px] h-9 sm:h-10 text-xs sm:text-sm"
                onClick={() => setAddSubCategoryDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-[#119D82] hover:bg-[#0e866f] text-white rounded-full w-full sm:w-[137px] h-9 sm:h-10 text-xs sm:text-sm"
                onClick={handleAddSubCategory}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* View Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
          {selectedProductForDetails && (
            <>
              <DialogHeader className="p-6 pb-4">
                <DialogTitle className="text-2xl font-bold text-gray-800">
                  Product Details
                </DialogTitle>
                <DialogDescription>
                  Detailed information about {selectedProductForDetails.productName}.
                </DialogDescription>
              </DialogHeader>

              <div className="p-6 space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3 flex-shrink-0">
                    <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden border">
                      {selectedProductForDetails.image ? (
                        <img
                          src={selectedProductForDetails.image}
                          alt={selectedProductForDetails.productName}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <ImageIcon className="w-16 h-16 text-gray-400" />
                      )}
                    </div>
                  </div>
                  <div className="md:w-2/3 grid grid-cols-2 gap-x-6 gap-y-4">
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Product Name</p>
                      <p className="text-lg font-semibold text-gray-900">{selectedProductForDetails.productName || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Brand</p>
                      <p className="text-base font-medium text-gray-800">{selectedProductForDetails.brandName || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Category</p>
                      <p className="text-base font-medium text-gray-800">{selectedProductForDetails.category?.name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Item Code</p>
                      <p className="text-base font-medium text-gray-800">{selectedProductForDetails.itemCode || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">HSN Code</p>
                      <p className="text-base font-medium text-gray-800">{selectedProductForDetails.hsnCode || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Pricing & Stock</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">MRP</p>
                      <p className="text-base font-semibold text-gray-900">₹{selectedProductForDetails.mrp?.toFixed(2) || "0.00"}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Cost Price</p>
                      <p className="text-base font-semibold text-gray-900">₹{selectedProductForDetails.costPrice?.toFixed(2) || "0.00"}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Discount</p>
                      <p className="text-base font-semibold text-gray-900">{selectedProductForDetails.discount || 0}%</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">GST</p>
                      <p className="text-base font-semibold text-gray-900">{selectedProductForDetails.gst || 0}%</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Stock</p>
                      <p className={`text-base font-semibold ${selectedProductForDetails.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>{selectedProductForDetails.stock || 0}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Pack Size</p>
                      <p className="text-base font-semibold text-gray-900">{selectedProductForDetails.packSize || "N/A"}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Size</p>
                      <p className="text-base font-semibold text-gray-900">{selectedProductForDetails.size || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {selectedProductForDetails.description && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{selectedProductForDetails.description}</p>
                  </div>
                )}
              </div>

              <DialogFooter className="p-6 pt-0">
                <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}