/**
 * Tests for Contact Information Model (T033)
 * Following TDD methodology - MUST FAIL FIRST
 */

import { describe, expect, it } from "vitest";

describe("Contact Information Model (T033)", () => {
  it(_"should export Contact type",_() => {
    expect(_() => {
      const module = require("../contact");
      expect(module.createContact).toBeDefined();
    }).not.toThrow();
  });

  it(_"should have required contact fields",_() => {
    const { Contact } = require("../contact");
    const contact: Contact = {
      id: "contact-123",
      patientId: "patient-123",
      type: "primary",
      name: "João Silva",
      relationship: "self",
      phone: "(11) 99999-9999",
      email: "joao@example.com",
      address: {
        street: "Rua das Flores, 123",
        neighborhood: "Centro",
        city: "São Paulo",
        state: "SP",
        cep: "01234-567",
        country: "Brasil",
      },
      isPrimary: true,
      isEmergency: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(contact.id).toBe("contact-123");
    expect(contact.name).toBe("João Silva");
    expect(contact.phone).toBe("(11) 99999-9999");
  });

  it(_"should support contact types",_() => {
    const { ContactType } = require("../contact");
    expect(ContactType.PRIMARY).toBe("primary");
    expect(ContactType.EMERGENCY).toBe("emergency");
    expect(ContactType.FAMILY).toBe("family");
    expect(ContactType.WORK).toBe("work");
    expect(ContactType.OTHER).toBe("other");
  });

  it(_"should support relationship types",_() => {
    const { RelationshipType } = require("../contact");
    expect(RelationshipType.SELF).toBe("self");
    expect(RelationshipType.SPOUSE).toBe("spouse");
    expect(RelationshipType.PARENT).toBe("parent");
    expect(RelationshipType.CHILD).toBe("child");
    expect(RelationshipType.SIBLING).toBe("sibling");
    expect(RelationshipType.FRIEND).toBe("friend");
    expect(RelationshipType.OTHER).toBe("other");
  });

  it(_"should validate Brazilian phone numbers",_() => {
    const { validateBrazilianPhone } = require("../contact");
    expect(validateBrazilianPhone("(11) 99999-9999")).toBe(true);
    expect(validateBrazilianPhone("11999999999")).toBe(true);
    expect(validateBrazilianPhone("invalid")).toBe(false);
  });

  it(_"should validate email addresses",_() => {
    const { validateEmail } = require("../contact");
    expect(validateEmail("joao@example.com")).toBe(true);
    expect(validateEmail("invalid-email")).toBe(false);
    expect(validateEmail("")).toBe(false);
  });

  it(_"should validate Brazilian CEP",_() => {
    const { validateCEP } = require("../contact");
    expect(validateCEP("01234-567")).toBe(true);
    expect(validateCEP("01234567")).toBe(true);
    expect(validateCEP("invalid")).toBe(false);
  });

  it(_"should format contact for display",_() => {
    const { formatContactForDisplay } = require("../contact");

    const contact = {
      name: "João Silva",
      phone: "(11) 99999-9999",
      email: "joao@example.com",
      relationship: "spouse",
    };

    const formatted = formatContactForDisplay(contact);
    expect(formatted).toContain("João Silva");
    expect(formatted).toContain("(11) 99999-9999");
    expect(formatted).toContain("spouse");
  });

  it(_"should support contact preferences",_() => {
    const { ContactPreferences } = require("../contact");
    const preferences: ContactPreferences = {
      preferredMethod: "whatsapp",
      allowSMS: true,
      allowEmail: true,
      allowWhatsApp: true,
      allowCalls: false,
      bestTimeToContact: "09:00-17:00",
      timezone: "America/Sao_Paulo",
    };

    expect(preferences.preferredMethod).toBe("whatsapp");
    expect(preferences.allowWhatsApp).toBe(true);
  });

  it(_"should handle emergency contact priority",_() => {
    const { setEmergencyPriority } = require("../contact");

    const contact = {
      id: "contact-123",
      isEmergency: false,
      emergencyPriority: 0,
    };

    const updated = setEmergencyPriority(contact, 1);
    expect(updated.isEmergency).toBe(true);
    expect(updated.emergencyPriority).toBe(1);
  });

  it(_"should support LGPD compliance for contacts",_() => {
    const { anonymizeContact } = require("../contact");

    const contact = {
      name: "João Silva",
      phone: "(11) 99999-9999",
      email: "joao@example.com",
      address: {
        street: "Rua das Flores, 123",
        city: "São Paulo",
      },
    };

    const anonymized = anonymizeContact(contact);
    expect(anonymized.name).toMatch(/^CONTATO ANONIMIZADO/);
    expect(anonymized.phone).toBe("(**) *****-****");
    expect(anonymized.email).toMatch(/^anon_.*@anonymized\.com$/);
  });

  it(_"should validate contact completeness",_() => {
    const { validateContactCompleteness } = require("../contact");

    const completeContact = {
      name: "João Silva",
      phone: "(11) 99999-9999",
      email: "joao@example.com",
      relationship: "self",
    };

    const incompleteContact = {
      name: "João Silva",
      // missing phone and email
    };

    expect(validateContactCompleteness(completeContact)).toBe(true);
    expect(validateContactCompleteness(incompleteContact)).toBe(false);
  });

  it(_"should support contact notes and tags",_() => {
    const { Contact } = require("../contact");
    const contact: Contact = {
      id: "contact-123",
      patientId: "patient-123",
      type: "family",
      name: "Maria Silva",
      relationship: "mother",
      phone: "(11) 88888-8888",
      email: "maria@example.com",
      notes: "Contato preferencial para emergências",
      tags: ["emergência", "família", "responsável"],
      isPrimary: false,
      isEmergency: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(contact.notes).toContain("emergências");
    expect(contact.tags).toContain("família");
    expect(contact.isEmergency).toBe(true);
  });
});
