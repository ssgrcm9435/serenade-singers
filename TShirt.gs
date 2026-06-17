python3 - <<'PY'
from pathlib import Path

p = Path("src/app/member-hub/page.tsx")
s = p.read_text()

s = s.replace(
'const [gmail, setGmail] = useState("");',
'''const [gmail, setGmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);'''
)

s = s.replace(
'''  async function verifyAccess() {
    setMessage("");
    setUser(null);

    if (!gmail.trim()) return setMessage("Please enter your registered Gmail address.");
    if (!apiUrl) return setMessage("Apps Script URL is missing.");

    setLoading(true);
    try {
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
  }''',
'''  async function sendAccessCode() {
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
  }'''
)

s = s.replace(
'''            <div style={row}>
              <input
                value={gmail}
                onChange={(e) => setGmail(e.target.value)}
                placeholder="Enter registered Gmail address"
                style={input}
              />
              <button onClick={verifyAccess} disabled={loading} style={button}>
                {loading ? "Verifying..." : "Verify Access"}
              </button>
            </div>''',
'''            <div style={row}>
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
            </div>'''
)

p.write_text(s)
print("✅ Members Hub security updated: Gmail + OTP first login")
PY

npm run build && git add . && git commit -m "Add OTP verification to Members Hub login" && git pull --rebase origin main && git push origin main