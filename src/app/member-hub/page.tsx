"use client";

const KBZPAY_INFO = {
  name: "Aung Bhone Myat",
  phone: "09425096424",
  qr: "/images/kbzpay-qr.jpg",
};

import { useEffect, useRef, useState } from "react";
import { PitchDetector } from "pitchy";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_SIGNALING_URL ||
  "";

import Cropper from "react-easy-crop";

type UserInfo = {
  verified: boolean;
  type: "Member" | "Volunteer";
  memberId: string;
  fullName: string;
  gmail: string;
  voicePart?: string;
  profilePhotoUrl?: string;
};

type LearningVideo = {
  category: string;
  title: string;
  youtubeUrl: string;
  description: string;
  sortOrder: number;
};

type HubItem = Record<string, any>;

const menuItems = [
  "Overview",
  "Announcements",
  "Events",
  "Meetings",
  "Learning Center",
  "Voice Test",
  "Members Directory",
  "Financial Transparency",
  "Documents",
  "Official T-Shirt",
];

function getYouTubeEmbedUrl(url: string) {
  if (!url) return "";
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  return url;
}

function getDriveImageUrl(url: string = "") {
  if (!url) return "";
  const idMatch = url.match(/\/d\/([^/]+)/) || url.match(/[?&]id=([^&]+)/);
  if (idMatch) return `https://lh3.googleusercontent.com/d/${idMatch[1]}=w400`;
  return url;
}




function getMessageStyle(message: string = "") {
  const value = message.toLowerCase();

  if (
    value.includes("access granted") ||
    value.includes("success") ||
    value.includes("verified")
  ) {
    return {
      background: "#ECFDF5",
      border: "1px solid #BBF7D0",
      color: "#166534",
      fontWeight: 900,
      padding: "12px 16px",
      borderRadius: 16,
      marginTop: 16,
    };
  }

  if (
    value.includes("sent") ||
    value.includes("sending") ||
    value.includes("pending") ||
    value.includes("wait")
  ) {
    return {
      background: "#FFF7ED",
      border: "1px solid #FED7AA",
      color: "#C2410C",
      fontWeight: 900,
      padding: "12px 16px",
      borderRadius: 16,
      marginTop: 16,
    };
  }

  return {
    background: "#FEF2F2",
    border: "1px solid #FECACA",
    color: "#B91C1C",
    fontWeight: 900,
    padding: "12px 16px",
    borderRadius: 16,
    marginTop: 16,
  };
}

function getStatusStyle(status: string = "") {
  const value = status.toLowerCase();

  if (
    value.includes("approved") ||
    value.includes("completed") ||
    value.includes("success") ||
    value.includes("active") ||
    value.includes("granted")
  ) {
    return {
      background: "#ECFDF5",
      border: "1px solid #BBF7D0",
      color: "#166534",
      fontWeight: 700,
      padding: "6px 12px",
      borderRadius: "999px",
      display: "inline-block",
    };
  }

  if (
    value.includes("pending") ||
    value.includes("review") ||
    value.includes("awaiting") ||
    value.includes("processing") ||
    value.includes("verification")
  ) {
    return {
      background: "#FFF7ED",
      border: "1px solid #FED7AA",
      color: "#C2410C",
      fontWeight: 700,
      padding: "6px 12px",
      borderRadius: "999px",
      display: "inline-block",
    };
  }

  if (
    value.includes("rejected") ||
    value.includes("failed") ||
    value.includes("expired") ||
    value.includes("denied") ||
    value.includes("inactive")
  ) {
    return {
      background: "#FEF2F2",
      border: "1px solid #FECACA",
      color: "#B91C1C",
      fontWeight: 700,
      padding: "6px 12px",
      borderRadius: "999px",
      display: "inline-block",
    };
  }

  return {};
}


async function getCroppedImage(imageSrc: string, pixelCrop: any): Promise<string> {
  const image = new Image();
  image.src = imageSrc;

  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Canvas not supported.");

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return canvas.toDataURL("image/jpeg", 0.92);
}

export default function MemberHubPage() {
  const [gmail, setGmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [activeSection, setActiveSection] = useState("Overview");
  const [videos, setVideos] = useState<LearningVideo[]>([]);
  const [announcements, setAnnouncements] = useState<HubItem[]>([]);
  const [events, setEvents] = useState<HubItem[]>([]);
  const [financialReports, setFinancialReports] = useState<HubItem[]>([]);
  const [donations, setDonations] = useState<HubItem[]>([]);
  const [assetsRegister, setAssetsRegister] = useState<HubItem[]>([]);
  const [projects, setProjects] = useState<HubItem[]>([]);
  const [documents, setDocuments] = useState<HubItem[]>([]);
  const [shirtHistory, setShirtHistory] = useState<HubItem[]>([]);
  const [membersDirectory, setMembersDirectory] = useState<HubItem[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [amountPaid, setAmountPaid] = useState("18000");
  const [paymentMethod, setPaymentMethod] = useState("KBZPay");
  const [paymentScreenshot, setPaymentScreenshot] = useState("");
  const [paymentMessage, setPaymentMessage] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const apiUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || "";

  useEffect(() => {
    const saved = localStorage.getItem("ss_learning_user");
    if (saved) {
      try {
        const savedUser = JSON.parse(saved);
        setUser(savedUser);
        refreshMemberProfile(savedUser.gmail);
        loadHubData(savedUser.type);
        loadShirtHistory(savedUser.gmail);
      } catch {}
    }
  }, []);

  async function refreshMemberProfile(gmailAddress: string) {
    if (!apiUrl || !gmailAddress) return;

    try {
      const freshUser = await post("checkMemberOrVolunteer", { gmail: gmailAddress });

      if (freshUser?.verified) {
        setUser(freshUser);
        localStorage.setItem("ss_learning_user", JSON.stringify(freshUser));
      }
    } catch {}
  }

  async function post(action: string, payload: Record<string, any> = {}) {
    const res = await fetch(apiUrl, {
      method: "POST",
      body: JSON.stringify({ action, ...payload }),
    });
    return res.json();
  }

  async function loadHubData(type: "Member" | "Volunteer") {
    if (!apiUrl) return;

    const [videoData, announcementData, eventData, financeData, donationData, assetData, projectData, documentData, membersData] =
      await Promise.all([
        post("getLearningVideos", { audience: type }),
        post("getAnnouncements"),
        post("getEvents"),
        post("getFinancialReports"),
        post("getDonations"),
        post("getAssetsRegister"),
        post("getProjects"),
        post("getDocuments"),
        post("getMembersDirectory"),
      ]);

    if (videoData.success) setVideos(videoData.videos || []);
    if (announcementData.success) setAnnouncements(announcementData.items || []);
    if (eventData.success) setEvents(eventData.items || []);
    if (financeData.success) setFinancialReports(financeData.items || []);
    if (donationData.success) setDonations(donationData.items || []);
    if (assetData.success) setAssetsRegister(assetData.items || []);
    if (projectData.success) setProjects(projectData.items || []);
    if (documentData.success) setDocuments(documentData.items || []);
    if (membersData.success) setMembersDirectory(membersData.members || []);
  }


  async function loadShirtHistory(gmailAddress: string) {
    if (!apiUrl || !gmailAddress) return;

    try {
      const data = await post("getMemberShirtHistory", { gmail: gmailAddress });
      if (data.success) {
        setShirtHistory(data.orders || []);
      }
    } catch {}
  }

  async function sendAccessCode() {
    setMessage("");

    if (!gmail.trim()) return setMessage("Please enter your registered Gmail address.");
    if (!apiUrl) return setMessage("Apps Script URL is missing.");

    setLoading(true);

    try {
      const accessData = await post("checkMemberOrVolunteer", { gmail });

      if (!accessData.verified) {
        setMessage(accessData.message || "Access denied.");
        return;
      }

      const otpData = await post("sendOtp", { gmail });

      if (!otpData.success) {
        setMessage(otpData.message || "Unable to send verification code.");
        return;
      }

      setOtpSent(true);
      setMessage("Verification code sent to your Gmail.");
    } catch {
      setMessage("Unable to send verification code.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyAccess() {
    setMessage("");
    setUser(null);

    if (!gmail.trim()) return setMessage("Please enter your registered Gmail address.");
    if (!otp.trim()) return setMessage("Please enter your verification code.");
    if (!apiUrl) return setMessage("Apps Script URL is missing.");

    setLoading(true);
    try {
      const otpData = await post("verifyOtp", { gmail, otp });

      if (!otpData.success) {
        setMessage(otpData.message || "Invalid verification code.");
        return;
      }

      const verifyData = await post("checkMemberOrVolunteer", { gmail });

      if (!verifyData.verified) {
        setMessage(verifyData.message || "Access denied.");
        return;
      }

      setUser(verifyData);
      localStorage.setItem("ss_learning_user", JSON.stringify(verifyData));
      await loadHubData(verifyData.type);
      await loadShirtHistory(verifyData.gmail);
      setMessage("Access granted.");
    } catch {
      setMessage("Unable to verify access. Please try again.");
    } finally {
      setLoading(false);
    }
  }


  function handlePaymentFile(file: File | null) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPaymentScreenshot(String(reader.result || ""));
    };
    reader.readAsDataURL(file);
  }

  async function submitPayment() {
    setPaymentMessage("");

    if (!user?.gmail) {
      setPaymentMessage("User not verified.");
      return;
    }

    if (!selectedOrderId) {
      setPaymentMessage("Please select an order.");
      return;
    }

    if (!paymentScreenshot) {
      setPaymentMessage("Please upload payment screenshot.");
      return;
    }

    setLoading(true);

    try {
      const data = await post("submitTshirtPayment", {
        gmail: user.gmail,
        orderId: selectedOrderId,
        amountPaid,
        paymentMethod,
        paymentScreenshot,
      });

      if (!data.success) {
        setPaymentMessage(data.message || "Payment submission failed.");
        return;
      }

      setPaymentMessage("✅ Payment submitted successfully. Awaiting administrator verification.");
      await loadShirtHistory(user.gmail);
    } catch {
      setPaymentMessage("Unable to submit payment.");
    } finally {
      setLoading(false);
    }
  }


  function handleProfilePhotoFile(file: File | null) {
    setProfileMessage("");

    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setProfilePhoto(String(reader.result || ""));
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  }

  async function updateProfilePhoto(imageData?: string) {
    setProfileMessage("");

    if (!user?.gmail) {
      setProfileMessage("User not verified.");
      return;
    }

    const finalPhoto = imageData || profilePhoto;

    if (!finalPhoto) {
      setProfileMessage("Please choose a profile photo first.");
      return;
    }

    setLoading(true);

    try {
      const data = await post("updateMemberProfilePhoto", {
        gmail: user.gmail,
        profilePhoto: finalPhoto,
      });

      if (!data.success) {
        setProfileMessage(data.message || "Unable to update profile photo.");
        return;
      }

      const updatedUser = {
        ...user,
        profilePhotoUrl: data.profilePhotoUrl || "",
      };

      setUser(updatedUser);
      localStorage.setItem("ss_learning_user", JSON.stringify(updatedUser));
      setProfilePhoto("");
      setShowCropModal(false);
      setProfileMessage("Profile photo updated.");
    } catch {
      setProfileMessage("Unable to update profile photo.");
    } finally {
      setLoading(false);
    }
  }

  async function removeProfilePhoto() {
    setProfileMessage("");

    if (!user?.gmail) {
      setProfileMessage("User not verified.");
      return;
    }

    setLoading(true);

    try {
      const data = await post("removeMemberProfilePhoto", {
        gmail: user.gmail,
      });

      if (!data.success) {
        setProfileMessage(data.message || "Unable to remove profile photo.");
        return;
      }

      const updatedUser = {
        ...user,
        profilePhotoUrl: "",
      };

      setUser(updatedUser);
      localStorage.setItem("ss_learning_user", JSON.stringify(updatedUser));
      setProfilePhoto("");
      
    } catch {
      setProfileMessage("Unable to remove profile photo.");
    } finally {
      setLoading(false);
    }
  }

  async function saveCroppedProfilePhoto() {
    if (!profilePhoto || !croppedAreaPixels) {
      setProfileMessage("Please adjust the photo first.");
      return;
    }

    try {
      const croppedImage = await getCroppedImage(profilePhoto, croppedAreaPixels);
      await updateProfilePhoto(croppedImage);
    } catch {
      setProfileMessage("Unable to crop photo.");
    }
  }

  function logoutMemberHub() {
    localStorage.removeItem("ss_learning_user");
    localStorage.removeItem("ss_member_verified");
    localStorage.removeItem("ss_member_gmail");
    setUser(null);
    setGmail("");
    setOtp("");
    setOtpSent(false);
    setVideos([]);
    setAnnouncements([]);
    setEvents([]);
    setFinancialReports([]);
    setDocuments([]);
    setShirtHistory([]);
    setMessage("Logged out successfully.");
  }

  const groupedVideos = videos.reduce<Record<string, LearningVideo[]>>((acc, v) => {
    const category = v.category || "General";
    if (!acc[category]) acc[category] = [];
    acc[category].push(v);
    return acc;
  }, {});

  const totalIncome = financialReports.reduce((sum, f) => sum + Number(f.income || 0), 0);
  const totalExpense = financialReports.reduce((sum, f) => sum + Number(f.expense || 0), 0);
  const balance = totalIncome - totalExpense;

  if (!user?.verified) {
    return (
      <main style={main}>
        <div style={loginWrap}>
          <p style={eyebrow}>SERENADE SINGERS</p>
          <h1 style={title}>Members Hub</h1>
          <p style={subtitle}>
            Private community portal for registered Serenade Singers Members and Volunteers.
          </p>

          <section style={card}>
            <h2 style={sectionTitle}>Verify Access</h2>
            <p style={muted}>
              Please enter your registered Gmail address to access the Members Hub.
            </p>

            <div style={row}>
              <input
                value={gmail}
                onChange={(e) => setGmail(e.target.value)}
                placeholder="Enter registered Gmail address"
                style={input}
              />

              {!otpSent ? (
                <button onClick={sendAccessCode} disabled={loading} style={button}>
                  {loading ? "Sending..." : "Send Verification Code"}
                </button>
              ) : (
                <>
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter verification code"
                    style={input}
                  />

                  <button onClick={verifyAccess} disabled={loading} style={button}>
                    {loading ? "Verifying..." : "Verify Access"}
                  </button>
                </>
              )}
            </div>

            {message && <p style={getMessageStyle(message)}>{message}</p>}
          </section>
        </div>
      </main>
    );
  }

  return (
    <main style={main}>
      <div className="member-hub-shell" style={shell}>
        <aside className="portal-sidebar" style={sidebar}>
          <p style={sidebarEyebrow}>SERENADE SINGERS</p>
          <h2 style={sidebarTitle}>Members Hub</h2>

          <div
            style={{
              ...profileCard,
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              overflow: "visible",
              padding: 22,
            }}
          >
            <div style={{ position: "relative", width: 132, height: 132 }}>
              <button
                type="button"
                onClick={() => setShowPhotoMenu(!showPhotoMenu)}
                style={{ border: 0, background: "transparent", padding: 0, cursor: "pointer" }}
              >
                {user.profilePhotoUrl ? (
                  <img
                    src={getDriveImageUrl(user.profilePhotoUrl)}
                    alt={user.fullName}
                    style={{
                      width: 126,
                      height: 126,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "4px solid #D4AF37",
                      background: "#ffffff",
                      boxShadow: "0 10px 26px rgba(0,0,0,0.18)",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      ...avatar,
                      width: 126,
                      height: 126,
                      fontSize: 40,
                      border: "4px solid #D4AF37",
                    }}
                  >
                    {user.fullName?.charAt(0) || "S"}
                  </div>
                )}
              </button>

              {showPhotoMenu && (
                <div
                  style={{
                    position: "absolute",
                    top: 136,
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 999,
                    width: 170,
                    background: "#ffffff",
                    border: "1px solid #E5E7EB",
                    borderRadius: 16,
                    padding: 8,
                    boxShadow: "0 18px 40px rgba(0,0,0,0.22)",
                  }}
                >
                  <label style={{ display: "block", padding: "10px 12px", cursor: "pointer", fontSize: 12, fontWeight: 900, color: "#061A2F" }}>
                    Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        handleProfilePhotoFile(e.target.files?.[0] || null);
                        setShowPhotoMenu(false);
                      }}
                      style={{ display: "none" }}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      removeProfilePhoto();
                      setShowPhotoMenu(false);
                    }}
                    style={{
                      width: "100%",
                      border: 0,
                      background: "transparent",
                      textAlign: "center",
                      padding: "10px 12px",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 900,
                      color: "#B91C1C",
                    }}
                  >
                    Remove Photo
                  </button>
                </div>
              )}
            </div>

            <div style={{ marginTop: 18 }}>
              <p style={profileName}>{user.fullName}</p>
              <p style={profileMeta}>{user.memberId}</p>
              <p style={profileMeta}>{user.type} · {user.voicePart || "-"}</p>

              {profilePhoto && (
                <button
                  onClick={() => setShowCropModal(true)}
                  disabled={loading}
                  style={{
                    marginTop: 12,
                    border: 0,
                    borderRadius: 999,
                    padding: "8px 16px",
                    fontSize: 12,
                    fontWeight: 900,
                    cursor: "pointer",
                    background: "#D4AF37",
                    color: "#061A2F",
                  }}
                >
                  Save Photo
                </button>
              )}

              {profileMessage && (
                <p style={{ marginTop: 8, fontSize: 11, color: "#D4AF37", fontWeight: 800 }}>
                  {profileMessage}
                </p>
              )}
            </div>
          </div>


          {showCropModal && profilePhoto && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 9999,
                background: "rgba(0,0,0,0.72)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
              }}
            >
              <div
                style={{
                  width: "min(460px, 95vw)",
                  background: "#ffffff",
                  borderRadius: 24,
                  padding: 20,
                  boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
                }}
              >
                <h3 style={{ margin: "0 0 6px", color: "#061A2F" }}>
                  Edit Profile Photo
                </h3>
                <p style={{ margin: "0 0 14px", fontSize: 12, color: "#6B7280", fontWeight: 700 }}>
                  Drag photo with mouse. Use mouse wheel or slider to zoom.
                </p>

                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: 330,
                    background: "#111827",
                    borderRadius: 18,
                    overflow: "hidden",
                  }}
                >
                  <Cropper
                    image={profilePhoto}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={(_, areaPixels) => setCroppedAreaPixels(areaPixels)}
                  />
                </div>

                <div style={{ marginTop: 16 }}>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.05}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    style={{ width: "100%" }}
                  />
                </div>

                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
                  <button
                    onClick={() => {
                      setShowCropModal(false);
                      setProfilePhoto("");
                    }}
                    style={{
                      border: "1px solid #E5E7EB",
                      background: "#ffffff",
                      borderRadius: 999,
                      padding: "9px 14px",
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    onClick={saveCroppedProfilePhoto}
                    disabled={loading}
                    style={{
                      border: 0,
                      background: "#D4AF37",
                      color: "#061A2F",
                      borderRadius: 999,
                      padding: "9px 16px",
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                  >
                    Save Photo
                  </button>
                </div>
              </div>
            </div>
          )}

          <nav style={nav}>
            {menuItems.map((item) => (
              <button
                key={item}
                onClick={() => setActiveSection(item)}
                style={{
                  ...navButton,
                  ...(activeSection === item ? navButtonActive : {}),
                }}
              >
                {item}
              </button>
            ))}
            <button
              onClick={logoutMemberHub}
              style={{
                ...navButton,
                marginTop: 14,
                background: "#FEF2F2",
                color: "#B91C1C",
                border: "1px solid #FECACA",
              }}
            >
              Logout
            </button>
          </nav>
        </aside>

        <section style={content}>
          <div style={topBar}>
            <div>
              <p style={eyebrow}>MEMBER AREA</p>
              <h1 style={pageTitle}>{activeSection}</h1>
            </div>
            <div style={statusBadge}>Access Granted</div>
          </div>

          {activeSection === "Overview" && (
            <>
              <section style={summaryGrid}>
                <Stat title="Announcements" value={announcements.length} />
                <Stat title="Events" value={events.length} />
                <Stat title="Learning Videos" value={videos.length} />
                <Stat title="Documents" value={documents.length} />
              </section>

              <section style={card}>
                <h2 style={sectionTitle}>Welcome, {user.fullName}</h2>
                <p style={muted}>
                  This is your private Serenade Singers Members Hub. Use the sidebar to access announcements,
                  events, learning resources, financial transparency, documents, and official T-shirt services.
                </p>
              </section>
            </>
          )}

          {activeSection === "Announcements" && (
            <Section title="Announcements">
              {announcements.length === 0 ? <Empty /> : announcements.map((a, i) => (
                <InfoCard key={i} title={a.title} text={a.content} meta={a.category} />
              ))}
            </Section>
          )}

          {activeSection === "Meetings" && <MemberMeetingsPanel />}

          {activeSection === "Events" && <ProfessionalEventsSection events={events || []} />}

          {activeSection === "Financial Transparency" && (
            <Section title="Financial Transparency">
              <h3>Financial Reports</h3>

              {financialReports.length === 0 ? <Empty /> : (
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",background:"#fff"}}>
                    <thead>
                      <tr>
                        <th style={{padding:"12px",borderBottom:"1px solid #ddd"}}>No</th>
                        <th style={{padding:"12px",borderBottom:"1px solid #ddd"}}>Date</th>
                        <th style={{padding:"12px",borderBottom:"1px solid #ddd"}}>Description</th>
                        <th style={{padding:"12px",borderBottom:"1px solid #ddd"}}>Qty</th>
                        <th style={{padding:"12px",borderBottom:"1px solid #ddd"}}>Unit Price</th>
                        <th style={{padding:"12px",borderBottom:"1px solid #ddd"}}>Income</th>
                        <th style={{padding:"12px",borderBottom:"1px solid #ddd"}}>Expense</th>
                        <th style={{padding:"12px",borderBottom:"1px solid #ddd"}}>Balance</th>
                        <th style={{padding:"12px",borderBottom:"1px solid #ddd"}}>Remarks</th>
                        <th style={{padding:"12px",borderBottom:"1px solid #ddd"}}>Reference</th>
                        <th style={{padding:"12px",borderBottom:"1px solid #ddd"}}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {financialReports.map((f, i) => (
                        <tr key={i}>
                          <td style={{padding:"12px",borderBottom:"1px solid #eee"}}>{i+1}</td>
                          <td style={{padding:"12px",borderBottom:"1px solid #eee"}}>
                            {f.date ? new Date(f.date).toLocaleDateString("en-GB") : "-"}
                          </td>
                          <td style={{padding:"12px",borderBottom:"1px solid #eee"}}>
                            <strong>{f.description}</strong>
                            <div style={{fontSize:"12px",color:"#666"}}>{f.purpose}</div>
                          </td>
                          <td style={{padding:"12px",borderBottom:"1px solid #eee"}}>{f.quantity || "-"}</td>
                          <td style={{padding:"12px",borderBottom:"1px solid #eee"}}>{f.unitPrice || "-"}</td>
                          <td style={{padding:"12px",borderBottom:"1px solid #eee"}}>{f.income || 0}</td>
                          <td style={{padding:"12px",borderBottom:"1px solid #eee"}}>{f.expense || 0}</td>
                          <td style={{padding:"12px",borderBottom:"1px solid #eee"}}>{f.balance || 0}</td>
                          <td style={{padding:"12px",borderBottom:"1px solid #eee"}}>{f.remarks || "-"}</td>
                          <td style={{padding:"12px",borderBottom:"1px solid #eee"}}>{f.referenceNo || "-"}</td>
                          <td style={{padding:"12px",borderBottom:"1px solid #eee"}}>{f.status || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <h3 style={{ marginTop: 32 }}>Donations</h3>
              {donations.length === 0 ? <Empty /> : donations.map((d, i) => (
                <InfoCard key={"don-"+i} title={d.donorName} text={d.purpose} meta={`${d.amount || 0} Ks · ${d.status || ""}`} />
              ))}

              <h3 style={{ marginTop: 32 }}>Assets Register</h3>
              {assetsRegister.length === 0 ? <Empty /> : assetsRegister.map((a, i) => (
                <InfoCard key={"asset-"+i} title={a.assetName} text={a.category} meta={`Qty: ${a.quantity || 0} · ${a.condition || ""}`} />
              ))}

              <h3 style={{ marginTop: 32 }}>Projects</h3>
              {projects.length === 0 ? <Empty /> : projects.map((p, i) => (
                <InfoCard key={"proj-"+i} title={p.projectName} text={p.remarks} meta={`Budget: ${p.budget || 0} Ks · Balance: ${p.balance || 0} Ks`} />
              ))}
            </Section>
          )}

          {activeSection === "Documents" && (
            <Section title="Documents">
              {documents.length === 0 ? <Empty /> : documents.map((d, i) => (
                <article key={i} style={infoCard}>
                  <h4 style={infoTitle}>{d.title}</h4>
                  <p style={metaText}>{d.category}</p>
                  <p style={muted}>{d.description}</p>
                  <a
                    href={d.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ ...button, display: "inline-block", marginTop: 14, textDecoration: "none" }}
                  >
                    Open Document
                  </a>
                </article>
              ))}
            </Section>
          )}

          {activeSection === "Learning Center" && (
            <Section title="Learning Center">
              {videos.length === 0 ? <Empty /> : Object.entries(groupedVideos).map(([category, items]) => (
                <div key={category} style={{ marginTop: 28 }}>
                  <h4 style={categoryTitle}>{category}</h4>
                  <div style={grid}>
                    {items.map((video) => (
                      <article key={video.title} style={infoCard}>
                        <div style={videoBox}>
                          <iframe src={getYouTubeEmbedUrl(video.youtubeUrl)} title={video.title} allowFullScreen style={iframe} />
                        </div>
                        <h5 style={infoTitle}>{video.title}</h5>
                        <p style={muted}>{video.description}</p>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </Section>
          )}

          {activeSection === "Voice Test" && (
            <VoiceTestPanel user={user} post={post} loading={loading} setLoading={setLoading} />
          )}

          {activeSection === "Members Directory" && (
            <Section title="Members Directory">
              {membersDirectory.length === 0 ? (
                <Empty />
              ) : (
                <div style={grid}>
                  {membersDirectory.map((m, i) => (
                    <article key={i} style={infoCard}>
                      <h4 style={infoTitle}>{m.fullName}</h4>
                      <p style={metaText}>{m.memberId}</p>
                      <p style={muted}>Voice Part: {m.voicePart || "-"}</p>
                      <p style={muted}>Role: {m.role || "Member"}</p>
                    </article>
                  ))}
                </div>
              )}
            </Section>
          )}

          {activeSection === "Official T-Shirt" && (
            <Section title="Official T-Shirt">
              <div style={infoCard}>
                <h4 style={infoTitle}>T-Shirt Order History</h4>
                <p style={muted}>
                  You can review your previous Official T-Shirt registrations, size, quantity, amount due,
                  and payment status here.
                </p>
              </div>

              {shirtHistory.length === 0 ? (
                <div style={infoCard}>
                  <h4 style={infoTitle}>No Previous T-Shirt Order</h4>
                  <p style={muted}>
                    No T-Shirt registration history was found for your registered Gmail address.
                  </p>
                </div>
              ) : (
                <div style={{ marginTop: 16 }}>
                  {shirtHistory.map((order, i) => (
                    <article key={i} style={infoCard}>
                      <h4 style={infoTitle}>{order.orderId || "T-Shirt Order"}</h4>

                      <p style={metaText}>
                        Size: {order.size || "-"} · Quantity: {order.quantity || "-"} · Amount Due: {Number(order.amountDue || 0).toLocaleString()} MMK
                      </p>

                      <p style={muted}>
                        Order Status: <b>{order.orderStatus || "-"}</b>
                      </p>

                      <p style={muted}>
                        Payment Status: <b>{order.paymentStatus || "Unpaid / Not Submitted"}</b>
                      </p>

                      {order.receiptNo && (
                        <p style={muted}>
                          Receipt No: <b>{order.receiptNo}</b>
                        </p>
                      )}

                      {order.amountPaid && (
                        <p style={muted}>
                          Amount Paid: <b>{Number(order.amountPaid || 0).toLocaleString()} MMK</b>
                        </p>
                      )}

                      {order.paymentMethod && (
                        <p style={muted}>
                          Payment Method: <b>{order.paymentMethod}</b>
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              )}
<div style={infoCard}>
                <h4 style={infoTitle}>Submit T-Shirt Payment</h4>
                <p style={muted}>
                  If your payment has not been submitted yet, please upload your payment screenshot here.
                </p>

                <select
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  style={{ ...input, width: "100%", marginTop: 14 }}
                >
                  <option value="">Select T-Shirt Order</option>
                  {shirtHistory.map((order, i) => (
                    <option key={i} value={order.orderId}>
                      {order.orderId} · Size {order.size} · Qty {order.quantity}
                    </option>
                  ))}
                </select>

                {!selectedOrderId && (
                  <p style={{ ...muted, color: "#ca8a04", fontWeight: 900 }}>
                    Please select an order first before submitting payment.
                  </p>
                )}

                {selectedOrderId && (
                  <p style={{ ...muted, color: "#047857", fontWeight: 900 }}>
                    Order selected. You may now choose payment method and upload screenshot.
                  </p>
                )}

                <input
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder="Amount Paid"
                  style={{ ...input, width: "100%", marginTop: 14 }}
                />

                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  disabled={!selectedOrderId}
                  style={{
                    ...input,
                    width: "100%",
                    marginTop: 14,
                    opacity: selectedOrderId ? 1 : 0.55,
                  }}
                >
                  <option>KBZPay</option>
                  <option>Wave Pay</option>
                  <option>AYA Pay</option>
                  <option>Cash</option>
                  <option>Bank Transfer</option>
                </select>


                {selectedOrderId && paymentMethod === "KBZPay" && (
                  <div style={{ ...infoCard, background: "#f8fafc" }}>
                    <h4 style={infoTitle}>KBZPay Payment Information</h4>
                    <p style={muted}><b>Account Name:</b> {KBZPAY_INFO.name}</p>
                    <p style={muted}><b>Phone Number:</b> {KBZPAY_INFO.phone}</p>

                    <img
                      src={KBZPAY_INFO.qr}
                      alt="KBZPay QR Code"
                      style={{
                        width: 260,
                        maxWidth: "100%",
                        borderRadius: 16,
                        border: "1px solid #e2e8f0",
                        marginTop: 14,
                        background: "white",
                      }}
                    />

                    <p style={muted}>
                      Please transfer to this KBZPay account and upload your payment screenshot.
                    </p>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/png,image/jpeg,application/pdf"
                  onChange={(e) => handlePaymentFile(e.target.files?.[0] || null)}
                  disabled={!selectedOrderId}
                  style={{ marginTop: 14, opacity: selectedOrderId ? 1 : 0.55 }}
                />

                <button
                  onClick={submitPayment}
                  disabled={!selectedOrderId}
                  style={{
                    ...button,
                    display: "inline-block",
                    marginTop: 16,
                    opacity: selectedOrderId ? 1 : 0.55,
                    cursor: selectedOrderId ? "pointer" : "not-allowed",
                  }}
                >
                  Submit Payment
                </button>

                {paymentMessage && <p style={notice}>{paymentMessage}</p>}
              </div>

              <div style={infoCard}>
                <h4 style={infoTitle}>Register New T-Shirt</h4>
                <p style={muted}>
                  If you need to submit a new Official T-Shirt registration, please use the registration page below.
                </p>

                <a
                  href="/tshirt-registration"
                  style={{ ...button, display: "inline-block", marginTop: 16, textDecoration: "none" }}
                >
                  Open T-Shirt Registration
                </a>
              </div>
            </Section>
          )}
        </section>
      </div>

      {loading && <div style={overlay}><div style={spinner} /><h2>Verifying Access...</h2></div>}

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 860px) {
          .member-hub-shell {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 1024px) {
          .member-hub-shell {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 768px) {
          h1 {
            font-size: 32px !important;
          }

          h2 {
            font-size: 24px !important;
          }

          table {
            min-width: 800px !important;
          }

          input,
          select,
          button {
            width: 100% !important;
          }
        }


        @media (max-width: 1024px) {
          .admin-shell,
          .member-hub-shell {
            display: block !important;
            padding: 16px !important;
          }

          .portal-sidebar {
            position: static !important;
            min-height: auto !important;
            width: 100% !important;
            margin-bottom: 20px !important;
            border-radius: 22px !important;
          }

          table {
            min-width: 900px !important;
          }
        }

        @media (max-width: 640px) {
          .admin-shell,
          .member-hub-shell {
            padding: 10px !important;
          }

          h1 {
            font-size: 30px !important;
          }

          h2 {
            font-size: 24px !important;
          }

          input,
          select,
          button {
            max-width: 100% !important;
          }
        }

      `}</style>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={card}>
      <h2 style={sectionTitle}>{title}</h2>
      <div style={{ marginTop: 18 }}>{children}</div>
    </section>
  );
}

function InfoCard({ title, text, meta }: { title?: string; text?: string; meta?: string }) {
  return (
    <article style={infoCard}>
      <h4 style={infoTitle}>{title || "-"}</h4>
      {meta && <p style={metaText}>{meta}</p>}
      <p style={muted}>{text || ""}</p>
    </article>
  );
}

function Stat({ title, value }: { title: string; value: string | number }) {
  return (
    <article style={statCard}>
      <p style={statLabel}>{title}</p>
      <h3 style={statValue}>{value}</h3>
    </article>
  );
}



type VoiceTestPanelProps = {
  user: UserInfo;
  post: (action: string, payload?: Record<string, any>) => Promise<any>;
  loading: boolean;
  setLoading: (value: boolean) => void;
};

function midiToNote(midi: number) {
  const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  return `${names[((midi % 12) + 12) % 12]}${Math.floor(midi / 12) - 1}`;
}

function midiToFrequency(midi: number) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function frequencyToMidi(frequency: number) {
  return Math.round(69 + 12 * Math.log2(frequency / 440));
}

function frequencyToNote(frequency: number) {
  const midi = frequencyToMidi(frequency);
  return { midi, note: midiToNote(midi) };
}

function getCentsDifference(frequency: number, expectedMidi: number) {
  const expectedFrequency = midiToFrequency(expectedMidi);
  return Math.max(-50, Math.min(50, Math.round(1200 * Math.log2(frequency / expectedFrequency))));
}

const MAJOR_SCALE_PATTERN = [0, 2, 4, 5, 7, 9, 11, 12, 11, 9, 7, 5, 4, 2, 0];

function suggestVoiceType(lowMidi: number | null, highMidi: number | null) {
  if (lowMidi === null || highMidi === null) return "Testing";
  if (lowMidi <= 40 && highMidi <= 64) return "Bass";
  if (lowMidi <= 48 && highMidi <= 67) return "Tenor";
  if (lowMidi <= 55 && highMidi <= 74) return "Alto";
  if (highMidi >= 72) return "Soprano";
  return "Choir Voice";
}

function VoiceTestPanel({ user, post, loading, setLoading }: VoiceTestPanelProps) {
  const [running, setRunning] = useState(false);
  const [currentNote, setCurrentNote] = useState("-");
  const [lowestNote, setLowestNote] = useState("-");
  const [highestNote, setHighestNote] = useState("-");
  const [lowestMidi, setLowestMidi] = useState<number | null>(null);
  const [highestMidi, setHighestMidi] = useState<number | null>(null);
  const [currentKey, setCurrentKey] = useState("Auto");
  const [targetKey, setTargetKey] = useState("C Major");
  const [noteHistory, setNoteHistory] = useState<string[]>([]);
  const [pitchLevel, setPitchLevel] = useState(0);
  const [inputLevel, setInputLevel] = useState(0);
  const [scaleRootMidi, setScaleRootMidi] = useState<number | null>(null);
  const [scaleStep, setScaleStep] = useState(0);
  const [expectedNote, setExpectedNote] = useState("-");
  const [evaluation, setEvaluation] = useState("Waiting");
  const [correctCount, setCorrectCount] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const [tunerCents, setTunerCents] = useState(0);
  const [micStatus, setMicStatus] = useState("Not started");
  const [saveMessage, setSaveMessage] = useState("");

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const scaleStepRef = useRef(0);
  const rootMidiRef = useRef<number | null>(null);
  const lastAcceptedMidiRef = useRef<number | null>(null);
  const stableFramesRef = useRef(0);

  const suggestedVoiceType = suggestVoiceType(lowestMidi, highestMidi);

  function stopTest() {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    audioContextRef.current?.close();

    frameRef.current = null;
    streamRef.current = null;
    audioContextRef.current = null;
    analyserRef.current = null;

    setRunning(false);
    setMicStatus("Stopped");
  }

  async function startTest() {
    setSaveMessage("");
    setCurrentNote("-");
    setLowestNote("-");
    setHighestNote("-");
    setLowestMidi(null);
    setHighestMidi(null);
    setCurrentKey("Auto");
    setNoteHistory([]);
    setPitchLevel(0);
    setInputLevel(0);
    setScaleRootMidi(null);
    setScaleStep(0);
    setExpectedNote("-");
    setEvaluation("Listening");
    setCorrectCount(0);
    setAttemptCount(0);
    setTunerCents(0);
    setMicStatus("Requesting microphone...");

    scaleStepRef.current = 0;
    rootMidiRef.current = null;
    lastAcceptedMidiRef.current = null;
    stableFramesRef.current = 0;

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setMicStatus("Microphone API unavailable. Use Chrome with HTTPS.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: true,
        },
      });

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();

      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 4096;
      analyser.smoothingTimeConstant = 0;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const detector = PitchDetector.forFloat32Array(analyser.fftSize);
      const buffer = new Float32Array(analyser.fftSize);

      streamRef.current = stream;
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      setRunning(true);
      setMicStatus("Microphone connected. Sing one steady note.");

      const detect = () => {
        if (!analyserRef.current || !audioContextRef.current) return;

        analyserRef.current.getFloatTimeDomainData(buffer);

        let rms = 0;
        for (let i = 0; i < buffer.length; i++) {
          rms += buffer[i] * buffer[i];
        }

        rms = Math.sqrt(rms / buffer.length);
        const level = Math.min(100, Math.round(rms * 900));
        setInputLevel(level);

        const [pitch, clarity] = detector.findPitch(buffer, audioContextRef.current.sampleRate);

        if (level < 3) {
          setMicStatus("No voice input. Move closer or allow microphone.");
          frameRef.current = requestAnimationFrame(detect);
          return;
        }

        if (pitch < 65 || pitch > 1000 || clarity < 0.55) {
          setMicStatus(`Sound input OK, waiting for stable pitch. Level ${level}%`);
          frameRef.current = requestAnimationFrame(detect);
          return;
        }

        const detected = frequencyToNote(pitch);

        if (lastAcceptedMidiRef.current === detected.midi) {
          stableFramesRef.current += 1;
        } else {
          lastAcceptedMidiRef.current = detected.midi;
          stableFramesRef.current = 1;
        }

        setCurrentNote(`${detected.note} (${Math.round(pitch)} Hz)`);
        setPitchLevel(Math.min(100, Math.max(5, Math.round((pitch / 1000) * 100))));
        setMicStatus(`Pitch detected: ${detected.note}`);

        setLowestMidi((prev) => {
          if (prev === null || detected.midi < prev) {
            setLowestNote(detected.note);
            return detected.midi;
          }
          return prev;
        });

        setHighestMidi((prev) => {
          if (prev === null || detected.midi > prev) {
            setHighestNote(detected.note);
            return detected.midi;
          }
          return prev;
        });

        setNoteHistory((prev) => [...prev, detected.note].slice(-24));

        if (rootMidiRef.current === null && stableFramesRef.current >= 5) {
          rootMidiRef.current = detected.midi;
          setScaleRootMidi(detected.midi);
          setCurrentKey(`${detected.note.replace(/[0-9]/g, "")} Major`);
          setExpectedNote(midiToNote(detected.midi));
        }

        if (rootMidiRef.current !== null) {
          const expectedMidi = rootMidiRef.current + MAJOR_SCALE_PATTERN[scaleStepRef.current];
          const cents = getCentsDifference(pitch, expectedMidi);
          const absCents = Math.abs(cents);

          setTunerCents(cents);
          setExpectedNote(midiToNote(expectedMidi));
          setAttemptCount((count) => count + 1);

          if (absCents <= 35) {
            setEvaluation("Correct");
            setCorrectCount((count) => count + 1);

            if (stableFramesRef.current >= 5) {
              scaleStepRef.current = Math.min(scaleStepRef.current + 1, MAJOR_SCALE_PATTERN.length - 1);
              setScaleStep(scaleStepRef.current);
            }
          } else if (cents < -35) {
            setEvaluation("Flat");
          } else {
            setEvaluation("Sharp");
          }
        }

        frameRef.current = requestAnimationFrame(detect);
      };

      detect();
    } catch (error) {
      console.error(error);
      setMicStatus("Microphone failed. Use Chrome and allow microphone permission.");
      setSaveMessage("Microphone failed. Use Chrome and allow microphone permission.");
      setRunning(false);
    }
  }

  async function saveVoiceAssessment() {
    setSaveMessage("");

    if (lowestMidi === null || highestMidi === null) {
      setSaveMessage("Please test your voice range first.");
      return;
    }

    setLoading(true);

    try {
      const data = await post("saveVoiceAssessment", {
        gmail: user.gmail,
        memberId: user.memberId,
        fullName: user.fullName,
        currentVoicePart: user.voicePart || "",
        lowestNote,
        highestNote,
        lowestMidi,
        highestMidi,
        suggestedVoiceType,
        currentKey,
        targetKey,
        scaleAccuracy: attemptCount ? Math.round((correctCount / attemptCount) * 100) : 0,
        scaleEvaluation: evaluation,
      });

      setSaveMessage(data.success ? "Voice assessment saved successfully." : data.message || "Unable to save voice assessment.");
    } catch {
      setSaveMessage("Unable to save voice assessment.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    return () => stopTest();
  }, []);

  return (
    <Section title="Voice Test">
      <div style={infoCard}>
        <h4 style={infoTitle}>Auto Voice Range Test</h4>
        <p style={muted}>
          Press Start, allow microphone, then sing one steady note first. After detection starts, sing the major scale slowly.
        </p>

        <div style={infoCard}>
          <h4 style={infoTitle}>Major Scale Singing Instruction</h4>
          <p style={muted}>Sing this pattern slowly. Hold each note for 1–2 seconds.</p>
          <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.8, color: "#061A2F" }}>
            Do Re Mi Fa Sol La Ti Do<br />
            Do Ti La Sol Fa Mi Re Do
          </div>
        </div>

        <div style={summaryGrid}>
          <Stat title="Current Note" value={currentNote} />
          <Stat title="Auto Current Key" value={currentKey} />
          <Stat title="Lowest Note" value={lowestNote} />
          <Stat title="Highest Note" value={highestNote} />
          <Stat title="Suggested Voice" value={suggestedVoiceType} />
        </div>

        <div style={visualizerWrap}>
          <div style={visualizerBar}>
            <div style={{ ...visualizerFill, width: `${pitchLevel}%` }} />
          </div>
          <p style={muted}>Live Pitch Visualizer</p>

          <div style={visualizerBar}>
            <div style={{ ...inputLevelFill, width: `${inputLevel}%` }} />
          </div>
          <p style={muted}>Microphone Input Level: {inputLevel}%</p>
          <p style={{ ...muted, fontWeight: 900 }}>Status: {micStatus}</p>
        </div>

        <div style={tunerCard}>
          <h4 style={infoTitle}>Live Pitch Meter</h4>
          <p style={muted}>Flat left, correct center, sharp right.</p>

          <div style={tunerTrack}>
            <div style={tunerCenterLine} />
            <div style={{ ...tunerNeedle, left: `${50 + tunerCents}%` }} />
          </div>

          <div style={tunerLabels}>
            <span>Flat</span>
            <span>Correct</span>
            <span>Sharp</span>
          </div>

          <p style={{ ...muted, fontWeight: 900 }}>
            {tunerCents < -35 ? "Too Low / Flat" : tunerCents > 35 ? "Too High / Sharp" : "Good Pitch / Center"}
          </p>
        </div>

        <div style={evaluationCard}>
          <h4 style={infoTitle}>Major Scale Evaluation</h4>

          <div style={summaryGrid}>
            <Stat title="Scale Step" value={`${Math.min(scaleStep + 1, 15)} / 15`} />
            <Stat title="Expected Note" value={expectedNote} />
            <Stat title="Detected Note" value={currentNote} />
            <Stat title="Result" value={evaluation} />
            <Stat title="Accuracy" value={attemptCount ? `${Math.round((correctCount / attemptCount) * 100)}%` : "0%"} />
          </div>

          <div style={{ fontSize: 20, fontWeight: 900, lineHeight: 1.8, color: "#061A2F" }}>
            Do Re Mi Fa Sol La Ti Do<br />
            Do Ti La Sol Fa Mi Re Do
          </div>
        </div>

        <div style={noteTrail}>
          {noteHistory.length ? noteHistory.map((note, index) => (
            <span key={`${note}-${index}`} style={notePill}>{note}</span>
          )) : <span style={muted}>Detected notes will appear here while singing.</span>}
        </div>

        <div style={row}>
          {!running ? (
            <button onClick={startTest} style={button}>Start Voice Test</button>
          ) : (
            <button onClick={stopTest} style={{ ...button, background: "#B91C1C" }}>Stop Voice Test</button>
          )}

          <button onClick={saveVoiceAssessment} disabled={loading} style={button}>
            {loading ? "Saving..." : "Save Voice Range"}
          </button>
        </div>

        <div style={row}>
          <select value={targetKey} onChange={(e) => setTargetKey(e.target.value)} style={input}>
            {["C Major", "D Major", "E Major", "F Major", "G Major", "A Major", "B♭ Major", "E♭ Major"].map((keyName) => (
              <option key={keyName}>{keyName}</option>
            ))}
          </select>
        </div>

        {saveMessage && <p style={notice}>{saveMessage}</p>}
      </div>
    </Section>
  );
}

function MemberMeetingsPanel() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [meetingId, setMeetingId] = useState("");
  const [passcode, setPasscode] = useState("");
  const [message, setMessage] = useState("");

  async function loadMeetings() {
    if (!BACKEND_URL) {
      setMessage("Backend URL is missing.");
      return;
    }

    const res = await fetch(`${BACKEND_URL}/meetings`);
    const data = await res.json();
    setMeetings(Array.isArray(data) ? data : []);
  }

  async function joinMeeting() {
    setMessage("");

    const res = await fetch(`${BACKEND_URL}/meetings/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meetingId: meetingId.trim().toUpperCase(), passcode: passcode.trim() }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      setMessage(data.message || "Unable to join meeting.");
      return;
    }

    sessionStorage.setItem(
      "ss_meeting_access",
      JSON.stringify({
        meetingId: data.meetingId,
        passcode,
        approvedAt: new Date().toISOString(),
      })
    );

    window.location.href = `/meeting/${data.meetingId}`;
  }

  return (
    <Section title="Meetings">
      <p style={muted}>Join official Serenade Singers online rehearsals, workshops, and management meetings.</p>

      <div style={row}>
        <input style={input} value={meetingId} onChange={(e) => setMeetingId(e.target.value)} placeholder="Meeting ID" />
        <input style={input} value={passcode} onChange={(e) => setPasscode(e.target.value)} placeholder="Passcode" type="password" />
        <button style={button} onClick={joinMeeting}>Join Meeting</button>
        <button style={button} onClick={loadMeetings}>Load Upcoming</button>
      </div>

      {message && <p style={notice}>{message}</p>}

      <div style={{ marginTop: 22, display: "grid", gap: 12 }}>
        {meetings.length === 0 ? (
          <p style={muted}>No meetings loaded yet.</p>
        ) : (
          meetings.map((m) => (
            <article key={m.id || m.meetingId} style={infoCard}>
              <h4 style={infoTitle}>{m.title}</h4>
              <p style={metaText}>{m.startTime ? new Date(m.startTime).toLocaleString() : ""} · {m.status}</p>
              <p style={muted}>Meeting ID: <strong>{m.meetingId}</strong></p>
              <p style={muted}>Ask the host for the passcode.</p>
            </article>
          ))
        )}
      </div>
    </Section>
  );
}


function EventDetailsTable({ event }: { event: any }) {
  const description = String(event.Description || event.description || "");

  const schedule = description
    .split("\\n")
    .filter((line) => line.includes("—") && line.match(/^\\d{2}:\\d{2}/))
    .map((line) => {
      const [time, ...activity] = line.split("—");
      return {
        time: time.trim(),
        activity: activity.join("—").trim(),
      };
    });

  const objectives = description
    .split("\\n")
    .filter((line) => line.trim().startsWith("•"))
    .map((line) => line.replace("•", "").trim());

  return (
    <div style={{ marginTop: 16 }}>
      <table style={eventTable}>
        <tbody>
          <tr>
            <th style={eventTh}>Event Name</th>
            <td style={eventTd}>{event["Event Name"] || event.eventName}</td>
          </tr>
          <tr>
            <th style={eventTh}>Date</th>
            <td style={eventTd}>{event["Event Date"] || event.eventDate}</td>
          </tr>
          <tr>
            <th style={eventTh}>Time</th>
            <td style={eventTd}>{event["Event Time"] || event.eventTime}</td>
          </tr>
          <tr>
            <th style={eventTh}>Location</th>
            <td style={eventTd}>{event.Location || event.location}</td>
          </tr>
          <tr>
            <th style={eventTh}>Category</th>
            <td style={eventTd}>{event.Category || event.category}</td>
          </tr>
          <tr>
            <th style={eventTh}>Status</th>
            <td style={eventTd}>
              <span style={eventStatus}>
                {event.Status || event.status}
              </span>
            </td>
          </tr>
          <tr>
            <th style={eventTh}>Organizer</th>
            <td style={eventTd}>Serenade Singers</td>
          </tr>
        </tbody>
      </table>

      {schedule.length > 0 && (
        <>
          <h3 style={eventSubTitle}>Program Schedule</h3>
          <table style={eventTable}>
            <thead>
              <tr>
                <th style={eventTh}>Time</th>
                <th style={eventTh}>Activity</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((item, index) => (
                <tr key={index}>
                  <td style={eventTd}>{item.time}</td>
                  <td style={eventTd}>{item.activity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {objectives.length > 0 && (
        <>
          <h3 style={eventSubTitle}>Event Objectives</h3>
          <ul style={eventList}>
            {objectives.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

const eventTable = {
  width: "100%",
  borderCollapse: "collapse" as const,
  marginTop: 14,
  overflow: "hidden",
  borderRadius: 16,
};

const eventTh = {
  textAlign: "left" as const,
  padding: "12px 14px",
  background: "#061A2F",
  color: "#D4AF37",
  border: "1px solid #dbe3ee",
  fontWeight: 900,
  width: "28%",
};

const eventTd = {
  padding: "12px 14px",
  background: "#ffffff",
  color: "#0f172a",
  border: "1px solid #dbe3ee",
  lineHeight: 1.6,
};

const eventStatus = {
  display: "inline-block",
  padding: "6px 12px",
  borderRadius: 999,
  background: "#DCFCE7",
  color: "#166534",
  fontWeight: 900,
};

const eventSubTitle = {
  marginTop: 24,
  marginBottom: 10,
  color: "#061A2F",
  fontSize: 20,
  fontWeight: 900,
};

const eventList = {
  marginTop: 10,
  paddingLeft: 22,
  lineHeight: 1.8,
  color: "#334155",
};


function ProfessionalEventsSection({ events }: { events: any[] }) {
  const list = Array.isArray(events) ? events : [];

  const upcoming = list.filter((event) =>
    String(event.Status || event.status || "").toLowerCase() !== "completed"
  );

  const history = list.filter((event) =>
    String(event.Status || event.status || "").toLowerCase() === "completed"
  );

  return (
    <Section title="Events">
      <h3 style={eventGroupTitle}>Upcoming Events</h3>

      {upcoming.length === 0 ? (
        <p style={metaText}>No upcoming events.</p>
      ) : (
        upcoming.map((event, index) => (
          <ProfessionalEventCard key={`upcoming-${index}`} event={event} />
        ))
      )}

      <h3 style={eventGroupTitle}>Event History</h3>

      {history.length === 0 ? (
        <p style={metaText}>No completed event history.</p>
      ) : (
        history.map((event, index) => (
          <ProfessionalEventCard key={`history-${index}`} event={event} isHistory />
        ))
      )}
    </Section>
  );
}

function ProfessionalEventCard({
  event,
  isHistory = false,
}: {
  event: any;
  isHistory?: boolean;
}) {
  const name = event["Event Name"] || event.eventName || "Untitled Event";
  const date = formatEventDate(event["Event Date"] || event.eventDate || "");
  const time = event["Event Time"] || event.eventTime || "";
  const location = event.Location || event.location || "";
  const category = event.Category || event.category || "";
  const status = event.Status || event.status || "";
  const description = String(event.Description || event.description || "");

  const schedule = extractSchedule(description);
  const objectives = extractObjectives(description);

  return (
    <article style={isHistory ? historyCard : infoCard}>
      <div style={eventCardHeader}>
        <div>
          <h3 style={infoTitle}>{name}</h3>
          <p style={metaText}>{date} · {time} · {location}</p>
        </div>
        <span style={isHistory ? completedBadge : activeBadge}>{status}</span>
      </div>

      <table style={eventTable}>
        <tbody>
          <tr>
            <th style={eventTh}>Event Name</th>
            <td style={eventTd}>{name}</td>
          </tr>
          <tr>
            <th style={eventTh}>Date</th>
            <td style={eventTd}>{date}</td>
          </tr>
          <tr>
            <th style={eventTh}>Time</th>
            <td style={eventTd}>{time}</td>
          </tr>
          <tr>
            <th style={eventTh}>Location</th>
            <td style={eventTd}>{location}</td>
          </tr>
          <tr>
            <th style={eventTh}>Category</th>
            <td style={eventTd}>{category}</td>
          </tr>
          <tr>
            <th style={eventTh}>Status</th>
            <td style={eventTd}>{status}</td>
          </tr>
          <tr>
            <th style={eventTh}>Organizer</th>
            <td style={eventTd}>Serenade Singers</td>
          </tr>
        </tbody>
      </table>

      {schedule.length > 0 && (
        <>
          <h4 style={eventSubTitle}>Program Schedule</h4>
          <table style={eventTable}>
            <thead>
              <tr>
                <th style={eventTh}>Time</th>
                <th style={eventTh}>Activity</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((item, index) => (
                <tr key={index}>
                  <td style={eventTd}>{item.time}</td>
                  <td style={eventTd}>{item.activity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {objectives.length > 0 && (
        <>
          <h4 style={eventSubTitle}>Event Objectives</h4>
          <ul style={eventList}>
            {objectives.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </>
      )}
    </article>
  );
}

function extractSchedule(description: string) {
  return description
    .split(/\n|(?=\d{2}:\d{2}[–-]\d{2}:\d{2})/g)
    .map((line) => line.trim())
    .filter((line) => /^\d{2}:\d{2}[–-]\d{2}:\d{2}/.test(line) && line.includes("—"))
    .map((line) => {
      const [time, ...activity] = line.split("—");
      return { time: time.trim(), activity: activity.join("—").trim() };
    });
}

function extractObjectives(description: string) {
  return description
    .split(/\n|(?=•)/g)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("•"))
    .map((line) => line.replace("•", "").trim());
}

function formatEventDate(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}


function Empty() {
  return <p style={muted}>No data available yet.</p>;
}

const main = { minHeight: "100vh", background: "#f8f6f2", color: "#061A2F" };
const loginWrap = { maxWidth: 900, margin: "0 auto", padding: "72px 24px" };
const shell = {
  display: "grid",
  gridTemplateColumns: "300px 1fr",
  gap: 28,
  maxWidth: 1380,
  margin: "0 auto",
  padding: "32px 24px",
} as React.CSSProperties;
const sidebar = {
  position: "sticky" as const,
  top: 24,
  alignSelf: "start",
  background: "#061A2F",
  color: "white",
  borderRadius: 30,
  padding: 24,
  minHeight: "calc(100vh - 64px)",
  boxShadow: "0 22px 60px rgba(6,26,47,0.18)",
};
const content = { minWidth: 0 };
const eyebrow = { fontWeight: 900, letterSpacing: "0.18em", color: "#C9A24A", fontSize: 13 };
const title = { marginTop: 16, fontSize: 46, lineHeight: 1.1, fontWeight: 950 };
const pageTitle = { marginTop: 8, fontSize: 42, lineHeight: 1.1, fontWeight: 950 };
const subtitle = { marginTop: 16, fontSize: 17, color: "#475569", maxWidth: 760 };
const card = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 28,
  padding: 28,
  marginTop: 28,
  boxShadow: "0 18px 45px rgba(15,23,42,0.06)",
};
const sectionTitle = { fontSize: 30, fontWeight: 950 };
const row = { display: "flex", gap: 12, flexWrap: "wrap" as const, marginTop: 18 };
const input = { border: "1px solid #cbd5e1", borderRadius: 16, padding: "14px 16px", fontSize: 15, flex: 1, minWidth: 260 };
const button = { background: "#061A2F", color: "white", border: 0, borderRadius: 16, padding: "14px 22px", fontWeight: 900, cursor: "pointer" };
const muted = { marginTop: 8, color: "#64748b", lineHeight: 1.8 };
const notice = { marginTop: 16, fontWeight: 800, color: "#b91c1c" };
const sidebarEyebrow = { color: "#C9A24A", fontWeight: 900, letterSpacing: "0.15em", fontSize: 12 };
const sidebarTitle = { marginTop: 8, fontSize: 28, fontWeight: 950 };
const profileCard = { display: "flex", gap: 14, alignItems: "center", marginTop: 24, padding: 16, borderRadius: 22, background: "rgba(255,255,255,0.08)" };
const avatar = { width: 48, height: 48, borderRadius: "50%", background: "#C9A24A", color: "#061A2F", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 950, fontSize: 22 };
const profileName = { margin: 0, fontWeight: 900 };
const profileMeta = { margin: "4px 0 0", color: "#cbd5e1", fontSize: 13 };
const nav = { display: "grid", gap: 8, marginTop: 24 };
const navButton = { textAlign: "left" as const, border: 0, borderRadius: 16, padding: "13px 14px", background: "transparent", color: "#e2e8f0", fontWeight: 800, cursor: "pointer" };
const navButtonActive = { background: "#C9A24A", color: "#061A2F" };
const topBar = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, background: "white", border: "1px solid #e2e8f0", borderRadius: 28, padding: 28, boxShadow: "0 18px 45px rgba(15,23,42,0.06)" };
const statusBadge = { background: "#ecfdf5", color: "#047857", border: "1px solid #bbf7d0", borderRadius: 999, padding: "10px 16px", fontWeight: 900 };
const summaryGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginTop: 28 };
const statCard = { background: "white", border: "1px solid #e2e8f0", borderRadius: 24, padding: 22, boxShadow: "0 12px 30px rgba(15,23,42,0.04)" };
const statLabel = { margin: 0, color: "#64748b", fontWeight: 800 };
const statValue = { margin: "10px 0 0", fontSize: 24, fontWeight: 950 };
const infoCard = { padding: 20, borderRadius: 22, border: "1px solid #e2e8f0", background: "#f8fafc", marginTop: 14 };
const infoTitle = { margin: 0, fontSize: 20, fontWeight: 950 };
const metaText = { marginTop: 8, color: "#C9A24A", fontWeight: 900 };
const categoryTitle = { fontSize: 24, fontWeight: 950 };
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginTop: 16 };
const videoBox = { position: "relative" as const, width: "100%", paddingTop: "56.25%", borderRadius: 18, overflow: "hidden", background: "#e2e8f0" };
const iframe = { position: "absolute" as const, inset: 0, width: "100%", height: "100%", border: 0 };
const overlay = { position: "fixed" as const, inset: 0, background: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" as const, zIndex: 99999, gap: 16 };
const spinner = { width: 64, height: 64, border: "6px solid #e5e7eb", borderTop: "6px solid #061A2F", borderRadius: "50%", animation: "spin 1s linear infinite" };


function getPaymentStatusColor(status: string) {
  const value = String(status || "").toLowerCase();

  if (value.includes("completed") || value.includes("approved")) {
    return "#047857";
  }

  if (value.includes("pending")) {
    return "#ca8a04";
  }

  if (value.includes("reject")) {
    return "#dc2626";
  }

  return "#475569";
}



const smallCropButton = {
  border: "1px solid #E5E7EB",
  background: "#F8FAFC",
  color: "#061A2F",
  borderRadius: 10,
  padding: "9px 10px",
  fontWeight: 900,
  cursor: "pointer",
};


const eventGroupTitle = {
  marginTop: 28,
  marginBottom: 14,
  fontSize: 24,
  fontWeight: 900,
  color: "#061A2F",
};

const historyCard = {
  ...infoCard,
  borderLeft: "6px solid #22C55E",
  background: "#F8FAFC",
};

const historyHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 16,
  flexWrap: "wrap" as const,
};

const completedBadge = {
  display: "inline-block",
  padding: "8px 14px",
  borderRadius: 999,
  background: "#DCFCE7",
  color: "#166534",
  fontWeight: 900,
};


const eventCardHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 16,
  flexWrap: "wrap" as const,
};

const activeBadge = {
  display: "inline-block",
  padding: "8px 14px",
  borderRadius: 999,
  background: "#FEF3C7",
  color: "#92400E",
  fontWeight: 900,
};








const visualizerWrap = {
  marginTop: 20,
  padding: 18,
  borderRadius: 18,
  background: "#F8FAFC",
  border: "1px solid #E5E7EB",
};

const visualizerBar = {
  width: "100%",
  height: 18,
  borderRadius: 999,
  overflow: "hidden",
  background: "#E5E7EB",
};

const visualizerFill = {
  height: "100%",
  borderRadius: 999,
  background: "linear-gradient(90deg, #1D4ED8, #16A34A)",
  transition: "width 0.15s ease",
};

const noteTrail = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap" as const,
  marginTop: 16,
};

const notePill = {
  padding: "8px 12px",
  borderRadius: 999,
  background: "#EEF2FF",
  color: "#1E3A8A",
  fontWeight: 900,
};


const evaluationCard = {
  marginTop: 20,
  padding: 20,
  borderRadius: 22,
  background: "#FFFFFF",
  border: "1px solid #CBD5E1",
  boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
};


const tunerCard = {
  marginTop: 20,
  padding: 20,
  borderRadius: 22,
  background: "#F8FAFC",
  border: "1px solid #CBD5E1",
};

const tunerTrack = {
  position: "relative" as const,
  height: 38,
  borderRadius: 999,
  background: "linear-gradient(90deg, #FCA5A5, #FEF3C7, #BBF7D0, #FEF3C7, #FCA5A5)",
  overflow: "hidden",
  border: "1px solid #CBD5E1",
};

const tunerCenterLine = {
  position: "absolute" as const,
  left: "50%",
  top: 0,
  width: 3,
  height: "100%",
  background: "#061A2F",
  transform: "translateX(-50%)",
};

const tunerNeedle = {
  position: "absolute" as const,
  top: 3,
  width: 8,
  height: 32,
  borderRadius: 999,
  background: "#111827",
  transform: "translateX(-50%)",
  transition: "left 0.12s ease",
};

const tunerLabels = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: 8,
  fontWeight: 900,
  color: "#061A2F",
};


const inputLevelFill = {
  height: "100%",
  borderRadius: 999,
  background: "linear-gradient(90deg, #F59E0B, #22C55E)",
  transition: "width 0.1s ease",
};
