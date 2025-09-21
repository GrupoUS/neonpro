/**
 * Tests for Appointment Model (T033)
 * Following TDD methodology - MUST FAIL FIRST
 */

import { describe, expect, it } from "vitest";

describe("Appointment Model (T033)", () => {
  it(_"should export Appointment type",_() => {
    expect(_() => {
      const module = require("../appointment");
      expect(module.createAppointment).toBeDefined();
    }).not.toThrow();
  });

  it(_"should have required appointment fields",_() => {
    const { Appointment } = require("../appointment");
    const appointment: Appointment = {
      id: "appointment-123",
      patientId: "patient-123",
      providerId: "doctor-123",
      title: "Consulta de rotina",
      description: "Consulta médica de rotina",
      startTime: new Date("2024-01-15T10:00:00"),
      endTime: new Date("2024-01-15T11:00:00"),
      status: "scheduled",
      type: "consultation",
      location: "Consultório 1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(appointment.id).toBe("appointment-123");
    expect(appointment.patientId).toBe("patient-123");
    expect(appointment.status).toBe("scheduled");
  });

  it(_"should support appointment status enum",_() => {
    const { AppointmentStatus } = require("../appointment");
    expect(AppointmentStatus.SCHEDULED).toBe("scheduled");
    expect(AppointmentStatus.CONFIRMED).toBe("confirmed");
    expect(AppointmentStatus.IN_PROGRESS).toBe("in_progress");
    expect(AppointmentStatus.COMPLETED).toBe("completed");
    expect(AppointmentStatus.CANCELLED).toBe("cancelled");
    expect(AppointmentStatus.NO_SHOW).toBe("no_show");
  });

  it(_"should support appointment types",_() => {
    const { AppointmentType } = require("../appointment");
    expect(AppointmentType.CONSULTATION).toBe("consultation");
    expect(AppointmentType.FOLLOW_UP).toBe("follow_up");
    expect(AppointmentType.PROCEDURE).toBe("procedure");
    expect(AppointmentType.EMERGENCY).toBe("emergency");
  });

  it(_"should have reminder settings",_() => {
    const { ReminderSettings } = require("../appointment");
    const reminder: ReminderSettings = {
      enabled: true,
      methods: ["email", "sms", "whatsapp"],
      timeBefore: [24, 2], // hours before appointment
      customMessage: "Lembre-se da sua consulta amanhã!",
    };

    expect(reminder.enabled).toBe(true);
    expect(reminder.methods).toContain("whatsapp");
  });

  it(_"should validate appointment times",_() => {
    const { validateAppointmentTimes } = require("../appointment");

    const validTimes = {
      startTime: new Date("2024-01-15T10:00:00"),
      endTime: new Date("2024-01-15T11:00:00"),
    };

    const invalidTimes = {
      startTime: new Date("2024-01-15T11:00:00"),
      endTime: new Date("2024-01-15T10:00:00"), // end before start
    };

    expect(
      validateAppointmentTimes(validTimes.startTime, validTimes.endTime),
    ).toBe(true);
    expect(
      validateAppointmentTimes(invalidTimes.startTime, invalidTimes.endTime),
    ).toBe(false);
  });

  it(_"should check for appointment conflicts",_() => {
    const { checkAppointmentConflict } = require("../appointment");

    const existingAppointment = {
      startTime: new Date("2024-01-15T10:00:00"),
      endTime: new Date("2024-01-15T11:00:00"),
    };

    const conflictingAppointment = {
      startTime: new Date("2024-01-15T10:30:00"),
      endTime: new Date("2024-01-15T11:30:00"),
    };

    const nonConflictingAppointment = {
      startTime: new Date("2024-01-15T11:00:00"),
      endTime: new Date("2024-01-15T12:00:00"),
    };

    expect(
      checkAppointmentConflict(existingAppointment, conflictingAppointment),
    ).toBe(true);
    expect(
      checkAppointmentConflict(existingAppointment, nonConflictingAppointment),
    ).toBe(false);
  });

  it(_"should calculate appointment duration",_() => {
    const { calculateAppointmentDuration } = require("../appointment");

    const startTime = new Date("2024-01-15T10:00:00");
    const endTime = new Date("2024-01-15T11:30:00");

    const duration = calculateAppointmentDuration(startTime, endTime);
    expect(duration).toBe(90); // minutes
  });

  it(_"should format appointment for display",_() => {
    const { formatAppointmentForDisplay } = require("../appointment");

    const appointment = {
      title: "Consulta de rotina",
      startTime: new Date("2024-01-15T10:00:00"),
      endTime: new Date("2024-01-15T11:00:00"),
      location: "Consultório 1",
      patientName: "João Silva",
    };

    const formatted = formatAppointmentForDisplay(appointment);
    expect(formatted).toContain("Consulta de rotina");
    expect(formatted).toContain("João Silva");
    expect(formatted).toContain("Consultório 1");
  });

  it(_"should support Brazilian business hours validation",_() => {
    const { isWithinBusinessHours } = require("../appointment");

    const businessHours = new Date("2024-01-15T14:00:00"); // 2 PM
    const afterHours = new Date("2024-01-15T20:00:00"); // 8 PM
    const weekend = new Date("2024-01-13T14:00:00"); // Saturday

    expect(isWithinBusinessHours(businessHours)).toBe(true);
    expect(isWithinBusinessHours(afterHours)).toBe(false);
    expect(isWithinBusinessHours(weekend)).toBe(false);
  });

  it(_"should handle appointment cancellation",_() => {
    const { cancelAppointment } = require("../appointment");

    const appointment = {
      id: "appointment-123",
      status: "scheduled",
      cancellationReason: null,
      cancelledAt: null,
    };

    const cancelled = cancelAppointment(
      appointment,
      "Paciente solicitou cancelamento",
    );
    expect(cancelled.status).toBe("cancelled");
    expect(cancelled.cancellationReason).toBe(
      "Paciente solicitou cancelamento",
    );
    expect(cancelled.cancelledAt).toBeInstanceOf(Date);
  });

  it(_"should support no-show tracking",_() => {
    const { markAsNoShow } = require("../appointment");

    const appointment = {
      id: "appointment-123",
      status: "confirmed",
      noShowAt: null,
    };

    const noShow = markAsNoShow(appointment);
    expect(noShow.status).toBe("no_show");
    expect(noShow.noShowAt).toBeInstanceOf(Date);
  });

  it(_"should calculate appointment cost",_() => {
    const { calculateAppointmentCost } = require("../appointment");

    const appointment = {
      type: "consultation",
      duration: 60,
      providerId: "doctor-123",
    };

    const priceTable = {
      consultation: 150.0,
      procedure: 300.0,
    };

    const cost = calculateAppointmentCost(appointment, priceTable);
    expect(cost).toBe(150.0);
  });

  it(_"should support LGPD compliance for appointments",_() => {
    const { anonymizeAppointment } = require("../appointment");

    const appointment = {
      id: "appointment-123",
      title: "Consulta específica",
      description: "Detalhes do paciente",
      notes: "Informações sensíveis",
    };

    const anonymized = anonymizeAppointment(appointment);
    expect(anonymized.title).toMatch(/^CONSULTA ANONIMIZADA/);
    expect(anonymized.description).toMatch(/^DESCRIÇÃO ANONIMIZADA/);
  });
});
