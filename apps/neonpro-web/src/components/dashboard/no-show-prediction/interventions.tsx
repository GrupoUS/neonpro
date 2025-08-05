// Story 11.2: No-Show Prediction Interventions Component
// Manage and track intervention strategies

"use client";

import type { useEffect, useState } from "react";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Icons } from "@/components/ui/icons";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Textarea } from "@/components/ui/textarea";
import type { useToast } from "@/hooks/use-toast";

interface Intervention {
  id: string;
  prediction_id: string;
  patient_id: string;
  intervention_type: string;
  message: string;
  scheduled_at: string;
  status: string;
  outcome: string | null;
  effectiveness_score: number | null;
  created_at: string;
  patient: {
    name: string;
    email: string;
    phone: string;
  };
}

export default function NoShowPredictionInterventions() {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();
  useEffect(() => {
    fetchInterventions();
  }, [filter]);

  const fetchInterventions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== "all") {
        params.append("status", filter);
      }

      const response = await fetch(`/api/no-show-prediction/interventions?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch interventions");
      }

      const data = await response.json();
      setInterventions(data.interventions || []);
    } catch (error) {
      console.error("Error fetching interventions:", error);
      toast({
        title: "Error",
        description: "Failed to load interventions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "pending":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getOutcomeBadgeVariant = (outcome: string | null) => {
    switch (outcome) {
      case "successful":
        return "default";
      case "partially_successful":
        return "secondary";
      case "unsuccessful":
        return "destructive";
      default:
        return "outline";
    }
  };
  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Interventions</h2>
          <p className="text-muted-foreground">Manage proactive intervention strategies</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Icons.plus className="mr-2 h-4 w-4" />
              New Intervention
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Intervention</DialogTitle>
              <DialogDescription>
                Create a proactive intervention for a high-risk patient
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="intervention-type">Intervention Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select intervention type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone_call">Phone Call</SelectItem>
                    <SelectItem value="sms_reminder">SMS Reminder</SelectItem>
                    <SelectItem value="email_reminder">Email Reminder</SelectItem>
                    <SelectItem value="whatsapp_message">WhatsApp Message</SelectItem>
                    <SelectItem value="appointment_reschedule">Reschedule Offer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Enter intervention message..."
                  className="h-24"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button>Create Intervention</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>{" "}
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Interventions</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={fetchInterventions} variant="outline">
              <Icons.refresh className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* Interventions List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Interventions</CardTitle>
          <CardDescription>Track the effectiveness of intervention strategies</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {interventions.map((intervention) => (
                <div
                  key={intervention.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <div>
                      <p className="font-medium">{intervention.patient.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {intervention.intervention_type.replace("_", " ")} •
                        {new Date(intervention.scheduled_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getStatusBadgeVariant(intervention.status)}>
                      {intervention.status}
                    </Badge>
                    {intervention.outcome && (
                      <Badge variant={getOutcomeBadgeVariant(intervention.outcome)}>
                        {intervention.outcome.replace("_", " ")}
                      </Badge>
                    )}
                    {intervention.effectiveness_score && (
                      <span className="text-sm font-medium">
                        {(intervention.effectiveness_score * 100).toFixed(0)}% effective
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {interventions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">No interventions found</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
