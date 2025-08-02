"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Eye,
  Star,
  MessageCircle,
  CalendarHeart,
  HeartHandshake,
  PlusCircle,
  Users,
  Activity,
  TrendingUp,
  DollarSign,
  Home,
  Settings,
  FileText,
  BarChart3,
  UserPlus,
  Menu,
  X
} from "lucide-react";
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  isEqual,
  isSameDay,
  isSameMonth,
  isToday,
  parse,
  startOfToday,
  startOfWeek,
} from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Types and Interfaces
interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  age: number;
  gender: string;
  lastVisit?: Date;
  totalVisits: number;
}

interface Treatment {
  id: string;
  name: string;
  duration: number;
  price: number;
  category: string;
}

interface Appointment {
  id: string;
  patientId: string;
  patient: Patient;
  treatmentId: string;
  treatment: Treatment;
  date: Date;
  time: string;
  duration: number;
  status: "scheduled" | "confirmed" | "in-progress" | "completed" | "cancelled" | "no-show";
  notes?: string;
  practitioner: string;
  room?: string;
  price: number;
}

interface AppointmentStats {
  total: number;
  scheduled: number;
  completed: number;
  cancelled: number;
  revenue: number;
  averageRating: number;
}

// Default Data
const defaultPatients: Patient[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.j@email.com", 
    phone: "+1 (555) 123-4567",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786",
    age: 32,
    gender: "Female",
    lastVisit: new Date("2024-01-10"),
    totalVisits: 8
  },
  {
    id: "2", 
    name: "Michael Chen",
    email: "m.chen@email.com",
    phone: "+1 (555) 234-5678",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
    age: 28,
    gender: "Male", 
    lastVisit: new Date("2024-01-08"),
    totalVisits: 5
  },
  {
    id: "3",
    name: "Emma Rodriguez", 
    email: "emma.r@email.com",
    phone: "+1 (555) 345-6789",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
    age: 35,
    gender: "Female",
    lastVisit: new Date("2024-01-05"),
    totalVisits: 12
  }
];

const defaultTreatments: Treatment[] = [
  {
    id: "1",
    name: "Botox Injection",
    duration: 30, 
    price: 350,
    category: "Injectable"
  },
  {
    id: "2",
    name: "Dermal Filler",
    duration: 45,
    price: 650,
    category: "Injectable" 
  },
  {
    id: "3",
    name: "Chemical Peel",
    duration: 60,
    price: 200,
    category: "Facial"
  },
  {
    id: "4", 
    name: "Laser Hair Removal",
    duration: 30,
    price: 150,
    category: "Laser"
  },
  {
    id: "5",
    name: "Microneedling", 
    duration: 45,
    price: 300,
    category: "Facial"
  }
];

const defaultAppointments: Appointment[] = [
  {
    id: "1",
    patientId: "1",
    patient: defaultPatients[0],
    treatmentId: "1", 
    treatment: defaultTreatments[0],
    date: new Date("2025-01-15"),
    time: "10:00 AM",
    duration: 30,
    status: "scheduled",
    notes: "First time patient, consultation needed",
    practitioner: "Dr. Smith",
    room: "Room 1",
    price: 350
  },
  {
    id: "2",
    patientId: "2",
    patient: defaultPatients[1],
    treatmentId: "2",
    treatment: defaultTreatments[1], 
    date: new Date("2025-01-15"),
    time: "2:00 PM",
    duration: 45,
    status: "confirmed",
    notes: "Follow-up treatment",
    practitioner: "Dr. Johnson",
    room: "Room 2", 
    price: 650
  },
  {
    id: "3",
    patientId: "3",
    patient: defaultPatients[2],
    treatmentId: "3",
    treatment: defaultTreatments[2],
    date: new Date("2025-01-16"),
    time: "11:30 AM", 
    duration: 60,
    status: "completed",
    notes: "Regular maintenance treatment",
    practitioner: "Dr. Smith",
    room: "Room 1",
    price: 200
  },
  {
    id: "4",
    patientId: "1",
    patient: defaultPatients[0],
    treatmentId: "4",
    treatment: defaultTreatments[3],
    date: new Date("2025-01-17"),
    time: "9:00 AM",
    duration: 30,
    status: "scheduled", 
    notes: "Package treatment - session 3 of 6",
    practitioner: "Dr. Johnson",
    room: "Room 3",
    price: 150
  }
];

// Utility Functions
const getStatusColor = (status: Appointment["status"]) => {
  switch (status) {
    case "scheduled":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "confirmed":
      return "bg-green-100 text-green-800 border-green-200";
    case "in-progress":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "completed":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    case "no-show":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusIcon = (status: Appointment["status"]) => {
  switch (status) {
    case "scheduled":
      return <Clock className="w-3 h-3" />;
    case "confirmed":
      return <CheckCircle className="w-3 h-3" />;
    case "in-progress":
      return <Activity className="w-3 h-3" />;
    case "completed":
      return <CheckCircle className="w-3 h-3" />;
    case "cancelled":
      return <XCircle className="w-3 h-3" />;
    case "no-show":
      return <AlertCircle className="w-3 h-3" />;
    default:
      return <Clock className="w-3 h-3" />;
  }
};