import { useState } from "react";
import { Eye, FilePenLine, FileX, UsersRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const products = [
  {
    pId: "P001001",
    name: "Drinking Water 600ml",
    category: "Beverages",
    status: "Active",
  },
  {
    pId: "P001002",
    name: "Coke 325ml",
    category: "Beverages",
    status: "Active",
  },
  {
    pId: "P002015",
    name: "Milk Bread",
    category: "Snacks & Bakery",
    status: "Active",
  },
  {
    pId: "P003020",
    name: "Cooling Shampoo",
    category: "Personal Care",
    status: "Active",
  },
  {
    pId: "P004010",
    name: "Bar Soap 90g",
    category: "Household",
    status: "Active",
  },
  {
    pId: "P005011",
    name: "Green Tea 500ml",
    category: "Beverages",
    status: "Active",
  },
  {
    pId: "P006012",
    name: "Butter Croissant",
    category: "Snacks & Bakery",
    status: "Active",
  },
  {
    pId: "P007013",
    name: "Toothpaste 150g",
    category: "Personal Care",
    status: "Active",
  },
  {
    pId: "P008014",
    name: "Laundry Detergent",
    category: "Household",
    status: "Active",
  },
  {
    pId: "P009015",
    name: "Orange Juice 1L",
    category: "Beverages",
    status: "Active",
  },
] as const;

const blueButtonClassName =
  "h-8 bg-primary text-sm text-primary-foreground hover:bg-active focus-visible:ring-focus/30";

export function ProductListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  return (
    <main className="min-h-screen bg-background p-6 text-left text-foreground">
      <header className="flex h-12 items-center gap-3 rounded-md bg-textbox px-3">
        <UsersRound className="size-4.5 text-sidebar-top" aria-hidden="true" />
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
            onChange={(event) => setSearch(event.target.value)}
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
            <Button type="button" size="sm" className={blueButtonClassName}>
              Filter
            </Button>
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
                    {product.category}
                  </TableCell>
                  <TableCell className="h-auto border-r border-border px-4 py-2 text-base">
                    {product.status}
                  </TableCell>
                  <TableCell className="h-auto px-4 py-2">
                    <div className="flex items-center gap-0.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        className="text-foreground [&_svg]:size-3.5!"
                        aria-label={`View ${product.name}`}
                      >
                        <Eye />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        className="text-foreground [&_svg]:size-3.5!"
                        aria-label={`Edit ${product.name}`}
                      >
                        <FilePenLine />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        className="text-foreground [&_svg]:size-3.5!"
                        aria-label={`Delete ${product.name}`}
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
          <span>Showing {products.length} items</span>
          <nav className="flex items-center gap-1" aria-label="Pagination">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              aria-label="Previous page"
              disabled
            >
              ‹
            </Button>
            <Button
              type="button"
              variant="default"
              size="xs"
              aria-current="page"
            >
              1
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              aria-label="Next page"
              disabled
            >
              ›
            </Button>
          </nav>
        </div>
      </section>
    </main>
  );
}
