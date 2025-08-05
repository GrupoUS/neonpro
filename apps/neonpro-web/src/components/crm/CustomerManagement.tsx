/**
 * Customer Management Component
 * Comprehensive customer profile and relationship management
 * Created: January 24, 2025
 */

"use client";

import type {
  AlertTriangle,
  Calendar,
  Clock,
  DollarSign,
  Heart,
  Mail,
  MessageSquare,
  Phone,
  Star,
  TrendingUp,
  User,
} from "lucide-react";
import type { useMemo, useState } from "react";
import type { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import type { Progress } from "@/components/ui/progress";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  Appointment,
  Customer,
  calculateCustomerLifetimeValue,
  calculateDaysSinceLastVisit,
  calculateLeadScore,
  determineCustomerLifecycle,
  determineNextFollowUpDate,
  generateFollowUpMessage,
  LeadScore,
  predictChurnRisk,
} from "./utils";

interface CustomerManagementProps {
  customers?: Customer[];
  appointments?: Appointment[];
  onCustomerSelect?: (customer: Customer) => void;
  onFollowUpSchedule?: (customerId: string, date: string, message: string) => void;
  className?: string;
}

export function CustomerManagement({
  customers = [],
  appointments = [],
  onCustomerSelect,
  onFollowUpSchedule,
  className = "",
}: CustomerManagementProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterLifecycle, setFilterLifecycle] = useState<string>("all");

  // Filter and search customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const matchesSearch =
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm);

      const matchesStatus = filterStatus === "all" || customer.status === filterStatus;

      const lifecycle = determineCustomerLifecycle(customer);
      const matchesLifecycle = filterLifecycle === "all" || lifecycle === filterLifecycle;

      return matchesSearch && matchesStatus && matchesLifecycle;
    });
  }, [customers, searchTerm, filterStatus, filterLifecycle]);

  // Calculate customer analytics
  const customerAnalytics = useMemo(() => {
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter((c) => c.status === "active").length;
    const averageLifetimeValue =
      customers.reduce((sum, c) => sum + c.totalSpent, 0) / totalCustomers;
    const averageSatisfaction =
      customers
        .filter((c) => c.satisfactionRating)
        .reduce((sum, c) => sum + (c.satisfactionRating || 0), 0) /
      customers.filter((c) => c.satisfactionRating).length;

    return {
      totalCustomers,
      activeCustomers,
      averageLifetimeValue: averageLifetimeValue || 0,
      averageSatisfaction: averageSatisfaction || 0,
      retentionRate: totalCustomers > 0 ? (activeCustomers / totalCustomers) * 100 : 0,
    };
  }, [customers]);

  // Get customer appointments
  const getCustomerAppointments = (customerId: string) => {
    return appointments.filter((apt) => apt.customerId === customerId);
  };

  // Handle customer selection
  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    onCustomerSelect?.(customer);
  };

  // Handle follow-up scheduling
  const handleScheduleFollowUp = (customer: Customer, context: string) => {
    const lifecycle = determineCustomerLifecycle(customer);
    const lastContactDate = customer.lastVisitDate || customer.registrationDate;
    const followUpDate = determineNextFollowUpDate(lastContactDate, lifecycle);
    const message = generateFollowUpMessage(customer, context);

    onFollowUpSchedule?.(customer.id, followUpDate, message);
  };

  // Render customer card
  const renderCustomerCard = (customer: Customer) => {
    const customerAppointments = getCustomerAppointments(customer.id);
    const leadScore = calculateLeadScore(customer, customerAppointments);
    const lifecycle = determineCustomerLifecycle(customer);
    const churnRisk = predictChurnRisk(customer);
    const lifetimeValue = calculateCustomerLifetimeValue(customerAppointments);

    const daysSinceLastVisit = customer.lastVisitDate
      ? calculateDaysSinceLastVisit(customer.lastVisitDate)
      : null;

    const getLifecycleColor = (lifecycle: string) => {
      switch (lifecycle) {
        case "new":
          return "bg-blue-100 text-blue-800";
        case "active":
          return "bg-green-100 text-green-800";
        case "at-risk":
          return "bg-yellow-100 text-yellow-800";
        case "churned":
          return "bg-red-100 text-red-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };

    const getPriorityColor = (priority: string) => {
      switch (priority) {
        case "high":
          return "bg-red-100 text-red-800";
        case "medium":
          return "bg-yellow-100 text-yellow-800";
        case "low":
          return "bg-green-100 text-green-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };

    return (
      <Card
        key={customer.id}
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => handleCustomerSelect(customer)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback>
                  {customer.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{customer.name}</CardTitle>
                <CardDescription className="flex items-center space-x-2">
                  <Mail className="h-3 w-3" />
                  <span>{customer.email}</span>
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-1">
              <Badge className={getLifecycleColor(lifecycle)}>
                {lifecycle.charAt(0).toUpperCase() + lifecycle.slice(1)}
              </Badge>
              <Badge className={getPriorityColor(leadScore.priority)}>
                Score: {leadScore.score}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span>LTV: ${lifetimeValue.toFixed(2)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span>{customer.appointmentCount} visits</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-purple-600" />
              <span>{customer.phone}</span>
            </div>
            <div className="flex items-center space-x-2">
              {churnRisk > 60 ? (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              ) : (
                <Heart className="h-4 w-4 text-pink-600" />
              )}
              <span>{churnRisk.toFixed(0)}% risk</span>
            </div>
          </div>

          {daysSinceLastVisit !== null && (
            <div className="mt-3 text-xs text-gray-500">
              Last visit: {daysSinceLastVisit} days ago
            </div>
          )}

          {customer.satisfactionRating && (
            <div className="mt-2 flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-3 w-3 ${
                    star <= customer.satisfactionRating!
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
              <span className="text-xs text-gray-500 ml-1">({customer.satisfactionRating}/5)</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Render customer details
  const renderCustomerDetails = (customer: Customer) => {
    const customerAppointments = getCustomerAppointments(customer.id);
    const leadScore = calculateLeadScore(customer, customerAppointments);
    const lifecycle = determineCustomerLifecycle(customer);
    const churnRisk = predictChurnRisk(customer);
    const lifetimeValue = calculateCustomerLifetimeValue(customerAppointments);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">{customer.name}</h3>
            <p className="text-gray-600">{customer.email}</p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleScheduleFollowUp(customer, "appointment")}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Schedule Follow-up
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleScheduleFollowUp(customer, "satisfaction")}
            >
              <Star className="h-4 w-4 mr-2" />
              Request Feedback
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Lead Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leadScore.score}/100</div>
              <Progress value={leadScore.score} className="mt-2" />
              <Badge className="mt-2">{leadScore.priority} priority</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Lifetime Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${lifetimeValue.toFixed(2)}</div>
              <p className="text-xs text-gray-500">{customer.appointmentCount} appointments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Lifecycle Stage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold capitalize">{lifecycle}</div>
              <p className="text-xs text-gray-500">
                {customer.lastVisitDate
                  ? `Last visit: ${calculateDaysSinceLastVisit(customer.lastVisitDate)} days ago`
                  : "No visits yet"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Churn Risk</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{churnRisk.toFixed(0)}%</div>
              <Progress
                value={churnRisk}
                className="mt-2"
                // @ts-ignore
                style={{
                  "--progress-background":
                    churnRisk > 60 ? "#ef4444" : churnRisk > 30 ? "#f59e0b" : "#10b981",
                }}
              />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="scoring">Lead Scoring</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Phone</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{customer.phone}</span>
                    </div>
                  </div>
                  <div>
                    <Label>Preferred Communication</Label>
                    <div className="mt-1 capitalize">{customer.communicationPreference}</div>
                  </div>
                  <div>
                    <Label>Registration Date</Label>
                    <div className="mt-1">
                      {new Date(customer.registrationDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <Label>Lead Source</Label>
                    <div className="mt-1">{customer.leadSource}</div>
                  </div>
                </div>
                {customer.tags.length > 0 && (
                  <div>
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {customer.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {customer.notes && (
                  <div>
                    <Label>Notes</Label>
                    <div className="mt-1 p-3 bg-gray-50 rounded text-sm">{customer.notes}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scoring" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Lead Score Breakdown</CardTitle>
                <CardDescription>
                  Score factors contributing to overall lead quality
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Engagement ({leadScore.factors.engagement}/25)</span>
                      <span>{((leadScore.factors.engagement / 25) * 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={(leadScore.factors.engagement / 25) * 100} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Value ({leadScore.factors.value}/25)</span>
                      <span>{((leadScore.factors.value / 25) * 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={(leadScore.factors.value / 25) * 100} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Frequency ({leadScore.factors.frequency}/25)</span>
                      <span>{((leadScore.factors.frequency / 25) * 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={(leadScore.factors.frequency / 25) * 100} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Recency ({leadScore.factors.recency}/25)</span>
                      <span>{((leadScore.factors.recency / 25) * 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={(leadScore.factors.recency / 25) * 100} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Appointment History</CardTitle>
                <CardDescription>{customerAppointments.length} total appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {customerAppointments.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No appointments found</p>
                  ) : (
                    customerAppointments.slice(0, 5).map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-3 border rounded"
                      >
                        <div>
                          <div className="font-medium">{appointment.service}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(appointment.date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${appointment.cost.toFixed(2)}</div>
                          <Badge
                            variant={
                              appointment.status === "completed"
                                ? "default"
                                : appointment.status === "cancelled"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {appointment.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerAnalytics.totalCustomers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Active Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerAnalytics.activeCustomers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Avg Lifetime Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${customerAnalytics.averageLifetimeValue.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Retention Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerAnalytics.retentionRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Avg Satisfaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customerAnalytics.averageSatisfaction.toFixed(1)}/5
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Customers</Label>
              <Input
                id="search"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="churned">Churned</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Label>Lifecycle</Label>
              <Select value={filterLifecycle} onValueChange={setFilterLifecycle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="at-risk">At Risk</SelectItem>
                  <SelectItem value="churned">Churned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Details or Customer List */}
      {selectedCustomer ? (
        <div>
          <Button variant="outline" onClick={() => setSelectedCustomer(null)} className="mb-4">
            ← Back to Customer List
          </Button>
          {renderCustomerDetails(selectedCustomer)}
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Customers ({filteredCustomers.length})</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.map(renderCustomerCard)}
          </div>
          {filteredCustomers.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No customers found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
