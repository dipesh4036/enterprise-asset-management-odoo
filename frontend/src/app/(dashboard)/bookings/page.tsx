"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/axios";
import { useAuthStore } from "@/store/auth.store";
import { bookingService, BookingItem } from "@/features/booking/services/booking.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Wrench, FileText, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import LoadingSkeleton from "@/components/common/LoadingSkeleton";

const bookingFormSchema = z.object({
  assetId: z.string().min(1, "Please select a resource"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  notes: z.string().optional().or(z.string().length(0)),
}).refine((data) => new Date(data.endTime) > new Date(data.startTime), {
  message: "End time must be after start time",
  path: ["endTime"],
});

type BookingFormInput = z.infer<typeof bookingFormSchema>;

interface BookableAsset {
  id: string;
  name: string;
  assetTag: string;
  isBookable: boolean;
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function BookingsPage() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<BookingFormInput>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: { assetId: "", startTime: "", endTime: "", notes: "" },
  });

  const selectedAssetId = watch("assetId");

  // Fetch bookable assets
  const { data: assetsRes, isLoading: loadingAssets } = useQuery<BookableAsset[]>({
    queryKey: ["bookable-assets-options"],
    queryFn: async () => {
      const res = await api.get("/assets");
      return (res.data.data || []).filter((a: any) => a.isBookable);
    },
  });

  // Fetch bookings
  const { data: bookingsRes, isLoading: loadingBookings } = useQuery({
    queryKey: ["all-bookings"],
    queryFn: () => bookingService.getBookings(),
  });

  const assets = assetsRes || [];
  const bookings = bookingsRes?.data || [];

  // Filter bookings for selected asset schedule view
  const assetBookings = bookings.filter(
    (b) => b.assetId === selectedAssetId && b.status !== "CANCELLED"
  );

  // Filter current user's bookings
  const myBookings = bookings.filter((b) => b.userId === currentUser?.id);

  // Mutations
  const createBookingMutation = useMutation({
    mutationFn: (data: BookingFormInput) =>
      bookingService.createBooking({
        assetId: data.assetId,
        startTime: new Date(data.startTime).toISOString(),
        endTime: new Date(data.endTime).toISOString(),
        notes: data.notes || undefined,
      }),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Resource booked successfully!");
        reset();
        queryClient.invalidateQueries({ queryKey: ["all-bookings"] });
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to schedule booking. Conflicting overlaps found.");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => bookingService.cancelBooking(id),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Booking cancelled");
        queryClient.invalidateQueries({ queryKey: ["all-bookings"] });
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to cancel booking");
    },
  });

  const getStatusBadge = (status: BookingItem["status"]) => {
    switch (status) {
      case "UPCOMING":
        return <Badge className="bg-sky-500/10 text-sky-700 hover:bg-sky-500/10 border-sky-500/20">Upcoming</Badge>;
      case "ONGOING":
        return <Badge className="bg-amber-500/10 text-amber-700 hover:bg-amber-500/10 border-amber-500/20">Ongoing</Badge>;
      case "COMPLETED":
        return <Badge className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10 border-emerald-500/20">Completed</Badge>;
      case "CANCELLED":
      default:
        return <Badge className="bg-zinc-100 text-zinc-400 hover:bg-zinc-100 border-zinc-200">Cancelled</Badge>;
    }
  };

  const isLoading = loadingAssets || loadingBookings;

  if (isLoading) {
    return <LoadingSkeleton type="table" rows={6} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Resource Reservations Portal
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Reserve rooms, fleet vehicles, and equipment, inspect weekly schedules, and manage active booking slots.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reservation Scheduler Card */}
        <Card className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm lg:col-span-1 h-fit">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-bold text-zinc-805 dark:text-zinc-100 flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-zinc-400" />
              Book Resource Slot
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-4">
            <form onSubmit={handleSubmit((d) => createBookingMutation.mutate(d))} className="space-y-4">
              {/* Asset Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Select Bookable Resource
                </label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={createBookingMutation.isPending}
                  {...register("assetId")}
                >
                  <option value="">-- Choose Resource --</option>
                  {assets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.assetTag} - {asset.name}
                    </option>
                  ))}
                </select>
                {errors.assetId && (
                  <p className="text-xs text-rose-600 dark:text-rose-455 font-medium">
                    {errors.assetId.message}
                  </p>
                )}
              </div>

              {/* Start Time */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={createBookingMutation.isPending}
                  {...register("startTime")}
                />
                {errors.startTime && (
                  <p className="text-xs text-rose-600 dark:text-rose-455 font-medium">
                    {errors.startTime.message}
                  </p>
                )}
              </div>

              {/* End Time */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={createBookingMutation.isPending}
                  {...register("endTime")}
                />
                {errors.endTime && (
                  <p className="text-xs text-rose-600 dark:text-rose-455 font-medium">
                    {errors.endTime.message}
                  </p>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Booking Notes / Purpose
                </label>
                <textarea
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="State the purpose of this reservation..."
                  disabled={createBookingMutation.isPending}
                  {...register("notes")}
                />
              </div>

              <Button
                type="submit"
                disabled={createBookingMutation.isPending}
                className="w-full cursor-pointer bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
              >
                {createBookingMutation.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
                Reserve Slot
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Schedule Grid and My Bookings Table */}
        <div className="lg:col-span-2 space-y-6">
          {/* Selected Resource Weekly Schedule List */}
          <Card className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-sm font-bold text-zinc-850 dark:text-zinc-100 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-zinc-400" />
                Resource Weekly Bookings Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              {!selectedAssetId ? (
                <div className="text-center py-8 text-zinc-400 text-xs italic">
                  * Select a resource in the form to view its booked schedule slots.
                </div>
              ) : assetBookings.length === 0 ? (
                <div className="text-center py-8 text-zinc-400 text-xs italic border border-dashed border-zinc-150 rounded-xl">
                  No bookings scheduled for this resource this week.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {assetBookings.map((b) => {
                    const start = new Date(b.startTime);
                    const end = new Date(b.endTime);
                    const dayName = DAYS_OF_WEEK[start.getDay()];
                    return (
                      <div
                        key={b.id}
                        className="p-3 border border-zinc-100 dark:border-zinc-900 rounded-xl flex justify-between items-center bg-zinc-50/20 dark:bg-zinc-950 text-xs"
                      >
                        <div className="space-y-0.5">
                          <p className="font-semibold text-zinc-800 dark:text-zinc-250">
                            {dayName}, {start.toLocaleDateString()}
                          </p>
                          <p className="text-zinc-500 font-mono text-[11px]">
                            {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                            {end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        <div className="text-right text-[10px] text-zinc-400">
                          <span className="font-semibold text-zinc-700 dark:text-zinc-300">Reserved by: {b.user.name}</span>
                          {b.notes && <p className="italic font-normal max-w-[150px] truncate">{b.notes}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Reservations Table */}
          <Card className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-sm">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-sm font-bold text-zinc-850 dark:text-zinc-100 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-zinc-400" />
                My Booking Reservations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Resource</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>End Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myBookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-zinc-400 text-xs">
                        You have not scheduled any bookings yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    myBookings.map((b) => {
                      const isUpcoming = b.status === "UPCOMING" || b.status === "ONGOING";
                      return (
                        <TableRow key={b.id} className="text-xs">
                          <TableCell className="font-semibold">
                            {b.asset.name} <span className="font-mono text-[10px] text-zinc-400 uppercase">({b.asset.assetTag})</span>
                          </TableCell>
                          <TableCell>{new Date(b.startTime).toLocaleString()}</TableCell>
                          <TableCell>{new Date(b.endTime).toLocaleString()}</TableCell>
                          <TableCell>{getStatusBadge(b.status)}</TableCell>
                          <TableCell className="text-right">
                            {isUpcoming ? (
                              <Button
                                size="xs"
                                variant="outline"
                                disabled={cancelMutation.isPending}
                                className="text-[10px] h-7 border-rose-500/35 hover:bg-rose-50 text-rose-600 cursor-pointer"
                                onClick={() => cancelMutation.mutate(b.id)}
                              >
                                Cancel
                              </Button>
                            ) : (
                              <span className="text-[10px] text-zinc-400 italic">Inactive</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
