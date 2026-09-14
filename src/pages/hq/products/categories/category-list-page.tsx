import { useState } from "react";
import { FileX, UsersRound } from "lucide-react";

import { AddCategoryDialog } from "@/components/add-category-dialog";
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

const categories = [
  { id: "CAT001", name: "Beverages" },
  { id: "CAT002", name: "Fresh Food" },
  { id: "CAT003", name: "Snacks & Bakery" },
  { id: "CAT004", name: "Personal Care" },
  { id: "CAT005", name: "Household" },
];

export function CategoryListPage() {
  const [search, setSearch] = useState("");
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <main className="min-h-screen bg-background p-6 text-left text-foreground">
      <header className="flex h-12 items-center gap-3 rounded-md bg-textbox px-3">
        <UsersRound className="size-4.5 text-sidebar-top" aria-hidden="true" />
        <h1 className="m-0 text-base font-semibold text-active">
          Category Management
        </h1>
      </header>

      <section className="mt-4 space-y-4 px-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Input
            className="h-8 max-w-[400px] rounded-sm border-border bg-searchbar px-3 text-base text-primary-foreground placeholder:text-primary-foreground/70 focus-visible:border-focus focus-visible:ring-focus/20"
            value={search}
            placeholder="Search category name"
            aria-label="Search categories"
            onChange={(event) => setSearch(event.target.value)}
          />
          <Button
            type="button"
            size="sm"
            className="h-8 bg-primary text-sm text-primary-foreground hover:bg-active focus-visible:ring-focus/30"
            onClick={() => setAddCategoryOpen(true)}
          >
            Add Category
          </Button>
        </div>

        <div className="border border-border">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="h-auto w-1/4 border-r border-border px-4 py-2 text-base font-semibold">
                  Category ID
                </TableHead>
                <TableHead className="h-auto border-r border-border px-4 py-2 text-base font-semibold">
                  Category Name
                </TableHead>
                <TableHead className="h-auto w-28 px-4 py-2 text-base font-semibold">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category) => (
                <TableRow
                  key={category.id}
                  className="border-border even:bg-textbox hover:bg-primary-subtle"
                >
                  <TableCell className="h-auto border-r border-border px-4 py-2 text-base">
                    {category.id}
                  </TableCell>
                  <TableCell className="h-auto border-r border-border px-4 py-2 text-base">
                    {category.name}
                  </TableCell>
                  <TableCell className="h-auto px-4 py-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      className="text-foreground [&_svg]:size-3.5!"
                      aria-label={`Delete ${category.name}`}
                    >
                      <FileX />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between text-base">
          <span>Showing {filteredCategories.length} items</span>
          <nav className="flex items-center gap-1" aria-label="Pagination">
            <Button type="button" variant="ghost" size="xs" disabled>
              ‹
            </Button>
            <Button type="button" size="xs" aria-current="page">
              1
            </Button>
            <Button type="button" variant="ghost" size="xs" disabled>
              ›
            </Button>
          </nav>
        </div>
      </section>

      <AddCategoryDialog
        open={addCategoryOpen}
        onOpenChange={setAddCategoryOpen}
      />
    </main>
  );
}
