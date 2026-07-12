import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Check, X, ShieldAlert, AlertTriangle, HelpCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AuditEntry, auditService } from "../services/audit.service";

interface ChecklistTableProps {
  entries: AuditEntry[];
  cycleId: string;
  isClosed: boolean;
  isAuditor: boolean;
}

export default function ChecklistTable({
  entries,
  cycleId,
  isClosed,
  isAuditor,
}: ChecklistTableProps) {
  const queryClient = useQueryClient();
  const [rowNotes, setRowNotes] = useState<Record<string, string>>(
    entries.reduce((acc, entry) => ({ ...acc, [entry.id]: entry.notes || "" }), {})
  );

  const mutation = useMutation({
    mutationFn: (args: { assetId: string; status: AuditEntry["status"]; notes: string }) =>
      auditService.submitAuditEntry(cycleId, {
        assetId: args.assetId,
        status: args.status,
        notes: args.notes,
      }),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Audit verification recorded");
        queryClient.invalidateQueries({ queryKey: ["audit-cycle", cycleId] });
      } else {
        toast.error(res.message || "Failed to update entry");
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "An error occurred");
    },
  });

  const handleStatusUpdate = (entry: AuditEntry, status: AuditEntry["status"]) => {
    if (isClosed) return;
    if (!isAuditor) {
      toast.error("Access denied: You are not an assigned auditor for this cycle.");
      return;
    }
    const notes = rowNotes[entry.id] || "";
    mutation.mutate({ assetId: entry.assetId, status, notes });
  };

  const handleNotesSave = (entry: AuditEntry) => {
    if (isClosed) return;
    if (!isAuditor) {
      toast.error("Access denied: You are not an assigned auditor for this cycle.");
      return;
    }
    const notes = rowNotes[entry.id] || "";
    mutation.mutate({ assetId: entry.assetId, status: entry.status, notes });
  };

  const getStatusBadge = (status: AuditEntry["status"]) => {
    switch (status) {
      case "VERIFIED":
        return <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10">Verified</Badge>;
      case "MISSING":
        return <Badge className="bg-rose-500/10 text-rose-700 dark:text-rose-450 border-rose-500/20 hover:bg-rose-500/10">Missing</Badge>;
      case "DAMAGED":
        return <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/10">Damaged</Badge>;
      case "PENDING":
      default:
        return <Badge className="bg-zinc-100 text-zinc-500 border-zinc-200 hover:bg-zinc-100">Pending</Badge>;
    }
  };

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950">
      <Table>
        <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
          <TableRow>
            <TableHead className="w-[100px]">Asset Tag</TableHead>
            <TableHead>Asset Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Registry Status</TableHead>
            <TableHead>Audit Status</TableHead>
            <TableHead className="min-w-[200px]">Verification Notes</TableHead>
            <TableHead className="w-[200px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-zinc-500">
                No scoped assets found for this audit scope.
              </TableCell>
            </TableRow>
          ) : (
            entries.map((entry) => {
              const notesValue = rowNotes[entry.id] ?? "";
              const hasNotesChanged = notesValue !== (entry.notes || "");
              const isRowPending = mutation.isPending && mutation.variables?.assetId === entry.assetId;

              return (
                <TableRow key={entry.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                  <TableCell className="font-mono text-[11px] font-bold text-zinc-900 dark:text-zinc-100">
                    {entry.asset.assetTag}
                  </TableCell>
                  <TableCell className="font-medium text-zinc-900 dark:text-zinc-100">
                    {entry.asset.name}
                  </TableCell>
                  <TableCell className="text-zinc-500 text-xs">{entry.asset.location || "N/A"}</TableCell>
                  <TableCell>
                    <span className="capitalize text-xs text-zinc-400 font-semibold">{entry.asset.status.toLowerCase().replace("_", " ")}</span>
                  </TableCell>
                  <TableCell>{getStatusBadge(entry.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1.5 max-w-[250px]">
                      <Input
                        type="text"
                        value={notesValue}
                        disabled={isClosed || !isAuditor || isRowPending}
                        placeholder="Add verification details..."
                        className="h-8 text-xs focus-visible:ring-1"
                        onChange={(e) => setRowNotes({ ...rowNotes, [entry.id]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleNotesSave(entry);
                        }}
                      />
                      {hasNotesChanged && !isClosed && isAuditor && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleNotesSave(entry)}
                          className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 cursor-pointer"
                          title="Save Notes"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {isClosed ? (
                      <span className="text-[10px] text-zinc-400 italic">Locked</span>
                    ) : !isAuditor ? (
                      <span className="text-[10px] text-zinc-400">View Only</span>
                    ) : isRowPending ? (
                      <div className="flex justify-end pr-6">
                        <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                      </div>
                    ) : (
                      <div className="flex justify-end space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatusUpdate(entry, "VERIFIED")}
                          className={`h-7 px-2 cursor-pointer ${
                            entry.status === "VERIFIED"
                              ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 hover:bg-emerald-50"
                              : "text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50/50"
                          }`}
                          title="Mark Verified"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatusUpdate(entry, "DAMAGED")}
                          className={`h-7 px-2 cursor-pointer ${
                            entry.status === "DAMAGED"
                              ? "bg-amber-50 dark:bg-amber-950/20 text-amber-600 hover:bg-amber-50"
                              : "text-zinc-500 hover:text-amber-600 hover:bg-amber-50/50"
                          }`}
                          title="Mark Damaged"
                        >
                          <AlertTriangle className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatusUpdate(entry, "MISSING")}
                          className={`h-7 px-2 cursor-pointer ${
                            entry.status === "MISSING"
                              ? "bg-rose-50 dark:bg-rose-950/20 text-rose-600 hover:bg-rose-50"
                              : "text-zinc-500 hover:text-rose-600 hover:bg-rose-50/50"
                          }`}
                          title="Mark Missing"
                        >
                          <ShieldAlert className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
