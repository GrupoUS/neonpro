/**
 * React Email Template - Appointment Reminder
 * HIPAA-compliant email template for appointment reminders
 */

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

type AppointmentReminderEmailProps = {
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
};

export const AppointmentReminderEmail = ({
  patientName = 'Patient',
  appointmentDate = 'January 15, 2024',
  appointmentTime = '2:00 PM',
  treatmentType = 'Consultation',
  doctorName = 'Dr. Smith',
  clinicName = 'NeonPro Aesthetic Clinic',
  clinicAddress = '123 Main Street, City, State 12345',
  clinicPhone = '(555) 123-4567',
  cancellationLink,
  rescheduleLink,
  confirmationLink,
  timezone = 'UTC',
}: AppointmentReminderEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>
        Appointment reminder for {appointmentDate} at {appointmentTime}
      </Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white font-sans">
          <Container className="mx-auto my-[40px] w-[465px] rounded border border-[#eaeaea] border-solid p-[20px]">
            <Section className="mt-[32px]">
              <Img
                alt={clinicName}
                className="mx-auto my-0"
                height="60"
                src="https://your-clinic-logo.com/logo.png"
                width="200"
              />
            </Section>

            <Heading className="mx-0 my-[30px] p-0 text-center font-normal text-[24px] text-black">
              Appointment Reminder
            </Heading>

            <Text className="text-[14px] text-black leading-[24px]">
              Dear {patientName},
            </Text>

            <Text className="text-[14px] text-black leading-[24px]">
              This is a friendly reminder that you have an upcoming appointment
              scheduled:
            </Text>

            <Section className="my-[20px] rounded-[8px] bg-[#f6f6f6] p-[20px]">
              <Text className="m-0 font-bold text-[16px] text-black leading-[24px]">
                Appointment Details
              </Text>
              <Hr className="mx-0 my-[16px] w-full border border-[#eaeaea] border-solid" />
              <Text className="m-0 text-[14px] text-black leading-[20px]">
                <strong>Date:</strong> {appointmentDate}
              </Text>
              <Text className="m-0 text-[14px] text-black leading-[20px]">
                <strong>Time:</strong> {appointmentTime} ({timezone})
              </Text>
              <Text className="m-0 text-[14px] text-black leading-[20px]">
                <strong>Treatment:</strong> {treatmentType}
              </Text>
              <Text className="m-0 text-[14px] text-black leading-[20px]">
                <strong>Provider:</strong> {doctorName}
              </Text>
              <Text className="m-0 text-[14px] text-black leading-[20px]">
                <strong>Location:</strong> {clinicAddress}
              </Text>
            </Section>

            <Text className="text-[14px] text-black leading-[24px]">
              Please arrive 15 minutes early for check-in. If you need to cancel
              or reschedule, please do so at least 24 hours in advance.
            </Text>

            <Section className="mt-[32px] mb-[32px] text-center">
              {confirmationLink && (
                <Button
                  className="mr-[8px] rounded bg-[#000000] px-[20px] py-[12px] text-center font-semibold text-[12px] text-white no-underline"
                  href={confirmationLink}
                >
                  Confirm Appointment
                </Button>
              )}

              {rescheduleLink && (
                <Button
                  className="mr-[8px] rounded bg-[#0070f3] px-[20px] py-[12px] text-center font-semibold text-[12px] text-white no-underline"
                  href={rescheduleLink}
                >
                  Reschedule
                </Button>
              )}

              {cancellationLink && (
                <Button
                  className="rounded bg-[#dc2626] px-[20px] py-[12px] text-center font-semibold text-[12px] text-white no-underline"
                  href={cancellationLink}
                >
                  Cancel
                </Button>
              )}
            </Section>

            <Hr className="mx-0 my-[26px] w-full border border-[#eaeaea] border-solid" />

            <Text className="text-[#666666] text-[12px] leading-[24px]">
              {clinicName}
              <br />
              {clinicAddress}
              <br />
              Phone: {clinicPhone}
            </Text>

            <Text className="mt-[20px] text-[#666666] text-[10px] leading-[16px]">
              This email contains confidential health information protected by
              HIPAA. If you are not the intended recipient, please delete this
              email immediately.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
