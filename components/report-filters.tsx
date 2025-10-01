"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Filter } from "lucide-react"

interface ReportFiltersProps {
  categories: string[]
  tags: string[]
  selectedCategory: string
  selectedTags: string[]
  onCategoryChange: (category: string) => void
  onTagsChange: (tags: string[]) => void
}

export function ReportFilters({
  categories,
  tags,
  selectedCategory,
  selectedTags,
  onCategoryChange,
  onTagsChange,
}: ReportFiltersProps) {
  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag))
    } else {
      onTagsChange([...selectedTags, tag])
    }
  }

  const activeFiltersCount = (selectedCategory !== "all" ? 1 : 0) + selectedTags.length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Filter className="h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Category</DropdownMenuLabel>
        <DropdownMenuCheckboxItem checked={selectedCategory === "all"} onCheckedChange={() => onCategoryChange("all")}>
          All Categories
        </DropdownMenuCheckboxItem>
        {categories.map((category) => (
          <DropdownMenuCheckboxItem
            key={category}
            checked={selectedCategory === category}
            onCheckedChange={() => onCategoryChange(category)}
          >
            {category}
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Tags</DropdownMenuLabel>
        {tags.map((tag) => (
          <DropdownMenuCheckboxItem
            key={tag}
            checked={selectedTags.includes(tag)}
            onCheckedChange={() => handleTagToggle(tag)}
          >
            {tag}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
