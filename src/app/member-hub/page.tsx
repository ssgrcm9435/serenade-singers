"use client";

const KBZPAY_INFO = {
  name: "Aung Bhone Myat",
  phone: "09425096424",
  qr: "/images/kbzpay-qr.jpg",
};

import { useEffect, useState } from "react";

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
  "Learning Center",
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
  if (idMatch) return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w400`;
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

  const apiUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || "";

  useEffect(() => {
    const saved = localStorage.getItem("ss_learning_user");
    if (saved) {
      try {
        const savedUser = JSON.parse(saved);
        setUser(savedUser);
        loadHubData(savedUser.type);
        loadShirtHistory(savedUser.gmail);
      } catch {}
    }
  }, []);

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
    };
    reader.readAsDataURL(file);
  }

  async function updateProfilePhoto() {
    setProfileMessage("");

    if (!user?.gmail) {
      setProfileMessage("User not verified.");
      return;
    }

    if (!profilePhoto) {
      setProfileMessage("Please choose a profile photo first.");
      return;
    }

    setLoading(true);

    try {
      const data = await post("updateMemberProfilePhoto", {
        gmail: user.gmail,
        profilePhoto,
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

          <div style={profileCard}>
            <div>
              {user.profilePhotoUrl ? (
                <img
                  src={getDriveImageUrl(user.profilePhotoUrl)}
                  alt={user.fullName}
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid #D4AF37",
                    background: "#ffffff",
                  }}
                />
              ) : (
                <div onClick={() => setShowPhotoMenu(!showPhotoMenu)}
                style={{...avatar,cursor:"pointer"}}>
                  {user.fullName?.charAt(0) || "S"}
                </div>
              )}
            </div>

            <div style={{ flex: 1 }}>
              <p style={profileName}>{user.fullName}</p>
              <p style={profileMeta}>{user.memberId}</p>
              <p style={profileMeta}>{user.type} · {user.voicePart || "-"}</p>

              <div style={{ marginTop: 10 }}>
                

                {profilePhoto && (
                  <button
                    onClick={updateProfilePhoto}
                    disabled={loading}
                    style={{
                      marginTop: 8,
                      border: 0,
                      borderRadius: 999,
                      padding: "7px 12px",
                      fontSize: 11,
                      fontWeight: 800,
                      cursor: "pointer",
                      background: "#D4AF37",
                      color: "#061A2F",
                    }}
                  >
                    Save Photo
                  </button>
                )}

                
                {showPhotoMenu && (
                  <div
                    style={{
                      marginTop:8,
                      background:"#fff",
                      border:"1px solid #E5E7EB",
                      borderRadius:12,
                      padding:8,
                      boxShadow:"0 4px 16px rgba(0,0,0,.12)"
                    }}
                  >
                    <label
                      style={{
                        display:"block",
                        padding:"8px",
                        cursor:"pointer",
                        fontSize:12
                      }}
                    >
                      Upload New Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e)=>handleProfilePhotoFile(e.target.files?.[0]||null)}
                        style={{display:"none"}}
                      />
                    </label>

                    <button
                      onClick={removeProfilePhoto}
                      style={{
                        width:"100%",
                        border:0,
                        background:"transparent",
                        textAlign:"left",
                        padding:"8px",
                        cursor:"pointer",
                        color:"#B91C1C"
                      }}
                    >
                      Remove Photo
                    </button>
                  </div>
                )}

{profileMessage && (
                  <p style={{ marginTop: 8, fontSize: 11, color: "#D4AF37", fontWeight: 800 }}>
                    {profileMessage}
                  </p>
                )}
              </div>
            </div>
          </div>

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

          {activeSection === "Events" && (
            <Section title="Events">
              {events.length === 0 ? <Empty /> : events.map((e, i) => (
                <InfoCard
                  key={i}
                  title={e.eventName}
                  text={e.description}
                  meta={`${e.eventDate || ""} ${e.eventTime || ""} · ${e.location || ""}`}
                />
              ))}
            </Section>
          )}

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

