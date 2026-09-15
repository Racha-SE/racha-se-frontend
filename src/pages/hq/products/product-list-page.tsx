import { useEffect, useState } from "react";
import { Eye, FilePenLine, FileX, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getCategories, type Category } from "@/api/category";
import {
  deactivateProduct,
  getProductById,
  getProducts,
  type Product,
} from "@/api/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaginationControls } from "@/components/pagination-controls";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { ProductDetailDialog } from "./product-detail-dialog";
import {
  ProductFilterDialog,
  type ProductFilterValues,
} from "./product-filter-dialog";

const blueButtonClassName =
  "h-8 bg-primary text-sm text-primary-foreground hover:bg-active focus-visible:ring-focus/30";
const itemsPerPage = 10;

export function ProductListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [filters, setFilters] = useState<ProductFilterValues>({});
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function loadCategories() {
      const response = await getCategories();
      setCategories(response.data.result);
    }

    void loadCategories();
  }, []);

  useEffect(() => {
    async function loadProducts() {
      const response = await getProducts({
        search: search.trim() || undefined,
        categoryId: filters.category ? Number(filters.category) : undefined,
        isActive: filters.isActive,
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage,
      });

      setProducts(response.data.products);
      setTotal(response.data.total);
      setTotalPages(Math.max(response.data.totalPages, 1));
    }

    void loadProducts();
  }, [search, filters, page]);

  const categoryOptions = categories.map((category) => ({
    label: category.categoryName,
    value: String(category.categoryId),
  }));

  async function handleView(productId: number) {
    const response = await getProductById(productId);
    setSelectedProduct(response.data);
  }

  async function handleDelete(product: Product) {
    const response = await deactivateProduct(product.pId);

    setProducts((currentProducts) =>
      currentProducts.map((currentProduct) =>
        currentProduct.pId === product.pId ? response.data : currentProduct,
      ),
    );
  }

  return (
    <main className="min-h-screen bg-background p-6 text-left text-foreground">
      <header className="flex h-12 items-center gap-3 rounded-md bg-textbox px-3">
        <Package className="size-4.5 text-sidebar-top" aria-hidden="true" />
        <h1 className="m-0 text-base font-semibold tracking-normal text-active">
          Product Management
        </h1>
      </header>

      <section className="mt-4 space-y-4 px-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Input
            className="h-8 max-w-[400px] rounded-sm border-border bg-searchbar px-3 text-base text-primary-foreground placeholder:text-primary-foreground/70 focus-visible:border-focus focus-visible:ring-focus/20"
            value={search}
            placeholder="Search product name / ID"
            aria-label="Search products"
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />

          <div className="flex gap-3">
            <Button
              type="button"
              size="sm"
              className={blueButtonClassName}
              onClick={() => navigate("/hq/products/new")}
            >
              Add Product
            </Button>
            <ProductFilterDialog
              categories={categoryOptions}
              value={filters}
              onApply={(nextFilters) => {
                setFilters(nextFilters);
                setPage(1);
              }}
            />
          </div>
        </div>

        <div className="border border-border">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="h-auto border-r border-border px-4 py-2 text-base font-semibold">
                  Product ID
                </TableHead>
                <TableHead className="h-auto border-r border-border px-4 py-2 text-base font-semibold">
                  Product Name
                </TableHead>
                <TableHead className="h-auto border-r border-border px-4 py-2 text-base font-semibold">
                  Category
                </TableHead>
                <TableHead className="h-auto border-r border-border px-4 py-2 text-base font-semibold">
                  Status
                </TableHead>
                <TableHead className="h-auto px-4 py-2 text-base font-semibold">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow
                  key={product.pId}
                  className="border-border even:bg-textbox hover:bg-primary-subtle"
                >
                  <TableCell className="h-auto border-r border-border px-4 py-2 text-base">
                    {product.pId}
                  </TableCell>
                  <TableCell className="h-auto border-r border-border px-4 py-2 text-base">
                    {product.name}
                  </TableCell>
                  <TableCell className="h-auto border-r border-border px-4 py-2 text-base">
                    {product.categories.length > 0
                      ? product.categories
                          .map((category) => category.categoryName)
                          .join(", ")
                      : "—"}
                  </TableCell>
                  <TableCell className="h-auto border-r border-border px-4 py-2 text-base">
                    {product.isActive ? "Active" : "Inactive"}
                  </TableCell>
                  <TableCell className="h-auto px-4 py-2">
                    <div className="flex items-center gap-0.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        className="text-foreground [&_svg]:size-3.5!"
                        aria-label={`View ${product.name}`}
                        onClick={() => void handleView(product.pId)}
                      >
                        <Eye />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        className="text-foreground [&_svg]:size-3.5!"
                        aria-label={`Edit ${product.name}`}
                        onClick={() =>
                          navigate(
                            `/hq/products/${encodeURIComponent(String(product.pId))}/edit`,
                          )
                        }
                      >
                        <FilePenLine />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        className="text-foreground [&_svg]:size-3.5!"
                        aria-label={`Delete ${product.name}`}
                        disabled={!product.isActive}
                        onClick={() => void handleDelete(product)}
                      >
                        <FileX />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between text-base text-foreground">
          <span>
            Showing {products.length} of {total} items
          </span>
          <PaginationControls
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </section>

      <ProductDetailDialog
        product={selectedProduct}
        onOpenChange={(open) => {
          if (!open) setSelectedProduct(null);
        }}
      />
    </main>
  );
}
