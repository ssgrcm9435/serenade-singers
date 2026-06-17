/*******************************************************
 * SERENADE SINGERS — ADVANCED REGISTRATION BACKEND
 * Member + Volunteer + Gmail OTP + Sheet + Drive + Email
 *******************************************************/

const CONFIG = {
  SHEET_ID: "1wRA9SoXG7pB1miEekY37usH0lsBqAeFDgzj2ntH-hWc",
  PHOTO_FOLDER_ID: "1Yvqm9edgnDvqizjqhckcsB1Jyyue--RZ",
  HERO_LOGO_FILE_ID: "153xz5va0DTaPDPFECsqYSh8DT5HLU27q",

  ADMIN_EMAIL: "ssg.rcm9435@gmail.com",
  TELEGRAM_LINK: "https://t.me/+CdYB99GtiGhjYzFl",

  ORGANIZATION: "Serenade Singers",
  MEMBER_PREFIX: "SS",
  VOLUNTEER_PREFIX: "VOL",

  OTP_EXPIRE_MINUTES: 5,
};

/*******************************************************
 * MAIN ENTRY
 *******************************************************/

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || "{}");
    const action = body.action || "member";

    if (action === "sendOtp") return sendOtp_(body);

    if (action === "verifyOtp") {
      verifyOtp_(body.gmail, body.otp, "verify");
      return json_({
        success: true,
        message: "OTP verified successfully.",
      });
    }

    if (action === "member") return registerMember_(body);

    if (action === "volunteer") return registerVolunteer_(body);

    if (action === "checkMemberOrVolunteer") {
      return json_(checkMemberOrVolunteer_(body.gmail));
    }

    if (action === "submitShirtOrder") {
      return json_(submitShirtOrder_(body));
    }

    if (action === "getLearningVideos") {
      return json_(getLearningVideos_(body.audience));
    }

    if (action === "getAnnouncements") {
      return json_(getAnnouncements_());
    }

    if (action === "getEvents") {
      return json_(getEvents_());
    }

    if (action === "getFinancialReports") {
      return json_(getFinancialReports_());
    }

    if (action === "getDocuments") {
      return json_(getDocuments_());
    }

    if (action === "setupMemberHubSheets") {
      return json_(setupMemberHubSheets_());
    }



    return json_({
      success: false,
      message: "Invalid action.",
    });
  } catch (err) {
    return json_({
      success: false,
      message: String(err),
    });
  }
}

/*******************************************************
 * OTP SYSTEM
 *******************************************************/

function sendOtp_(body) {
  const gmail = normalizeEmail_(body.gmail);

  if (!gmail || !gmail.includes("@")) {
    throw new Error("Valid Gmail address is required.");
  }

  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const otpSheet = getOrCreateSheet_(ss, "Email_Verification");

  setupHeaders_(otpSheet, [
    "Timestamp",
    "Gmail",
    "OTP",
    "Status",
    "Expire Time",
  ]);

  const otp = generateOtp_();
  const now = new Date();
  const expireTime = new Date(
    now.getTime() + CONFIG.OTP_EXPIRE_MINUTES * 60 * 1000
  );

  otpSheet.appendRow([
    now,
    gmail,
    otp,
    "Pending",
    expireTime,
  ]);

  sendOtpEmail_(gmail, otp);

  return json_({
    success: true,
    message: "Verification code sent successfully.",
  });
}

function verifyOtp_(gmail, otp, mode) {
  const normalizedGmail = normalizeEmail_(gmail);
  const inputOtp = String(otp || "").trim();

  if (!normalizedGmail || !inputOtp) {
    throw new Error("Gmail and verification code are required.");
  }

  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = getOrCreateSheet_(ss, "Email_Verification");

  setupHeaders_(sheet, [
    "Timestamp",
    "Gmail",
    "OTP",
    "Status",
    "Expire Time",
  ]);

  const values = sheet.getDataRange().getValues();

  for (let i = values.length - 1; i >= 1; i--) {
    const rowGmail = normalizeEmail_(values[i][1]);
    const rowOtp = String(values[i][2] || "").trim();
    const rowStatus = String(values[i][3] || "").trim();
    const expireTime = new Date(values[i][4]);

    const statusAllowed =
      mode === "verify"
        ? rowStatus === "Pending"
        : rowStatus === "Verified";

    if (
      rowGmail === normalizedGmail &&
      rowOtp === inputOtp &&
      statusAllowed
    ) {
      if (new Date() > expireTime) {
        sheet.getRange(i + 1, 4).setValue("Expired");
        throw new Error("Verification code expired. Please request a new code.");
      }

      sheet
        .getRange(i + 1, 4)
        .setValue(mode === "verify" ? "Verified" : "Used");

      return true;
    }
  }

  throw new Error(
    mode === "verify"
      ? "Invalid verification code."
      : "OTP already used or not verified."
  );
}

function sendOtpEmail_(gmail, otp) {
  const subject = "Serenade Singers Gmail Verification Code";

  const htmlBody = `
  <div style="margin:0;padding:0;background:#f8f6f2;font-family:Arial,sans-serif;color:#061A2F;">
    <div style="max-width:620px;margin:0 auto;padding:34px 18px;">
      <div style="background:#ffffff;border-radius:26px;border:1px solid #ece7dd;padding:38px;box-shadow:0 18px 50px rgba(6,26,47,0.08);">

        <h2 style="margin:0 0 20px;text-align:center;color:#061A2F;">
          Gmail Verification Code
        </h2>

        <p>
          Serenade Singers registration ပြုလုပ်ရန်အတွက်
          အောက်ပါ verification code ကို အသုံးပြုပါ။
        </p>

        <div style="margin:26px 0;padding:24px;border-radius:20px;background:#f8f6f2;border:1px solid #ece7dd;text-align:center;">
          <p style="margin:0;font-size:36px;font-weight:800;color:#C9A24A;letter-spacing:0.18em;">
            ${otp}
          </p>
        </div>

        <p>
          This code will expire in ${CONFIG.OTP_EXPIRE_MINUTES} minutes.
        </p>

        <p style="color:#7A7468;font-size:13px;line-height:1.7;">
          If you did not request this code, please ignore this email.
        </p>

        <p style="margin-top:26px;">
          Thank you.<br>
          Serenade Singers
        </p>

      </div>
    </div>
  </div>`;

  GmailApp.sendEmail(gmail, subject, "", {
    htmlBody,
    name: CONFIG.ORGANIZATION,
  });
}

/*******************************************************
 * MEMBER REGISTRATION
 *******************************************************/

function registerMember_(body) {
  validateMemberRequired_(body);
  verifyOtp_(body.gmail, body.otp, "consume");

  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);

  const membersSheet = getOrCreateSheet_(ss, "Members_Main");
  const assessmentSheet = getOrCreateSheet_(ss, "Voice_Assessment");
  const volunteerSheet = getOrCreateSheet_(ss, "Volunteer_Applications");
  const emailLogSheet = getOrCreateSheet_(ss, "Email_Log");
  const attendanceSheet = getOrCreateSheet_(ss, "Attendance");
  const settingsSheet = getOrCreateSheet_(ss, "Settings");
  const otpSheet = getOrCreateSheet_(ss, "Email_Verification");

  setupAllHeaders_(
    membersSheet,
    assessmentSheet,
    volunteerSheet,
    emailLogSheet,
    attendanceSheet,
    settingsSheet,
    otpSheet
  );

  const timestamp = new Date();
  const memberId = generateMemberId_(membersSheet);

  const initialVoiceType = body.voiceType || "Unknown";
  const finalVoiceType = initialVoiceType === "Unknown" ? "" : initialVoiceType;
  const voiceStatus = finalVoiceType ? "Submitted" : "Pending Assessment";

  const photoUrl = saveProfilePhoto_(body, memberId);
  const qrUrl = createQrUrl_(memberId);

  membersSheet.appendRow([
    timestamp,
    memberId,
    body.fullName || "",
    body.gmail || "",
    body.phone || "",
    body.viberPhone || "",
    body.telegramContact || "",
    body.age || "",
    body.gender || "",
    body.nrcOrPassport || "",
    body.address || "",
    initialVoiceType,
    finalVoiceType,
    voiceStatus,
    body.experience || "",
    body.program || "",
    photoUrl,
    qrUrl,
    body.acceptTerms || "",
    "Active",
    timestamp,
    timestamp,
    "",
  ]);

  assessmentSheet.appendRow([
    timestamp,
    memberId,
    body.fullName || "",
    body.gmail || "",
    initialVoiceType,
    "",
    "Pending",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  let emailStatus = "Sent";
  let emailError = "";

  try {
    sendWelcomeEmail_({
      email: body.gmail,
      fullName: body.fullName,
      idNumber: memberId,
      statusLabel: "Voice Status",
      statusValue: voiceStatus,
      type: "Member",
    });
  } catch (mailErr) {
    emailStatus = "Failed";
    emailError = String(mailErr);
  }

  emailLogSheet.appendRow([
    timestamp,
    memberId,
    body.fullName || "",
    body.gmail || "",
    "Member Welcome Email",
    "Welcome to Serenade Singers",
    emailStatus,
    emailError,
    CONFIG.ADMIN_EMAIL,
    "",
  ]);

  return json_({
    success: true,
    type: "member",
    memberId,
    photoUrl,
    qrUrl,
    emailStatus,
    message: "Member registration successful.",
  });
}

/*******************************************************
 * VOLUNTEER REGISTRATION
 *******************************************************/

function registerVolunteer_(body) {
  validateVolunteerRequired_(body);
  verifyOtp_(body.gmail, body.otp, "consume");

  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);

  const membersSheet = getOrCreateSheet_(ss, "Members_Main");
  const assessmentSheet = getOrCreateSheet_(ss, "Voice_Assessment");
  const volunteerSheet = getOrCreateSheet_(ss, "Volunteer_Applications");
  const emailLogSheet = getOrCreateSheet_(ss, "Email_Log");
  const attendanceSheet = getOrCreateSheet_(ss, "Attendance");
  const settingsSheet = getOrCreateSheet_(ss, "Settings");
  const otpSheet = getOrCreateSheet_(ss, "Email_Verification");

  setupAllHeaders_(
    membersSheet,
    assessmentSheet,
    volunteerSheet,
    emailLogSheet,
    attendanceSheet,
    settingsSheet,
    otpSheet
  );

  const timestamp = new Date();
  const volunteerId = generateVolunteerId_(volunteerSheet);

  volunteerSheet.appendRow([
    timestamp,
    volunteerId,
    body.fullName || "",
    body.gmail || "",
    body.phone || "",
    body.telegramContact || "",
    body.volunteerCategory || "",
    body.specificRole || "",
    body.availability || "",
    body.experience || "",
    body.portfolio || "",
    "Pending",
    "",
    "",
  ]);

  let emailStatus = "Sent";
  let emailError = "";

  try {
    sendWelcomeEmail_({
      email: body.gmail,
      fullName: body.fullName,
      idNumber: volunteerId,
      statusLabel: "Application Status",
      statusValue: "Pending Review",
      type: "Volunteer",
    });
  } catch (mailErr) {
    emailStatus = "Failed";
    emailError = String(mailErr);
  }

  emailLogSheet.appendRow([
    timestamp,
    volunteerId,
    body.fullName || "",
    body.gmail || "",
    "Volunteer Welcome Email",
    "Welcome to Serenade Singers",
    emailStatus,
    emailError,
    CONFIG.ADMIN_EMAIL,
    "",
  ]);

  return json_({
    success: true,
    type: "volunteer",
    volunteerId,
    emailStatus,
    message: "Volunteer application submitted successfully.",
  });
}

/*******************************************************
 * VALIDATION
 *******************************************************/

function validateMemberRequired_(body) {
  const required = [
    "fullName",
    "gmail",
    "otp",
    "phone",
    "age",
    "gender",
    "nrcOrPassport",
    "address",
    "voiceType",
    "experience",
    "program",
    "acceptTerms",
    "profilePhoto",
  ];

  validateRequiredFields_(body, required);

  if (!String(body.gmail).includes("@")) {
    throw new Error("Invalid Gmail address.");
  }
}

function validateVolunteerRequired_(body) {
  const required = [
    "fullName",
    "gmail",
    "otp",
    "phone",
    "telegramContact",
    "volunteerCategory",
    "availability",
    "acceptTerms",
  ];

  validateRequiredFields_(body, required);

  if (!String(body.gmail).includes("@")) {
    throw new Error("Invalid Gmail address.");
  }
}

function validateRequiredFields_(body, required) {
  const missing = required.filter((key) => !body[key]);

  if (missing.length > 0) {
    throw new Error("Missing required fields: " + missing.join(", "));
  }
}

/*******************************************************
 * SHEET SETUP
 *******************************************************/

function setupAllHeaders_(
  members,
  assessment,
  volunteer,
  emailLog,
  attendance,
  settings,
  otp
) {
  setupHeaders_(members, [
    "Timestamp",
    "Member ID",
    "Full Name",
    "Gmail",
    "Phone Number",
    "Viber Phone",
    "Telegram Username / Phone",
    "Age",
    "Gender",
    "NRC or Passport Number",
    "Address",
    "Initial Voice Type",
    "Final Voice Type",
    "Voice Status",
    "Experience Level",
    "Interested Program",
    "Profile Photo URL",
    "QR Code URL",
    "Terms Accepted",
    "Member Status",
    "Join Date",
    "Last Updated",
    "Notes",
  ]);

  setupHeaders_(assessment, [
    "Timestamp",
    "Member ID",
    "Full Name",
    "Gmail",
    "Initial Voice Type",
    "Final Voice Type",
    "Assessment Status",
    "Vocal Range",
    "Choir Section",
    "Assessed By",
    "Assessment Date",
    "Pitch Accuracy",
    "Rhythm",
    "Breath Control",
    "Blend Quality",
    "Musicality",
    "Remarks",
    "Final Decision",
  ]);

  setupHeaders_(volunteer, [
    "Timestamp",
    "Volunteer ID",
    "Full Name",
    "Gmail",
    "Phone Number",
    "Telegram Username / Phone",
    "Volunteer Category",
    "Specific Role",
    "Availability",
    "Experience",
    "Portfolio / Social Link",
    "Status",
    "Assigned Team",
    "Notes",
  ]);

  setupHeaders_(emailLog, [
    "Timestamp",
    "ID Number",
    "Full Name",
    "Gmail",
    "Email Type",
    "Subject",
    "Send Status",
    "Error Message",
    "Sent By",
    "Notes",
  ]);

  setupHeaders_(attendance, [
    "Timestamp",
    "Member ID",
    "Full Name",
    "Event Name",
    "Event Date",
    "Attendance Status",
    "Check-in Time",
    "Check-out Time",
    "QR Scan Status",
    "Checked By",
    "Notes",
  ]);

  setupHeaders_(settings, [
    "Key",
    "Value",
    "Description",
    "Last Updated",
  ]);

  setupHeaders_(otp, [
    "Timestamp",
    "Gmail",
    "OTP",
    "Status",
    "Expire Time",
  ]);
}

function setupHeaders_(sheet, headers) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);

    sheet
      .getRange(1, 1, 1, headers.length)
      .setFontWeight("bold")
      .setBackground("#061A2F")
      .setFontColor("#FFFFFF");

    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, headers.length);
  }
}

/*******************************************************
 * ID GENERATORS
 *******************************************************/

function generateMemberId_(membersSheet) {
  const year = new Date().getFullYear();
  const lastRow = membersSheet.getLastRow();
  const nextNumber = Math.max(1, lastRow);

  return `${CONFIG.MEMBER_PREFIX}-${year}-${String(nextNumber).padStart(4, "0")}`;
}

function generateVolunteerId_(volunteerSheet) {
  const year = new Date().getFullYear();
  const lastRow = volunteerSheet.getLastRow();
  const nextNumber = Math.max(1, lastRow);

  return `${CONFIG.VOLUNTEER_PREFIX}-${year}-${String(nextNumber).padStart(4, "0")}`;
}

/*******************************************************
 * PHOTO UPLOAD — BASE64 TO GOOGLE DRIVE
 *******************************************************/

function saveProfilePhoto_(body, idNumber) {
  const base64DataUrl = body.profilePhoto;

  if (!base64DataUrl) {
    return "";
  }

  const match = String(base64DataUrl).match(
    /^data:(image\/png|image\/jpeg|image\/jpg);base64,(.+)$/
  );

  if (!match) {
    throw new Error("Invalid profile photo format. Please upload JPG or PNG.");
  }

  const mimeType = match[1] === "image/jpg" ? "image/jpeg" : match[1];
  const base64 = match[2];

  const ext = mimeType === "image/png" ? "png" : "jpg";
  const safeName = sanitizeName_(body.fullName);
  const fileName = `${idNumber}_${safeName}.${ext}`;

  const blob = Utilities.newBlob(
    Utilities.base64Decode(base64),
    mimeType,
    fileName
  );

  const folder = DriveApp.getFolderById(CONFIG.PHOTO_FOLDER_ID);
  const file = folder.createFile(blob);
  file.setName(fileName);

  return file.getUrl();
}

/*******************************************************
 * EMAIL
 *******************************************************/

function sendWelcomeEmail_({
  email,
  fullName,
  idNumber,
  statusLabel,
  statusValue,
  type,
}) {
  const subject = "Welcome to Serenade Singers";
  const heroLogoUrl = `https://drive.google.com/thumbnail?id=${CONFIG.HERO_LOGO_FILE_ID}&sz=w1000`;

  const htmlBody = `
  <div style="margin:0;padding:0;background:#f8f6f2;font-family:Arial,sans-serif;color:#061A2F;">
    <div style="max-width:720px;margin:0 auto;padding:36px 20px;">
      <div style="background:#ffffff;border-radius:28px;border:1px solid #ece7dd;padding:42px;box-shadow:0 20px 60px rgba(6,26,47,0.08);">

        <div style="text-align:center;margin-bottom:28px;">
          <img src="${heroLogoUrl}" alt="Serenade Singers" style="display:block;margin:0 auto;width:180px;max-width:70%;height:auto;" />
        </div>

        <h2 style="margin:0 0 24px;text-align:center;font-size:30px;color:#061A2F;">
          Welcome to Serenade Singers
        </h2>

        <p>Dear ${escapeHtml_(fullName)},</p>

        <p>Serenade Singers မှ နွေးထွေးစွာ ကြိုဆိုပါသည်။</p>

        <p>လူကြီးမင်း၏ ${escapeHtml_(type)} registration ကို လက်ခံရရှိပြီးဖြစ်ပါသည်။</p>

        <div style="margin:26px 0;padding:24px;border-radius:20px;background:#f8f6f2;border:1px solid #ece7dd;">
          <p style="margin:0 0 12px;font-size:13px;color:#7A7468;letter-spacing:0.12em;">
            ID NUMBER
          </p>

          <p style="margin:0;font-size:28px;font-weight:800;color:#C9A24A;letter-spacing:0.08em;">
            ${idNumber}
          </p>

          <div style="height:1px;background:#ece7dd;margin:20px 0;"></div>

          <p style="margin:0 0 10px;font-size:13px;color:#7A7468;letter-spacing:0.12em;">
            ${escapeHtml_(statusLabel)}
          </p>

          <p style="margin:0;font-size:16px;font-weight:700;">
            ${escapeHtml_(statusValue)}
          </p>
        </div>

        <p>
          Further announcements and confirmation will be shared through the registration process.
        </p>

        <div style="margin-top:28px;padding:22px;border-radius:20px;background:#EEF4FB;border:1px solid #DCE7F3;">
          <p style="margin:0 0 12px;font-weight:700;">Registration Telegram Group</p>
          <a href="${CONFIG.TELEGRAM_LINK}" style="color:#0A66C2;text-decoration:none;word-break:break-all;">
            ${CONFIG.TELEGRAM_LINK}
          </a>
        </div>

        <p style="margin-top:34px;line-height:1.8;">
          Thank you.<br>
          Serenade Singers
        </p>

        <div style="margin-top:36px;padding-top:22px;border-top:1px solid #eeeeee;">
          <p style="margin:0;color:#A0A7B4;font-size:12px;line-height:1.9;">
            Serenade Singers is a non profit organization.<br>
            Founded by Piano For ALL International Music Education<br>
            Innovaverse Group Foundation<br>
            Powered by InnovateX
          </p>
        </div>

      </div>
    </div>
  </div>`;

  GmailApp.sendEmail(email, subject, "", {
    htmlBody,
    name: CONFIG.ORGANIZATION,
  });
}

/*******************************************************
 * HELPERS
 *******************************************************/

function createQrUrl_(idNumber) {
  return `https://quickchart.io/qr?text=${encodeURIComponent(idNumber)}`;
}

function generateOtp_() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function getOrCreateSheet_(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function sanitizeName_(name) {
  return String(name || "Member")
    .trim()
    .replace(/\s+/g, "")
    .replace(/[^a-zA-Z0-9]/g, "");
}

function normalizeEmail_(email) {
  return String(email || "").trim().toLowerCase();
}

function escapeHtml_(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/*******************************************************
 * OFFICIAL T-SHIRT REGISTRATION
 *******************************************************/

function checkMemberOrVolunteer_(gmail) {
  gmail = normalizeEmail_(gmail);

  if (!gmail || !gmail.includes("@")) {
    return {
      success: false,
      verified: false,
      message: "Valid Gmail address is required.",
    };
  }

  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);

  const member = findTshirtPersonByEmail_(ss, "Members_Main", gmail, "Member");
  if (member) return member;

  const volunteer = findTshirtPersonByEmail_(ss, "Volunteer_Applications", gmail, "Volunteer");
  if (volunteer) return volunteer;

  return {
    success: false,
    verified: false,
    message: "Gmail not found in Serenade Singers records.",
  };
}

function findTshirtPersonByEmail_(ss, sheetName, gmail, type) {
  const sheet = getOrCreateSheet_(ss, sheetName);
  const values = sheet.getDataRange().getValues();

  if (values.length < 2) return null;

  const headers = values[0].map(h => String(h || "").trim().toLowerCase());

  const gmailIndex = findTshirtHeaderIndex_(headers, ["gmail", "email", "gmail address"]);
  const idIndex = findTshirtHeaderIndex_(headers, ["member id", "volunteer id", "id"]);
  const nameIndex = findTshirtHeaderIndex_(headers, ["full name", "name"]);
  const voiceIndex = findTshirtHeaderIndex_(headers, [
    "final voice type",
    "initial voice type",
    "voice part",
    "voice",
  ]);

  if (gmailIndex === -1) return null;

  for (let i = 1; i < values.length; i++) {
    if (normalizeEmail_(values[i][gmailIndex]) === gmail) {
      return {
        success: true,
        verified: true,
        type,
        memberId: idIndex !== -1 ? values[i][idIndex] : "",
        fullName: nameIndex !== -1 ? values[i][nameIndex] : "",
        gmail: values[i][gmailIndex],
        voicePart: voiceIndex !== -1 ? values[i][voiceIndex] : "",
      };
    }
  }

  return null;
}

function submitShirtOrder_(body) {
  const required = [
    "gmail",
    "shirtSize",
    "quantity",
    "acceptTerms",
  ];

  const missing = required.filter(key => !body[key]);

  if (missing.length) {
    return {
      success: false,
      message: "Missing required fields: " + missing.join(", "),
    };
  }

  const verified = checkMemberOrVolunteer_(body.gmail);

  if (!verified.verified) {
    return {
      success: false,
      message: "Gmail verification failed.",
    };
  }

  const size = String(body.shirtSize || "").trim().toUpperCase();
  const allowedSizes = ["S", "M", "L", "XL", "2XL", "3XL"];

  if (!allowedSizes.includes(size)) {
    return {
      success: false,
      message: "Invalid shirt size.",
    };
  }

  const quantity = Number(body.quantity);

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 5) {
    return {
      success: false,
      message: "Quantity must be between 1 and 5.",
    };
  }

  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = getOrCreateSheet_(ss, "ShirtOrders");

  setupHeaders_(sheet, [
    "Order ID",
    "Timestamp",
    "Type",
    "Member ID",
    "Full Name",
    "Gmail",
    "Voice Part",
    "Shirt Size",
    "Quantity",
    "Remark",
    "Status",
  ]);

  const orderId = generateShirtOrderId_(sheet);

  sheet.appendRow([
    orderId,
    new Date(),
    verified.type,
    verified.memberId,
    verified.fullName,
    verified.gmail,
    verified.voicePart || "",
    size,
    quantity,
    body.remark || "",
    "Pending",
  ]);

  sendTshirtConfirmationEmail_(verified, orderId, size, quantity, body.remark || "");
  sendTshirtAdminEmail_(verified, orderId, size, quantity, body.remark || "");

  return {
    success: true,
    orderId,
    status: "Pending",
    message: "T-Shirt registration submitted successfully.",
  };
}

function sendTshirtConfirmationEmail_(verified, orderId, size, quantity, remark) {
  const color = verified.type === "Member" ? "Black" : "White";

  const htmlBody = `
  <div style="font-family:Arial,sans-serif;color:#061A2F;background:#f8f6f2;padding:30px;">
    <div style="max-width:680px;margin:auto;background:#ffffff;border-radius:24px;padding:34px;border:1px solid #ece7dd;">
      <h2 style="text-align:center;">T-Shirt Registration Received</h2>

      <p>Dear ${escapeHtml_(verified.fullName)},</p>

      <p>Your Serenade Singers Official T-Shirt registration has been received.</p>

      <p><b>Order ID:</b> ${escapeHtml_(orderId)}</p>
      <p><b>ID:</b> ${escapeHtml_(verified.memberId)}</p>
      <p><b>Type:</b> ${escapeHtml_(verified.type)}</p>
      <p><b>Official T-Shirt Color:</b> ${escapeHtml_(color)}</p>
      <p><b>Size:</b> ${escapeHtml_(size)}</p>
      <p><b>Quantity:</b> ${escapeHtml_(quantity)}</p>
      <p><b>Status:</b> Pending</p>
      <p><b>Remark:</b> ${escapeHtml_(remark || "-")}</p>

      <p>Charges are based on actual production cost only. No profit is included.</p>
      <p>Please note that size changes may not be possible after production begins.</p>

      <p>Thank you.<br>Serenade Singers</p>
    </div>
  </div>`;

  GmailApp.sendEmail(
    verified.gmail,
    "Serenade Singers T-Shirt Registration Confirmation",
    "",
    {
      htmlBody,
      name: CONFIG.ORGANIZATION,
    }
  );
}

function sendTshirtAdminEmail_(verified, orderId, size, quantity, remark) {
  const body =
    "New T-Shirt Registration\n\n" +
    "Order ID: " + orderId + "\n" +
    "Type: " + verified.type + "\n" +
    "ID: " + verified.memberId + "\n" +
    "Full Name: " + verified.fullName + "\n" +
    "Gmail: " + verified.gmail + "\n" +
    "Voice Part: " + (verified.voicePart || "-") + "\n" +
    "Size: " + size + "\n" +
    "Quantity: " + quantity + "\n" +
    "Remark: " + (remark || "-") + "\n" +
    "Status: Pending";

  GmailApp.sendEmail(CONFIG.ADMIN_EMAIL, "New Serenade Singers T-Shirt Registration", body, {
    name: CONFIG.ORGANIZATION,
  });
}

function generateShirtOrderId_(sheet) {
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) return "SO-000001";

  const values = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  let maxNumber = 0;

  values.forEach(row => {
    const match = String(row[0] || "").match(/^SO-(\d+)$/);
    if (match) maxNumber = Math.max(maxNumber, Number(match[1]));
  });

  return "SO-" + Utilities.formatString("%06d", maxNumber + 1);
}

function findTshirtHeaderIndex_(headers, names) {
  for (const name of names) {
    const index = headers.indexOf(name);
    if (index !== -1) return index;
  }
  return -1;
}


/*******************************************************
 * LEARNING CENTER
 *******************************************************/

function getLearningVideos_(audience) {
  const targetAudience = String(audience || "").trim();

  if (!targetAudience) {
    return {
      success: false,
      message: "Audience is required.",
      videos: [],
    };
  }

  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = getOrCreateSheet_(ss, "LearningVideos");

  setupHeaders_(sheet, [
    "Audience",
    "Category",
    "Title",
    "YouTubeURL",
    "Description",
    "Status",
    "SortOrder",
  ]);

  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return {
      success: true,
      videos: [],
    };
  }

  const videos = [];

  for (let i = 1; i < values.length; i++) {
    const audienceCell = String(values[i][0] || "").trim();
    const statusCell = String(values[i][5] || "").trim();

    if (
      audienceCell.toLowerCase() === targetAudience.toLowerCase() &&
      statusCell.toLowerCase() === "active"
    ) {
      videos.push({
        audience: values[i][0],
        category: values[i][1],
        title: values[i][2],
        youtubeUrl: values[i][3],
        description: values[i][4],
        sortOrder: Number(values[i][6]) || 9999,
      });
    }
  }

  videos.sort(function(a, b) {
    return a.sortOrder - b.sortOrder;
  });

  return {
    success: true,
    videos: videos,
  };
}


/*******************************************************
 * MEMBER HUB SHEETS + APIs
 *******************************************************/

function setupMemberHubSheets_() {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);

  setupHeaders_(getOrCreateSheet_(ss, "Announcements"), [
    "Created At",
    "Title",
    "Content",
    "Category",
    "Published By",
    "Status",
    "SortOrder",
  ]);

  setupHeaders_(getOrCreateSheet_(ss, "Events"), [
    "Created At",
    "Event Name",
    "Event Date",
    "Event Time",
    "Location",
    "Description",
    "Category",
    "Status",
    "SortOrder",
  ]);

  setupHeaders_(getOrCreateSheet_(ss, "FinancialReports"), [
    "Date",
    "Category",
    "Description",
    "Purpose",
    "Income",
    "Expense",
    "Balance",
    "Reference No",
    "Status",
  ]);

  setupHeaders_(getOrCreateSheet_(ss, "Documents"), [
    "Created At",
    "Title",
    "Category",
    "File URL",
    "Description",
    "Status",
    "SortOrder",
  ]);

  setupHeaders_(getOrCreateSheet_(ss, "LearningArticles"), [
    "Created At",
    "Category",
    "Title",
    "Slug",
    "Google Doc ID",
    "Description",
    "Status",
    "SortOrder",
  ]);

  setupHeaders_(getOrCreateSheet_(ss, "LearningCategories"), [
    "Created At",
    "Category Name",
    "Description",
    "Status",
    "SortOrder",
  ]);

  setupHeaders_(getOrCreateSheet_(ss, "Payments"), [
    "Created At",
    "Member ID",
    "Full Name",
    "Gmail",
    "Project",
    "Amount Paid",
    "Payment Method",
    "Screenshot URL",
    "Receipt No",
    "Payment Status",
    "Verified By",
    "Remarks",
  ]);

  return {
    success: true,
    message: "Member Hub sheets created successfully.",
  };
}

function getAnnouncements_() {
  return getActiveRows_("Announcements", [
    "createdAt",
    "title",
    "content",
    "category",
    "publishedBy",
    "status",
    "sortOrder",
  ]);
}

function getEvents_() {
  return getActiveRows_("Events", [
    "createdAt",
    "eventName",
    "eventDate",
    "eventTime",
    "location",
    "description",
    "category",
    "status",
    "sortOrder",
  ]);
}

function getFinancialReports_() {
  return getActiveRows_("FinancialReports", [
    "date",
    "category",
    "description",
    "purpose",
    "income",
    "expense",
    "balance",
    "referenceNo",
    "status",
  ]);
}

function getDocuments_() {
  return getActiveRows_("Documents", [
    "createdAt",
    "title",
    "category",
    "fileUrl",
    "description",
    "status",
    "sortOrder",
  ]);
}

function getActiveRows_(sheetName, keys) {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = getOrCreateSheet_(ss, sheetName);
  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return {
      success: true,
      items: [],
    };
  }

  const items = [];

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const status = String(row[keys.indexOf("status")] || "").trim().toLowerCase();

    if (status === "active" || status === "published") {
      const item = {};
      keys.forEach((key, index) => {
        item[key] = row[index];
      });
      items.push(item);
    }
  }

  items.sort(function(a, b) {
    return (Number(a.sortOrder) || 9999) - (Number(b.sortOrder) || 9999);
  });

  return {
    success: true,
    items,
  };
}


/*******************************************************
 * ADDITIONAL EMAIL OUTPUTS
 *******************************************************/

function sendPaymentReceiptEmail_(gmail, data) {
  const subject = "Serenade Singers Payment Receipt";

  const htmlBody = buildSerenadeEmail_(
    "Payment Receipt",
    `
      <p>Dear ${escapeHtml_(data.fullName || "Member")},</p>

      <p>Your payment has been received and recorded by Serenade Singers.</p>

      <div style="margin:24px 0;padding:22px;border-radius:18px;background:#f8f6f2;border:1px solid #ece7dd;">
        <p><b>Receipt No:</b> ${escapeHtml_(data.receiptNo || "-")}</p>
        <p><b>Project:</b> ${escapeHtml_(data.project || "-")}</p>
        <p><b>Amount:</b> ${escapeHtml_(data.amount || "-")} MMK</p>
        <p><b>Status:</b> ${escapeHtml_(data.status || "Received")}</p>
      </div>

      <p>Thank you for your support and contribution.</p>
    `
  );

  GmailApp.sendEmail(gmail, subject, "", {
    htmlBody,
    name: CONFIG.ORGANIZATION,
  });
}

function sendPaymentApprovedEmail_(gmail, data) {
  const subject = "Serenade Singers Payment Approved";

  const htmlBody = buildSerenadeEmail_(
    "Payment Approved",
    `
      <p>Dear ${escapeHtml_(data.fullName || "Member")},</p>

      <p>Your payment has been successfully verified.</p>

      <div style="margin:24px 0;padding:22px;border-radius:18px;background:#ecfdf5;border:1px solid #bbf7d0;">
        <p><b>Project:</b> ${escapeHtml_(data.project || "-")}</p>
        <p><b>Amount:</b> ${escapeHtml_(data.amount || "-")} MMK</p>
        <p><b>Status:</b> Approved</p>
      </div>

      <p>An official receipt may be issued separately if required.</p>
    `
  );

  GmailApp.sendEmail(gmail, subject, "", {
    htmlBody,
    name: CONFIG.ORGANIZATION,
  });
}

function sendPaymentRejectedEmail_(gmail, data) {
  const subject = "Serenade Singers Payment Requires Review";

  const htmlBody = buildSerenadeEmail_(
    "Payment Requires Review",
    `
      <p>Dear ${escapeHtml_(data.fullName || "Member")},</p>

      <p>Your submitted payment could not be verified at this time.</p>

      <div style="margin:24px 0;padding:22px;border-radius:18px;background:#fff7ed;border:1px solid #fed7aa;">
        <p><b>Project:</b> ${escapeHtml_(data.project || "-")}</p>
        <p><b>Reason:</b> ${escapeHtml_(data.reason || "Payment information requires further checking.")}</p>
        <p><b>Status:</b> Requires Review</p>
      </div>

      <p>Please contact Serenade Singers administration if you believe this is incorrect.</p>
    `
  );

  GmailApp.sendEmail(gmail, subject, "", {
    htmlBody,
    name: CONFIG.ORGANIZATION,
  });
}

function sendMemberIdCardIssuedEmail_(gmail, data) {
  const subject = "Serenade Singers Member ID Card Issued";

  const htmlBody = buildSerenadeEmail_(
    "Member ID Card Issued",
    `
      <p>Dear ${escapeHtml_(data.fullName || "Member")},</p>

      <p>Your Serenade Singers ID Card has been issued.</p>

      <div style="margin:24px 0;padding:22px;border-radius:18px;background:#f8f6f2;border:1px solid #ece7dd;">
        <p><b>ID Number:</b> ${escapeHtml_(data.memberId || "-")}</p>
        <p><b>Type:</b> ${escapeHtml_(data.type || "-")}</p>
        <p><b>Role / Voice Part:</b> ${escapeHtml_(data.role || data.voicePart || "-")}</p>
      </div>

      <p>Please keep your ID information safe and use it for official Serenade Singers activities when required.</p>
    `
  );

  GmailApp.sendEmail(gmail, subject, "", {
    htmlBody,
    name: CONFIG.ORGANIZATION,
  });
}

function sendAnnouncementPublishedEmail_(gmail, data) {
  const subject = "Serenade Singers Announcement: " + (data.title || "New Announcement");

  const htmlBody = buildSerenadeEmail_(
    "New Announcement",
    `
      <p>Dear Members and Volunteers,</p>

      <h3 style="margin-top:18px;color:#061A2F;">${escapeHtml_(data.title || "Announcement")}</h3>

      <p style="line-height:1.8;">${escapeHtml_(data.content || "")}</p>

      <p>Please check Members Hub for more details.</p>
    `
  );

  GmailApp.sendEmail(gmail, subject, "", {
    htmlBody,
    name: CONFIG.ORGANIZATION,
  });
}

function sendEventReminderEmail_(gmail, data) {
  const subject = "Serenade Singers Event Reminder: " + (data.eventName || "Upcoming Event");

  const htmlBody = buildSerenadeEmail_(
    "Event Reminder",
    `
      <p>Dear Members and Volunteers,</p>

      <p>This is a reminder for an upcoming Serenade Singers activity.</p>

      <div style="margin:24px 0;padding:22px;border-radius:18px;background:#eef4fb;border:1px solid #dce7f3;">
        <p><b>Event:</b> ${escapeHtml_(data.eventName || "-")}</p>
        <p><b>Date:</b> ${escapeHtml_(data.eventDate || "-")}</p>
        <p><b>Time:</b> ${escapeHtml_(data.eventTime || "-")}</p>
        <p><b>Location:</b> ${escapeHtml_(data.location || "-")}</p>
      </div>

      <p>${escapeHtml_(data.description || "")}</p>
    `
  );

  GmailApp.sendEmail(gmail, subject, "", {
    htmlBody,
    name: CONFIG.ORGANIZATION,
  });
}

function buildSerenadeEmail_(title, contentHtml) {
  const heroLogoUrl = `https://drive.google.com/thumbnail?id=${CONFIG.HERO_LOGO_FILE_ID}&sz=w1000`;

  return `
  <div style="margin:0;padding:0;background:#f8f6f2;font-family:Arial,sans-serif;color:#061A2F;">
    <div style="max-width:720px;margin:0 auto;padding:36px 20px;">
      <div style="background:#ffffff;border-radius:28px;border:1px solid #ece7dd;padding:42px;box-shadow:0 20px 60px rgba(6,26,47,0.08);">

        <div style="text-align:center;margin-bottom:26px;">
          <img src="${heroLogoUrl}" alt="Serenade Singers" style="display:block;margin:0 auto;width:170px;max-width:70%;height:auto;" />
        </div>

        <h2 style="margin:0 0 24px;text-align:center;font-size:30px;color:#061A2F;">
          ${escapeHtml_(title)}
        </h2>

        <div style="font-size:15px;line-height:1.8;color:#061A2F;">
          ${contentHtml}
        </div>

        <p style="margin-top:34px;line-height:1.8;">
          Thank you.<br>
          Serenade Singers
        </p>

        <div style="margin-top:36px;padding-top:22px;border-top:1px solid #eeeeee;">
          <p style="margin:0;color:#A0A7B4;font-size:12px;line-height:1.9;">
            Serenade Singers is a non profit organization.<br>
            Founded by Piano For ALL International Music Education<br>
            Innovaverse Group Foundation<br>
            Powered by InnovateX
          </p>
        </div>

      </div>
    </div>
  </div>`;
}
