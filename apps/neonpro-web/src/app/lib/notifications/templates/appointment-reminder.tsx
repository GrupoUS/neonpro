/**
 * React Email Template - Appointment Reminder
 * HIPAA-compliant email template for appointment reminders
 */

import type {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";

interface AppointmentReminderEmailProps {
  patientName: string;
  appointmentDate: string;
  appointmentTime: string;
  treatmentType: string;
  doctorName: string;
  clinicName: string;
  clinicAddress: string;
  clinicPhone: string;
  cancellationLink?: string;
  rescheduleLink?: string;
  confirmationLink?: string;
  timezone: string;
}

export const AppointmentReminderEmail = ({
  patientName = "Patient",
  appointmentDate = "January 15, 2024",
  appointmentTime = "2:00 PM",
  treatmentType = "Consultation",
  doctorName = "Dr. Smith",
  clinicName = "NeonPro Aesthetic Clinic",
  clinicAddress = "123 Main Street, City, State 12345",
  clinicPhone = "(555) 123-4567",
  cancellationLink,
  rescheduleLink,
  confirmationLink,
  timezone = "UTC",
}: AppointmentReminderEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>
        Appointment reminder for {appointmentDate} at {appointmentTime}
      </Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Section className="mt-[32px]">
              <Img
                src="https://your-clinic-logo.com/logo.png"
                width="200"
                height="60"
                alt={clinicName}
                className="my-0 mx-auto"
              />
            </Section>

            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Appointment Reminder
            </Heading>

            <Text className="text-black text-[14px] leading-[24px]">Dear {patientName},</Text>

            <Text className="text-black text-[14px] leading-[24px]">
              This is a friendly reminder that you have an upcoming appointment scheduled:
            </Text>

            <Section className="bg-[#f6f6f6] rounded-[8px] p-[20px] my-[20px]">
              <Text className="text-black text-[16px] font-bold leading-[24px] m-0">
                Appointment Details
              </Text>
              <Hr className="border border-solid border-[#eaeaea] my-[16px] mx-0 w-full" />
              <Text className="text-black text-[14px] leading-[20px] m-0">
                <strong>Date:</strong> {appointmentDate}
              </Text>
              <Text className="text-black text-[14px] leading-[20px] m-0">
                <strong>Time:</strong> {appointmentTime} ({timezone})
              </Text>
              <Text className="text-black text-[14px] leading-[20px] m-0">
                <strong>Treatment:</strong> {treatmentType}
              </Text>
              <Text className="text-black text-[14px] leading-[20px] m-0">
                <strong>Provider:</strong> {doctorName}
              </Text>
              <Text className="text-black text-[14px] leading-[20px] m-0">
                <strong>Location:</strong> {clinicAddress}
              </Text>
            </Section>

            <Text className="text-black text-[14px] leading-[24px]">
              Please arrive 15 minutes early for check-in. If you need to cancel or reschedule,
              please do so at least 24 hours in advance.
            </Text>

            <Section className="text-center mt-[32px] mb-[32px]">
              {confirmationLink && (
                <Button
                  className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-[20px] py-[12px] mr-[8px]"
                  href={confirmationLink}
                >
                  Confirm Appointment
                </Button>
              )}

              {rescheduleLink && (
                <Button
                  className="bg-[#0070f3] rounded text-white text-[12px] font-semibold no-underline text-center px-[20px] py-[12px] mr-[8px]"
                  href={rescheduleLink}
                >
                  Reschedule
                </Button>
              )}

              {cancellationLink && (
                <Button
                  className="bg-[#dc2626] rounded text-white text-[12px] font-semibold no-underline text-center px-[20px] py-[12px]"
                  href={cancellationLink}
                >
                  Cancel
                </Button>
              )}
            </Section>

            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />

            <Text className="text-[#666666] text-[12px] leading-[24px]">
              {clinicName}
              <br />
              {clinicAddress}
              <br />
              Phone: {clinicPhone}
            </Text>

            <Text className="text-[#666666] text-[10px] leading-[16px] mt-[20px]">
              This email contains confidential health information protected by HIPAA. If you are not
              the intended recipient, please delete this email immediately.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
