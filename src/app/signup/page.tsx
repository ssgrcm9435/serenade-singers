"use client";

import { useState } from "react";
import { site } from "@/data/site";

type RegistrationType = "member" | "volunteer" | null;
type Step = "choose" | "verify" | "form";

export default function SignupPage() {
  const [type, setType] = useState<RegistrationType>(null);
  const [step, setStep] = useState<Step>("choose");

  const [verifiedName, setVerifiedName] = useState("");
  const [verifiedGmail, setVerifiedGmail] = useState("");
  const [verifiedOtp, setVerifiedOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function convertToBase64(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
    });
  }

  async function sendOtp() {
    if (!verifiedName.trim()) {
      setMessage("Please enter your full name first.");
      return;
    }

    if (!verifiedGmail.trim()) {
      setMessage("Please enter your Gmail address first.");
      return;
    }

    setOtpLoading(true);
    setMessage("Sending verification code to your Gmail...");

    try {
      const response = await fetch(site.appsScriptUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "sendOtp",
          gmail: verifiedGmail,
        }),
      });

      const result = await response.json();

      setMessage(
        result.success
          ? "Verification code sent. Please check your Gmail inbox."
          : result.message || "Failed to send verification code."
      );
    } catch {
      setMessage("Connection error while sending verification code.");
    }

    setOtpLoading(false);
  }

  async function continueToForm() {
    if (!verifiedName.trim()) {
      setMessage("Please enter your full name first.");
      return;
    }

    if (!verifiedGmail.trim()) {
      setMessage("Please enter your Gmail address first.");
      return;
    }

    if (!verifiedOtp.trim()) {
      setMessage("Please enter verification code first.");
      return;
    }

    setLoading(true);
    setMessage("Verifying OTP...");

    try {
      const response = await fetch(site.appsScriptUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "verifyOtp",
          gmail: verifiedGmail,
          otp: verifiedOtp,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage("");
        setStep("form");
      } else {
        setMessage(result.message || "Invalid verification code.");
      }
    } catch {
      setMessage("Verification failed. Please try again.");
    }

    setLoading(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!type) return;

    setLoading(true);
    setMessage("Submitting registration...");

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      const photo = formData.get("profilePhoto") as File;

      let photoBase64 = "";

      if (type === "member" && photo && photo.size > 0) {
        photoBase64 = await convertToBase64(photo);
      }

      const payload: any = {
        action: type,
        fullName: verifiedName,
        gmail: verifiedGmail,
        otp: verifiedOtp,
        phone: formData.get("phone"),
        telegramContact: formData.get("telegramContact"),
        acceptTerms: formData.get("acceptTerms"),
      };

      if (type === "member") {
        payload.viberPhone = formData.get("viberPhone");
        payload.age = formData.get("age");
        payload.gender = formData.get("gender");
        payload.nrcOrPassport = formData.get("nrcOrPassport");
        payload.address = formData.get("address");
        payload.voiceType = formData.get("voiceType");
        payload.experience = formData.get("experience");
        payload.program = formData.get("program");
        payload.profilePhoto = photoBase64;
        payload.profilePhotoName = photo?.name || "";
      }

      if (type === "volunteer") {
        payload.volunteerCategory = formData.get("volunteerCategory");
        payload.specificRole = formData.get("specificRole");
        payload.availability = formData.get("availability");
        payload.experience = formData.get("volunteerExperience");
        payload.portfolio = formData.get("portfolio");
      }

      const response = await fetch(site.appsScriptUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        setMessage(
          type === "member"
            ? `Member registration successful. Your Member ID is ${result.memberId}. Please check your Gmail.`
            : `Volunteer application successful. Your Volunteer ID is ${result.volunteerId}. Please check your Gmail.`
        );

        form.reset();
      } else {
        setMessage(result.message || "Submission failed.");
      }
    } catch {
      setMessage("Connection error. Please contact Serenade Singers admin.");
    }

    setLoading(false);
  }

  function resetChoice() {
    setType(null);
    setStep("choose");
    setVerifiedName("");
    setVerifiedGmail("");
    setVerifiedOtp("");
    setMessage("");
  }

  return (
    <main className="signup-page">
      <section className="signup-form-wrap">
        <p className="eyebrow">Serenade Singers Registration</p>

        {step === "choose" && (
          <>
            <h1>Choose Registration Type</h1>

            <p className="signup-intro">
              Please select how you would like to join Serenade Singers.
            </p>

            <div className="registration-choice-window">
              <button
                type="button"
                className="registration-choice-card"
                onClick={() => {
                  setType("member");
                  setStep("verify");
                  setMessage("");
                }}
              >
                <div className="registration-choice-icon">🎼</div>
                <h3>Member</h3>
                <p>
                  For choir members, vocal training, piano, music theory, and performance programs.
                </p>
              </button>

              <button
                type="button"
                className="registration-choice-card"
                onClick={() => {
                  setType("volunteer");
                  setStep("verify");
                  setMessage("");
                }}
              >
                <div className="registration-choice-icon">🤝</div>
                <h3>Volunteer</h3>
                <p>
                  For event support, media, logistics, administration, outreach, and technical support.
                </p>
              </button>
            </div>
          </>
        )}

        {step === "verify" && (
          <>
            <button type="button" className="back-choice-btn" onClick={resetChoice}>
              ← Change Registration Type
            </button>

            <h1>{type === "member" ? "Member Verification" : "Volunteer Verification"}</h1>

            <p className="signup-intro">
              Please verify your Gmail before continuing to the registration form.
            </p>

            <div className="form-grid">
              <label>
                Full Name <span className="required-star">*</span>
                <input
                  type="text"
                  value={verifiedName}
                  onChange={(e) => setVerifiedName(e.target.value)}
                  required
                />
              </label>

              <label>
                Gmail Address <span className="required-star">*</span>
                <input
                  type="email"
                  placeholder="example@gmail.com"
                  value={verifiedGmail}
                  onChange={(e) => setVerifiedGmail(e.target.value)}
                  required
                />
              </label>

              <div className="full-width otp-box">
                <button
                  type="button"
                  className="btn-outline otp-btn"
                  onClick={sendOtp}
                  disabled={otpLoading || loading}
                >
                  {otpLoading ? "Sending Code..." : "Send Gmail Verification Code"}
                </button>

                <label>
                  Verification Code <span className="required-star">*</span>
                  <input
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={verifiedOtp}
                    onChange={(e) => setVerifiedOtp(e.target.value)}
                    required
                  />
                </label>
              </div>
            </div>

            <button
              type="button"
              className="btn-primary submit-btn"
              onClick={continueToForm}
              disabled={loading}
            >
              {loading
                ? "Verifying..."
                : `Continue to ${type === "member" ? "Member Form" : "Volunteer Form"}`}
            </button>

            {message && <p className="form-status">{message}</p>}
          </>
        )}

        {step === "form" && type && (
          <>
            <button
              type="button"
              className="back-choice-btn"
              onClick={() => {
                setStep("verify");
                setMessage("");
              }}
            >
              ← Back to Gmail Verification
            </button>

            <h1>{type === "member" ? "Member Signup" : "Volunteer Signup"}</h1>

            <p className="signup-intro">
              Please complete the registration form carefully. Required fields are marked with{" "}
              <span className="required-star">*</span>.
            </p>

            <div className="verified-info-box">
              <p><strong>Name:</strong> {verifiedName}</p>
              <p><strong>Gmail:</strong> {verifiedGmail}</p>
            </div>

            <form className="signup-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                <label>
                  Phone Number <span className="required-star">*</span>
                  <input name="phone" type="tel" required />
                </label>

                <label>
                  Telegram Username or Phone{" "}
                  {type === "volunteer" && <span className="required-star">*</span>}
                  <input
                    name="telegramContact"
                    type="text"
                    placeholder="@username or phone number"
                    required={type === "volunteer"}
                  />
                </label>

                {type === "member" && (
                  <>
                    <label>
                      Viber Phone Number
                      <input name="viberPhone" type="tel" />
                    </label>

                    <label>
                      Age <span className="required-star">*</span>
                      <input name="age" type="number" min="5" required />
                    </label>

                    <label>
                      Gender <span className="required-star">*</span>
                      <select name="gender" required>
                        <option value="">Select</option>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Prefer not to say</option>
                      </select>
                    </label>

                    <label>
                      NRC or Passport Number <span className="required-star">*</span>
                      <input name="nrcOrPassport" type="text" required />
                    </label>

                    <label>
                      Voice Type <span className="required-star">*</span>
                      <select name="voiceType" required>
                        <option value="">Select</option>
                        <option value="Unknown">I do not know yet</option>
                        <option>Soprano</option>
                        <option>Alto</option>
                        <option>Tenor</option>
                        <option>Bass</option>
                      </select>
                    </label>

                    <label>
                      Music Experience <span className="required-star">*</span>
                      <select name="experience" required>
                        <option value="">Select</option>
                        <option>No experience</option>
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                      </select>
                    </label>

                    <label>
                      Interested Program <span className="required-star">*</span>
                      <select name="program" required>
                        <option value="">Select</option>
                        <option>Choir / A Cappella Member</option>
                        <option>Vocal Training</option>
                        <option>Piano Class</option>
                        <option>Music Theory</option>
                        <option>Performance Program</option>
                        <option>Workshop / Webinar</option>
                        <option>Not Sure Yet</option>
                      </select>
                    </label>

                    <label>
                      Profile Photo <span className="required-star">*</span>
                      <input name="profilePhoto" type="file" accept="image/png,image/jpeg" required />

                      <p className="upload-rules">
                        Upload a clear passport-style profile photo with a visible face.
                        White or blue background is recommended. Square 1:1 image preferred.
                        JPG or PNG only. Maximum file size: 5MB.
                      </p>
                    </label>

                    <label className="full-width">
                      Address <span className="required-star">*</span>
                      <textarea name="address" rows={3} required />
                    </label>
                  </>
                )}

                {type === "volunteer" && (
                  <>
                    <label>
                      Volunteer Category <span className="required-star">*</span>
                      <select name="volunteerCategory" required>
                        <option value="">Select</option>
                        <option>Event & Logistics</option>
                        <option>Media & Creative</option>
                        <option>Registration & Admin</option>
                        <option>Choir Support</option>
                        <option>Community Outreach</option>
                        <option>Technical & IT</option>
                        <option>Not Sure Yet</option>
                      </select>
                    </label>

                    <label>
                      Specific Role
                      <input name="specificRole" type="text" placeholder="Photography, sound, admin, etc." />
                    </label>

                    <label>
                      Availability <span className="required-star">*</span>
                      <select name="availability" required>
                        <option value="">Select</option>
                        <option>Weekdays</option>
                        <option>Weekends</option>
                        <option>Evenings</option>
                        <option>Flexible</option>
                      </select>
                    </label>

                    <label>
                      Volunteer Experience
                      <input name="volunteerExperience" type="text" placeholder="Optional" />
                    </label>

                    <label className="full-width">
                      Portfolio / Social Link
                      <input name="portfolio" type="text" placeholder="Optional" />
                    </label>
                  </>
                )}

                <div className="terms-agreement full-width">
                  <label className="checkbox-label">
                    <input name="acceptTerms" type="checkbox" value="Accepted" required />
                    <span>
                      စည်းမျဉ်းစည်းကမ်းများနှင့် အချက်အလက်အသုံးပြုမှုကို သဘောတူလက်ခံပါသည်။
                      <span className="required-star"> *</span>
                    </span>
                  </label>

                  <p className="terms-text-mm">
                    Serenade Singers ၏ registration form တွင် ဖြည့်သွင်းထားသော
                    အချက်အလက်များနှင့် profile photo ကို organization management,
                    member identification, ID card creation, rehearsals, performances,
                    attendance system နှင့် internal administration အတွက်သာ
                    အသုံးပြုမည်ဖြစ်ပါသည်။
                    <br /><br />
                    လူကြီးမင်း၏ personal information နှင့် profile photo များကို
                    Serenade Singers database system အတွင်းတွင်သာ သိမ်းဆည်းအသုံးပြုမည်ဖြစ်ပြီး
                    ခွင့်ပြုချက်မရှိဘဲ public သို့မဟုတ် third-party ထံ မျှဝေမည်မဟုတ်ပါ။
                    <br /><br />
                    Serenade Singers ၏ activities, rehearsals, performances နှင့်
                    community guidelines များကို လေးစားလိုက်နာရန် သဘောတူပါသည်။
                  </p>
                </div>
              </div>

              <button className="btn-primary submit-btn" type="submit" disabled={loading}>
                {loading
                  ? "Submitting..."
                  : type === "member"
                  ? "Submit Member Registration"
                  : "Submit Volunteer Application"}
              </button>

              {message && <p className="form-status">{message}</p>}
            </form>
          </>
        )}
      </section>
    </main>
  );
}
