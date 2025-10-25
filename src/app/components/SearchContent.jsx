"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import { Funnel, Search } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SearchContent() {
    const searchParams = useSearchParams();
    const queryParam = searchParams.get("query") || ""; // 🔹 Get query from URL
    const [query, setQuery] = useState(queryParam);
    const router = useRouter()

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        minPrice: "",
        maxPrice: "",
        category: "",
        subcategory: "",
        sortBy: "relevance",
    });

    const categoryOptions = {
        Electronics: ["Mobiles", "TVs", "Refrigerators", "Laptops", "Headphones"],
        Clothes: ["Men", "Women", "Kids"],
        "Home & Kitchen": ["Furniture", "Cookware", "Decor", "Appliances"],
        Beauty: ["Makeup", "Skincare", "Fragrance", "Haircare"],
        Sports: ["Cricket", "Football", "Fitness", "Cycling"],
        Books: ["Fiction", "Non-fiction", "Educational", "Comics"],
    };

    const [categories] = useState(Object.keys(categoryOptions));
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedSubcategory, setSelectedSubcategory] = useState("");
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const qs = new URLSearchParams({
                query,
                minPrice: filters.minPrice || 0,
                maxPrice: filters.maxPrice || 999999,
                category: filters.category || "",
                subcategory: filters.subcategory || "",
                sortBy: filters.sortBy,
            });
            const res = await fetch(`/api/products/search?${qs.toString()}`);
            const data = await res.json();
            if (data.success) setProducts(data.products);

        } catch (err) {
            console.error("Search fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [query, filters]);

    // Sorting dropdown change handler
    const handleSortChange = (e) => {
        setFilters({ ...filters, sortBy: e.target.value });
        setTimeout(fetchProducts, 0);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const searchTerm = e.target.search.value.trim();
        setQuery(searchTerm);
        router.push(`/search?query=${encodeURIComponent(searchTerm)}`);
    };

    // 🔹 Clear all filters button
    const handleClearFilters = () => {
        setFilters({
            minPrice: "",
            maxPrice: "",
            category: "",
            subcategory: "",
            sortBy: "relevance",
        });
        setSelectedCategory("");
        setQuery("");
        
        router.push("/search"); // Remove query from URL
    };

    return (
        <div className="max-w-8xl flex flex-col md:flex-row  gap-4">
            {/* Sidebar (desktop filters) */}
            <aside className="hidden md:block w-68 bg-white rounded-lg shadow-md p-4 min-h-[100vh] border-r-2 border-dashed border-green-600">
                <h3 className="font-semibold text-lg mb-3 bg-green-500 text-white p-1 rounded-sm">Filters</h3>
                <div className="flex flex-col gap-4">
                    <form
                        onSubmit={handleSearchSubmit}
                        className="flex items-center w-[fit-content] text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full"
                    >
                        <Search size={18} className="text-slate-600" />
                        <input
                            name="search"
                            className="w-[fit-content] bg-transparent outline-none placeholder-slate-600"
                            type="text"
                            placeholder="Search products"
                            required
                        />
                    </form>

                    {/* Category & Subcategory */}
                    <div>
                        <p className="text-sm font-semibold mb-1">Category</p>
                        <select
                            value={filters.category}
                            onChange={(e) => {
                                setFilters({ ...filters, category: e.target.value })
                                setSelectedCategory(e.target.value)
                            }}
                            className="border px-3 py-2 rounded w-full"
                        >
                            <option value="">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat}>{cat}</option>
                            ))}
                        </select>

                        {selectedCategory && (
                            <select
                                value={filters.subcategory}
                                onChange={(e) => setFilters({ ...filters, subcategory: e.target.value })}
                                className="border px-3 py-2 rounded mt-2 w-full"
                            >
                                <option value="">All Subcategories</option>
                                {categoryOptions[selectedCategory].map((sub) => (
                                    <option key={sub}>{sub}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Price Filter */}
                    <div>
                        <p className="text-sm font-semibold mb-1">Price Range</p>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                placeholder="Min"
                                className="w-20 border rounded px-2 py-1"
                                value={filters.minPrice}
                                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                            />
                            <span>-</span>
                            <input
                                type="number"
                                placeholder="Max"
                                className="w-20 border rounded px-2 py-1"
                                value={filters.maxPrice}
                                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Sort Options */}
                    <div>
                        <p className="text-sm font-semibold mb-1">Sort By</p>
                        <select
                            value={filters.sortBy}
                            onChange={handleSortChange}
                            className="w-full border rounded px-2 py-1"
                        >
                            <option value="relevance">Relevance</option>
                            <option value="priceLowHigh">Price: Low to High</option>
                            <option value="priceHighLow">Price: High to Low</option>
                            <option value="newest">Newest Arrivals</option>
                        </select>
                    </div>

                    <button
                        onClick={fetchProducts}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                        Apply Filters
                    </button>
                    <button
                        onClick={handleClearFilters} // 🔹 Clear All Filters
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                        Clear All
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden flex justify-between items-center mb-3 absolute right-4">

                <button
                    onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                    className="p-4 rounded-full shadow-md cursor-pointer "
                >
                    <Funnel size={20} className="text-green-500" />
                </button>

            </div>

            {/* Mobile Filter Drawer */}
            {mobileFilterOpen && (
                <div className="md:hidden relative bg-white rounded-lg shadow-sm p-4 mb-4">
                    <div className="flex flex-col gap-3">
                        <form
                            onSubmit={handleSearchSubmit}
                            className="flex items-center w-xs text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full"
                        >
                            <Search size={18} className="text-slate-600" />
                            <input
                                name="search"
                                className="w-full bg-transparent outline-none placeholder-slate-600"
                                type="text"
                                placeholder="Search products"
                                required
                            />
                        </form>

                        <div>
                            <p className="text-sm font-semibold mb-1">Category</p>
                            <select
                                value={filters.category}
                                onChange={(e) => {
                                    setFilters({ ...filters, category: e.target.value })
                                    setSelectedCategory(e.target.value)
                                }}
                                className="border px-3 py-2 rounded w-full"
                            >
                                <option value="">All Categories</option>
                                {categories.map((cat) => (
                                    <option key={cat}>{cat}</option>
                                ))}
                            </select>

                            {selectedCategory && (
                                <select
                                    value={filters.subcategory}
                                    onChange={(e) => setFilters({ ...filters, subcategory: e.target.value })}
                                    className="border px-3 py-2 rounded mt-2 w-full"
                                >
                                    <option value="">All Subcategories</option>
                                    {categoryOptions[selectedCategory].map((sub) => (
                                        <option key={sub}>{sub}</option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div>
                            <p className="text-sm font-semibold mb-1">Price Range</p>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    className="w-20 border rounded px-2 py-1"
                                    value={filters.minPrice}
                                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                                />
                                <span>-</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    className="w-20 border rounded px-2 py-1"
                                    value={filters.maxPrice}
                                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-semibold mb-1">Sort By</p>
                            <select
                                value={filters.sortBy}
                                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                                className="w-full border rounded px-2 py-1"
                            >
                                <option value="relevance">Relevance</option>
                                <option value="priceLowHigh">Price: Low to High</option>
                                <option value="priceHighLow">Price: High to Low</option>
                                <option value="newest">Newest Arrivals</option>
                            </select>
                        </div>

                        <button
                            onClick={() => {
                                fetchProducts();
                                setMobileFilterOpen(false);
                            }}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                            Apply Filters
                        </button>
                        <button
            onClick={handleClearFilters} // 🔹 Clear All Filters
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Clear All
          </button>
                    </div>
                </div>
            )}

            {/* Product Grid */}
            <main className="flex-1 p-4">
                {/* {
                    query && <h2 className=" text-2xl font-semibold mb-4">
                    Results for “{query}”
                </h2>
                } */}

                {loading ? (
                    <p>Loading...</p>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {products.map((p) => (
                            <ProductCard key={p._id} product={p} />
                        ))}
                    </div>
                ) : (
                    <p>No products found.</p>
                )}
            </main>
        </div>
    );
}
