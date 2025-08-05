'use client';
"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TimeSlotPicker;
var react_1 = require("react");
var framer_motion_1 = require("framer-motion");
var card_1 = require("@/components/ui/card");
var calendar_1 = require("@/components/ui/calendar");
var badge_1 = require("@/components/ui/badge");
var skeleton_1 = require("@/components/ui/skeleton");
var lucide_react_1 = require("lucide-react");
var use_translation_1 = require("@/app/lib/i18n/use-translation");
var real_time_availability_1 = require("@/components/dashboard/real-time-availability");
var booking_conflict_prevention_1 = require("@/components/dashboard/booking-conflict-prevention");
var use_availability_manager_1 = require("@/hooks/use-availability-manager");
var date_fns_1 = require("date-fns");
function TimeSlotPicker(_a) {
    var serviceId = _a.serviceId, professionalId = _a.professionalId, selectedTimeSlot = _a.selectedTimeSlot, onTimeSlotSelect = _a.onTimeSlotSelect, isLoading = _a.isLoading, patientId = _a.patientId;
    var t = (0, use_translation_1.useTranslation)().t;
    var _b = (0, react_1.useState)(new Date()), selectedDate = _b[0], setSelectedDate = _b[1];
    var _c = (0, react_1.useState)(null), selectedRealtimeSlot = _c[0], setSelectedRealtimeSlot = _c[1];
    // Real-time availability manager with filters
    var availabilityManager = (0, use_availability_manager_1.useAvailabilityManager)();
    // Update filters when props change
    (0, react_1.useEffect)(function () {
        availabilityManager.updateFilters({
            professionalId: professionalId,
            serviceId: serviceId,
            date: selectedDate,
            onlyAvailable: true
        });
    }, [professionalId, serviceId, selectedDate, availabilityManager]);
    // Convert realtime slot to legacy format for compatibility
    var convertRealtimeSlot = function (slot) {
        return {
            id: slot.id,
            professional_id: slot.professional_id,
            professional_name: 'Professional', // Will be populated from relations
            specialty: 'specialist',
            start_time: "".concat(slot.date, "T").concat(slot.start_time, "Z"),
            end_time: "".concat(slot.date, "T").concat(slot.end_time, "Z"),
            duration_minutes: 60 // Default duration
        };
    };
    // Handle slot selection from real-time component
    var handleRealtimeSlotSelect = function (slot) {
        setSelectedRealtimeSlot(slot);
        var legacySlot = convertRealtimeSlot(slot);
        onTimeSlotSelect(legacySlot);
    };
    // Format time for display
    var formatTime = function (time) {
        try {
            return (0, date_fns_1.format)(new Date("2000-01-01T".concat(time)), 'HH:mm');
        }
        catch (_a) {
            return time;
        }
    };
    if (isLoading) {
        return (<card_1.Card className="w-full">
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Clock className="h-5 w-5"/>
            {t('booking.steps.time.title')}
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Date picker skeleton */}
            <div className="space-y-4">
              <skeleton_1.Skeleton className="h-6 w-32"/>
              <skeleton_1.Skeleton className="h-64 w-full"/>
            </div>
            
            {/* Time slots skeleton */}
            <div className="space-y-4">
              <skeleton_1.Skeleton className="h-6 w-40"/>
              <div className="grid grid-cols-2 gap-2">
                {__spreadArray([], Array(8), true).map(function (_, i) { return (<skeleton_1.Skeleton key={i} className="h-12 w-full"/>); })}
              </div>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>);
    }
    return (<card_1.Card className="w-full">
      <card_1.CardHeader>
        <card_1.CardTitle className="flex items-center gap-2">
          <lucide_react_1.Clock className="h-5 w-5"/>
          {t('booking.steps.time.title')}
        </card_1.CardTitle>
      </card_1.CardHeader>
      
      <card_1.CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Date Selection */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <lucide_react_1.Calendar className="h-4 w-4"/>
              {t('booking.date.title')}
            </h3>
            
            <calendar_1.Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} disabled={function (date) { return date < new Date() || date.getDay() === 0; }} // Disable past dates and Sundays
     className="rounded-md border"/>
            
            {selectedDate && (<badge_1.Badge variant="outline" className="mt-2">
                {(0, date_fns_1.format)(selectedDate, 'EEEE, dd/MM/yyyy')}
              </badge_1.Badge>)}
          </div>

          {/* Real-time Availability Display */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">
              {t('booking.availability.title')}
            </h3>
            
            <real_time_availability_1.RealTimeAvailability professionalId={professionalId} serviceId={serviceId} selectedDate={selectedDate} onSlotSelect={handleRealtimeSlotSelect} className="h-fit"/>
          </div>
        </div>

        {/* Conflict Prevention */}
        {selectedRealtimeSlot && (<booking_conflict_prevention_1.BookingConflictPrevention selectedSlot={selectedRealtimeSlot} patientId={patientId} onConflictResolved={function () { return setSelectedRealtimeSlot(null); }}/>)}

        {/* Selected Slot Summary */}
        {selectedTimeSlot && (<framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <h4 className="font-medium text-primary mb-2">
              {t('booking.steps.time.selected_slot')}
            </h4>
            <div className="flex items-center gap-4 text-sm">
              <badge_1.Badge variant="default">
                {(0, date_fns_1.format)(new Date(selectedTimeSlot.start_time), 'dd/MM/yyyy')}
              </badge_1.Badge>
              <span>
                {(0, date_fns_1.format)(new Date(selectedTimeSlot.start_time), 'HH:mm')} às {(0, date_fns_1.format)(new Date(selectedTimeSlot.end_time), 'HH:mm')}
              </span>
            </div>
          </framer_motion_1.motion.div>)}

        {/* Availability Stats */}
        {!availabilityManager.isLoading && availabilityManager.availability.total > 0 && (<div className="flex items-center justify-between text-sm text-muted-foreground p-3 bg-muted rounded-lg">
            <span>Taxa de disponibilidade:</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {availabilityManager.availability.availabilityRate}%
              </span>
              <badge_1.Badge variant={availabilityManager.availability.availabilityRate > 50 ? 'default' : 'secondary'}>
                {availabilityManager.availability.available} disponíveis
              </badge_1.Badge>
            </div>
          </div>)}

        {/* No slots available message */}
        {!availabilityManager.isLoading &&
            availabilityManager.timeSlots.length === 0 &&
            selectedDate && (<div className="text-center py-8 text-muted-foreground">
            <lucide_react_1.AlertCircle className="h-8 w-8 mx-auto mb-2"/>
            <p className="text-sm">
              {t('booking.time.no_slots_available')}
            </p>
            <p className="text-xs mt-1">
              Tente selecionar outra data ou profissional
            </p>
          </div>)}
      </card_1.CardContent>
    </card_1.Card>);
}
