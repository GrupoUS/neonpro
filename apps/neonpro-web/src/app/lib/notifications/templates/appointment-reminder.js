/**
 * React Email Template - Appointment Reminder
 * HIPAA-compliant email template for appointment reminders
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentReminderEmail = void 0;
var components_1 = require("@react-email/components");
var AppointmentReminderEmail = (_a) => {
  var _b = _a.patientName,
    patientName = _b === void 0 ? "Patient" : _b,
    _c = _a.appointmentDate,
    appointmentDate = _c === void 0 ? "January 15, 2024" : _c,
    _d = _a.appointmentTime,
    appointmentTime = _d === void 0 ? "2:00 PM" : _d,
    _e = _a.treatmentType,
    treatmentType = _e === void 0 ? "Consultation" : _e,
    _f = _a.doctorName,
    doctorName = _f === void 0 ? "Dr. Smith" : _f,
    _g = _a.clinicName,
    clinicName = _g === void 0 ? "NeonPro Aesthetic Clinic" : _g,
    _h = _a.clinicAddress,
    clinicAddress = _h === void 0 ? "123 Main Street, City, State 12345" : _h,
    _j = _a.clinicPhone,
    clinicPhone = _j === void 0 ? "(555) 123-4567" : _j,
    cancellationLink = _a.cancellationLink,
    rescheduleLink = _a.rescheduleLink,
    confirmationLink = _a.confirmationLink,
    _k = _a.timezone,
    timezone = _k === void 0 ? "UTC" : _k;
  return (
    <components_1.Html>
      <components_1.Head />
      <components_1.Preview>
        Appointment reminder for {appointmentDate} at {appointmentTime}
      </components_1.Preview>
      <components_1.Tailwind>
        <components_1.Body className="bg-white my-auto mx-auto font-sans">
          <components_1.Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <components_1.Section className="mt-[32px]">
              <components_1.Img
                src="https://your-clinic-logo.com/logo.png"
                width="200"
                height="60"
                alt={clinicName}
                className="my-0 mx-auto"
              />
            </components_1.Section>

            <components_1.Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Appointment Reminder
            </components_1.Heading>

            <components_1.Text className="text-black text-[14px] leading-[24px]">
              Dear {patientName},
            </components_1.Text>

            <components_1.Text className="text-black text-[14px] leading-[24px]">
              This is a friendly reminder that you have an upcoming appointment scheduled:
            </components_1.Text>

            <components_1.Section className="bg-[#f6f6f6] rounded-[8px] p-[20px] my-[20px]">
              <components_1.Text className="text-black text-[16px] font-bold leading-[24px] m-0">
                Appointment Details
              </components_1.Text>
              <components_1.Hr className="border border-solid border-[#eaeaea] my-[16px] mx-0 w-full" />
              <components_1.Text className="text-black text-[14px] leading-[20px] m-0">
                <strong>Date:</strong> {appointmentDate}
              </components_1.Text>
              <components_1.Text className="text-black text-[14px] leading-[20px] m-0">
                <strong>Time:</strong> {appointmentTime} ({timezone})
              </components_1.Text>
              <components_1.Text className="text-black text-[14px] leading-[20px] m-0">
                <strong>Treatment:</strong> {treatmentType}
              </components_1.Text>
              <components_1.Text className="text-black text-[14px] leading-[20px] m-0">
                <strong>Provider:</strong> {doctorName}
              </components_1.Text>
              <components_1.Text className="text-black text-[14px] leading-[20px] m-0">
                <strong>Location:</strong> {clinicAddress}
              </components_1.Text>
            </components_1.Section>

            <components_1.Text className="text-black text-[14px] leading-[24px]">
              Please arrive 15 minutes early for check-in. If you need to cancel or reschedule,
              please do so at least 24 hours in advance.
            </components_1.Text>

            <components_1.Section className="text-center mt-[32px] mb-[32px]">
              {confirmationLink && (
                <components_1.Button
                  className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-[20px] py-[12px] mr-[8px]"
                  href={confirmationLink}
                >
                  Confirm Appointment
                </components_1.Button>
              )}

              {rescheduleLink && (
                <components_1.Button
                  className="bg-[#0070f3] rounded text-white text-[12px] font-semibold no-underline text-center px-[20px] py-[12px] mr-[8px]"
                  href={rescheduleLink}
                >
                  Reschedule
                </components_1.Button>
              )}

              {cancellationLink && (
                <components_1.Button
                  className="bg-[#dc2626] rounded text-white text-[12px] font-semibold no-underline text-center px-[20px] py-[12px]"
                  href={cancellationLink}
                >
                  Cancel
                </components_1.Button>
              )}
            </components_1.Section>

            <components_1.Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />

            <components_1.Text className="text-[#666666] text-[12px] leading-[24px]">
              {clinicName}
              <br />
              {clinicAddress}
              <br />
              Phone: {clinicPhone}
            </components_1.Text>

            <components_1.Text className="text-[#666666] text-[10px] leading-[16px] mt-[20px]">
              This email contains confidential health information protected by HIPAA. If you are not
              the intended recipient, please delete this email immediately.
            </components_1.Text>
          </components_1.Container>
        </components_1.Body>
      </components_1.Tailwind>
    </components_1.Html>
  );
};
exports.AppointmentReminderEmail = AppointmentReminderEmail;
