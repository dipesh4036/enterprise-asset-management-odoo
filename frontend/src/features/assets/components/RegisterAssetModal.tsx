"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useCreateAsset } from "../hooks/useAssets";
import { useCategories, useDepartments } from "@/features/organization/hooks/useOrg";
import { Asset, AssetCondition } from "../services/asset.service";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2, Copy, Plus } from "lucide-react";

const assetFormSchema = z.object({
  name: z.string().min(2, "Asset name must be at least 2 characters"),
  categoryId: z.string().min(1, "Category is required"),
  serialNumber: z.string().optional().nullable(),
  acquisitionDate: z.string().optional().nullable(),
  acquisitionCost: z.coerce.number().nonnegative("Acquisition cost must be positive").optional().nullable(),
  condition: z.enum(["Good", "Fair", "Poor"] as const),
  location: z.string().min(1, "Location is required"),
  departmentId: z.string().optional().nullable(),
  isBookable: z.boolean().optional(),
  photoUrl: z.string().url("Invalid photo URL").or(z.literal("")).optional().nullable(),
  documentUrl: z.string().url("Invalid document URL").or(z.literal("")).optional().nullable(),
  customFields: z.record(z.string(), z.any()).optional().nullable(),
});

interface FormInputs {
  name: string;
  categoryId: string;
  serialNumber?: string | null;
  acquisitionDate?: string | null;
  acquisitionCost?: number | null;
  condition: "Good" | "Fair" | "Poor";
  location: string;
  departmentId?: string | null;
  isBookable?: boolean;
  photoUrl?: string | null;
  documentUrl?: string | null;
  customFields?: Record<string, any> | null;
}

interface RegisterAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RegisterAssetModal({ isOpen, onClose }: RegisterAssetModalProps) {
  const createAssetMutation = useCreateAsset();
  const { data: categoriesResponse } = useCategories();
  const { data: deptsResponse } = useDepartments();

  const categories = categoriesResponse?.data || [];
  const departments = deptsResponse?.data || [];

  // Success view state
  const [createdAsset, setCreatedAsset] = useState<Asset | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormInputs>({
    resolver: zodResolver(assetFormSchema) as any,
    defaultValues: {
      name: "",
      categoryId: "",
      serialNumber: "",
      acquisitionDate: "",
      acquisitionCost: null,
      condition: "Good",
      location: "",
      departmentId: "",
      isBookable: false,
      photoUrl: "",
      documentUrl: "",
      customFields: {},
    },
  });

  const selectedCategoryId = watch("categoryId");
  const [customFieldsSchema, setCustomFieldsSchema] = useState<any[]>([]);

  // Update dynamic custom fields when category changes
  useEffect(() => {
    if (!selectedCategoryId) {
      setCustomFieldsSchema([]);
      return;
    }
    const cat = categories.find((c) => c.id === selectedCategoryId);
    if (cat && cat.customFields && Array.isArray(cat.customFields.fields)) {
      setCustomFieldsSchema(cat.customFields.fields);
    } else {
      setCustomFieldsSchema([]);
    }
  }, [selectedCategoryId, categories]);

  const onSubmit = (data: FormInputs) => {
    // Process custom fields according to schema types
    const parsedCustomFields: Record<string, any> = {};
    if (data.customFields) {
      customFieldsSchema.forEach((field) => {
        const value = data.customFields?.[field.name];
        if (value !== undefined && value !== "") {
          if (field.type === "number") {
            parsedCustomFields[field.name] = Number(value);
          } else if (field.type === "boolean") {
            parsedCustomFields[field.name] = Boolean(value);
          } else {
            parsedCustomFields[field.name] = String(value);
          }
        }
      });
    }

    const payload = {
      ...data,
      serialNumber: data.serialNumber || null,
      departmentId: data.departmentId || null,
      photoUrl: data.photoUrl || null,
      documentUrl: data.documentUrl || null,
      acquisitionDate: data.acquisitionDate ? new Date(data.acquisitionDate).toISOString() : null,
      customFields: Object.keys(parsedCustomFields).length > 0 ? parsedCustomFields : null,
    };

    createAssetMutation.mutate(payload, {
      onSuccess: (response) => {
        toast.success("Asset registered successfully");
        setCreatedAsset(response.data);
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || "Failed to register asset");
      },
    });
  };

  const handleCopyTag = () => {
    if (createdAsset) {
      navigator.clipboard.writeText(createdAsset.assetTag);
      toast.success("Asset tag copied to clipboard!");
    }
  };

  const handleRegisterAnother = () => {
    setCreatedAsset(null);
    reset();
  };

  const handleClose = () => {
    setCreatedAsset(null);
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register New Asset</DialogTitle>
        </DialogHeader>

        {createdAsset ? (
          /* SUCCESS VIEW */
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-5">
            <div className="p-3 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 animate-scale-in">
              <CheckCircle2 className="h-16 w-16" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                Asset Registered Successfully!
              </h3>
              <p className="text-sm text-zinc-550 dark:text-zinc-400">
                An auto-generated unique asset tag has been assigned to <strong>{createdAsset.name}</strong>.
              </p>
            </div>

            <div className="flex flex-col items-center bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl max-w-sm w-full space-y-2 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                Assigned Asset Tag
              </span>
              <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-wider">
                {createdAsset.assetTag}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyTag}
                className="mt-2 text-xs h-8 cursor-pointer flex items-center gap-1.5"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy Tag
              </Button>
            </div>

            <div className="flex gap-3 pt-4 w-full justify-center">
              <Button variant="outline" onClick={handleRegisterAnother} className="cursor-pointer">
                Register Another
              </Button>
              <Button onClick={handleClose} className="cursor-pointer">
                Done
              </Button>
            </div>
          </div>
        ) : (
          /* FORM VIEW */
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Asset Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Asset Name *
                </label>
                <Input
                  type="text"
                  placeholder="e.g. MacBook Pro 16\"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-rose-600 dark:text-rose-400">{errors.name.message}</p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Category *
                </label>
                <select
                  className="flex h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:border-zinc-800"
                  {...register("categoryId")}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="text-xs text-rose-600 dark:text-rose-400">{errors.categoryId.message}</p>
                )}
              </div>

              {/* Serial Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Serial Number
                </label>
                <Input
                  type="text"
                  placeholder="e.g. C02X1234LVDG"
                  {...register("serialNumber")}
                />
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Location *
                </label>
                <Input
                  type="text"
                  placeholder="e.g. HQ - Room 402"
                  {...register("location")}
                />
                {errors.location && (
                  <p className="text-xs text-rose-600 dark:text-rose-400">{errors.location.message}</p>
                )}
              </div>

              {/* Condition */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Condition *
                </label>
                <select
                  className="flex h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:border-zinc-800"
                  {...register("condition")}
                >
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>

              {/* Department */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Department Assignment
                </label>
                <select
                  className="flex h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:border-zinc-800"
                  {...register("departmentId")}
                >
                  <option value="">None (Unassigned)</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Acquisition Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Acquisition Date
                </label>
                <Input
                  type="date"
                  {...register("acquisitionDate")}
                />
              </div>

              {/* Acquisition Cost */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Acquisition Cost ($)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 1499.00"
                  {...register("acquisitionCost")}
                />
                {errors.acquisitionCost && (
                  <p className="text-xs text-rose-600 dark:text-rose-400">{errors.acquisitionCost.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Photo URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Photo URL
                </label>
                <Input
                  type="text"
                  placeholder="https://example.com/photo.jpg"
                  {...register("photoUrl")}
                />
                {errors.photoUrl && (
                  <p className="text-xs text-rose-600 dark:text-rose-400">{errors.photoUrl.message}</p>
                )}
              </div>

              {/* Document URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Document / Invoice URL
                </label>
                <Input
                  type="text"
                  placeholder="https://example.com/invoice.pdf"
                  {...register("documentUrl")}
                />
                {errors.documentUrl && (
                  <p className="text-xs text-rose-600 dark:text-rose-400">{errors.documentUrl.message}</p>
                )}
              </div>
            </div>

            {/* Bookable Toggle */}
            <div className="flex items-center gap-2 py-2">
              <input
                type="checkbox"
                id="isBookable"
                className="h-4 w-4 rounded border-zinc-300 text-primary focus:ring-primary cursor-pointer"
                {...register("isBookable")}
              />
              <label htmlFor="isBookable" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                Available for Resource Booking (e.g. cars, projectors)
              </label>
            </div>

            {/* DYNAMIC CUSTOM FIELDS */}
            {customFieldsSchema.length > 0 && (
              <div className="border-t border-zinc-100 dark:border-zinc-850 pt-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Category Attributes
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {customFieldsSchema.map((field) => {
                    const isRequired = !!field.required;
                    return (
                      <div key={field.name} className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                          {field.name} {isRequired && "*"}
                        </label>
                        {field.type === "boolean" ? (
                          <div className="flex items-center h-9">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-zinc-300 text-primary focus:ring-primary cursor-pointer"
                              {...register(`customFields.${field.name}` as const)}
                            />
                          </div>
                        ) : (
                          <Input
                            type={field.type === "number" ? "number" : "text"}
                            placeholder={`Enter ${field.name.toLowerCase()}`}
                            {...register(`customFields.${field.name}` as const, {
                              required: isRequired ? `${field.name} is required` : false,
                            })}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={createAssetMutation.isPending}>
                {createAssetMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Register Asset"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
