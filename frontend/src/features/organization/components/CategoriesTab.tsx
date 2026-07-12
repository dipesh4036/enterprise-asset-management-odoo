"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
} from "../hooks/useOrg";
import { AssetCategory } from "../services/org.service";
import DataTable, { Column } from "@/components/common/DataTable";
import EmptyState from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PlusCircle, Edit2, Trash2, ShieldAlert, Plus, Layers } from "lucide-react";

interface CustomFieldItem {
  name: string;
  type: "string" | "number" | "boolean";
  required: boolean;
}

interface FormInputs {
  name: string;
  customFields: CustomFieldItem[];
}

export default function CategoriesTab() {
  const { data: categoryResponse, isLoading: categoriesLoading } = useCategories();
  
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();

  const categories = categoryResponse?.data || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AssetCategory | null>(null);

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<FormInputs>({
    defaultValues: {
      name: "",
      customFields: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "customFields",
  });

  const openCreateModal = () => {
    setEditingCategory(null);
    reset({
      name: "",
      customFields: [],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cat: AssetCategory) => {
    setEditingCategory(cat);
    
    // Parse custom fields schema from Json
    let schemaFields: CustomFieldItem[] = [];
    if (cat.customFields && Array.isArray(cat.customFields.fields)) {
      schemaFields = cat.customFields.fields;
    }

    reset({
      name: cat.name,
      customFields: schemaFields,
    });
    setIsModalOpen(true);
  };

  const onSubmit = (data: FormInputs) => {
    // Structure payload with fields list wrapped in JSON schema object
    const payload = {
      name: data.name,
      customFields: {
        fields: data.customFields.map(f => ({
          name: f.name.trim(),
          type: f.type,
          required: !!f.required,
        }))
      }
    };

    if (editingCategory) {
      updateCategoryMutation.mutate(
        { id: editingCategory.id, data: payload },
        {
          onSuccess: () => {
            toast.success("Asset category updated successfully");
            setIsModalOpen(false);
          },
          onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to update category");
          },
        }
      );
    } else {
      createCategoryMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Asset category created successfully");
          setIsModalOpen(false);
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Failed to create category");
        },
      });
    }
  };

  const columns: Column<AssetCategory>[] = [
    {
      header: "Category Name",
      accessor: "name",
      sortable: true,
    },
    {
      header: "Custom Attributes",
      accessor: (row) => {
        const fieldsList = (row.customFields as any)?.fields || [];
        if (fieldsList.length === 0) return <span className="text-zinc-400">None</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {fieldsList.map((f: any, idx: number) => (
              <span
                key={idx}
                className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border border-zinc-200/50"
              >
                {f.name} ({f.type})
                {f.required && <span className="text-rose-500 ml-0.5 font-bold">*</span>}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      header: "Assets Count",
      accessor: (row) => row._count?.assets ?? 0,
    },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => openEditModal(row)} className="cursor-pointer">
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Asset Categories Setup
        </h2>
        <Button onClick={openCreateModal} className="cursor-pointer">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <DataTable
        data={categories}
        columns={columns}
        searchPlaceholder="Search categories..."
        searchKey="name"
        isLoading={categoriesLoading}
        emptyState={
          <EmptyState
            icon={<Layers className="h-8 w-8 text-zinc-400" />}
            title="No Categories Configured"
            description="Add asset categories (e.g. Laptops, Servers) and setup custom schemas to begin classification."
            action={
              <Button size="sm" onClick={openCreateModal} className="cursor-pointer">
                Add Asset Category
              </Button>
            }
          />
        }
      />

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Asset Category" : "Create Asset Category"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Category Name
              </label>
              <Input
                type="text"
                placeholder="e.g. Laptops"
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && (
                <p className="text-xs text-rose-600 dark:text-rose-400">{errors.name.message}</p>
              )}
            </div>

            {/* Custom attributes section */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-zinc-750 dark:text-zinc-300">
                  Custom Attributes (Fields Schema)
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ name: "", type: "string", required: false })}
                  className="h-7 text-xs cursor-pointer border-dashed"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Add Field
                </Button>
              </div>

              {fields.length === 0 ? (
                <div className="p-4 text-center text-xs text-zinc-400 border border-dashed rounded-lg border-zinc-200 dark:border-zinc-800">
                  No custom attributes configured for this category yet.
                </div>
              ) : (
                <div className="max-h-[200px] overflow-y-auto space-y-2 pr-1">
                  {fields.map((field, idx) => (
                    <div key={field.id} className="flex items-center gap-3 bg-zinc-50/50 dark:bg-zinc-900/20 p-2 border border-zinc-150 dark:border-zinc-850 rounded-lg">
                      <div className="flex-1">
                        <Input
                          type="text"
                          placeholder="Field name (e.g. RAM)"
                          {...register(`customFields.${idx}.name` as const, { required: "Field name is required" })}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="w-28">
                        <select
                          className="flex h-8 w-full rounded-md border border-zinc-200 bg-transparent px-2 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:border-zinc-800"
                          {...register(`customFields.${idx}.type` as const)}
                        >
                          <option value="string">String</option>
                          <option value="number">Number</option>
                          <option value="boolean">Boolean</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 px-1">
                        <input
                          type="checkbox"
                          id={`required-${idx}`}
                          className="h-3.5 w-3.5 rounded border-zinc-300 text-primary focus:ring-primary cursor-pointer"
                          {...register(`customFields.${idx}.required` as const)}
                        />
                        <label htmlFor={`required-${idx}`} className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-400 cursor-pointer">
                          Required
                        </label>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(idx)}
                        className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-50/40 shrink-0 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
