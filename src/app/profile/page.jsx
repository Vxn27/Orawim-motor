"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

function InfoCard({ label, value, multiline = false, delay = 0 }) {
  const [hover, setHover] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 20 + delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? "#141414" : "#0f0f0f",
        border: hover ? "1px solid rgba(220,38,38,0.35)" : "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        padding: "22px 24px",
        cursor: "default",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(10px)",
        transition: "border-color 0.2s, background 0.2s, opacity 0.4s ease, transform 0.4s ease",
      }}
    >
      <p
        style={{
          fontSize: "11px",
          textTransform: "uppercase",
          letterSpacing: "2.5px",
          color: "#6b7280",
          marginBottom: "8px",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: multiline ? "15px" : "17px",
          fontWeight: 600,
          color: value ? "rgba(255,255,255,0.9)" : "#4b5563",
          fontStyle: value ? "normal" : "italic",
          lineHeight: multiline ? 1.65 : "normal",
        }}
      >
        {value || "—"}
      </p>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // page-level mount transition (replaces fadeIn / fadeInUp keyframes)
  const [pageVisible, setPageVisible] = useState(false);
  const [cardVisible, setCardVisible] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [leftVisible, setLeftVisible] = useState(false);
  const [rightVisible, setRightVisible] = useState(false);
  const [avatarVisible, setAvatarVisible] = useState(false);

  // spinner rotation (replaces @keyframes spin)
  const [spinAngle, setSpinAngle] = useState(0);
  const rafRef = useRef(null);

  // role badge pulse (replaces @keyframes badgePulse)
  const [pulseOn, setPulseOn] = useState(false);

  // back-button press state (replaces transform on mousedown/up)
  const [btnPressed, setBtnPressed] = useState(false);
  const [btnHover, setBtnHover] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setPageVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (loading) {
      let start;
      const tick = (ts) => {
        if (start === undefined) start = ts;
        const elapsed = ts - start;
        setSpinAngle((elapsed / 800) * 360);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(rafRef.current);
    }
  }, [loading]);

  useEffect(() => {
    if (!profile) return;
    const timers = [
      setTimeout(() => setCardVisible(true), 0),
      setTimeout(() => setHeaderVisible(true), 100),
      setTimeout(() => setLeftVisible(true), 180),
      setTimeout(() => setRightVisible(true), 220),
      setTimeout(() => setAvatarVisible(true), 300),
    ];
    const pulseStart = setTimeout(() => {
      const interval = setInterval(() => {
        setPulseOn((p) => !p);
      }, 1200);
      return () => clearInterval(interval);
    }, 1200);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(pulseStart);
    };
  }, [profile]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/me");
        const data = await res.json();
        if (!res.ok || !data.success) {
          router.push("/login");
          return;
        }
        setProfile(data.user);
      } catch (error) {
        console.error("Failed to load profile:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  const initials = profile?.name
    ? profile.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  const [windowWidth, setWindowWidth] = useState(0);
  useEffect(() => {
    const updateWidth = () => setWindowWidth(window.innerWidth);
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const isMobile = windowWidth > 0 ? windowWidth <= 520 : false;
  const isTablet = windowWidth > 0 ? windowWidth <= 820 : false;
  const isDesktop = windowWidth > 0 ? windowWidth >= 1024 : true;

  const profileBodyStyle = {
    display: "grid",
    gridTemplateColumns: isTablet ? "1fr" : isDesktop ? "340px 1fr" : "300px 1fr",
    gap: isMobile ? 16 : isTablet ? 24 : 32,
    padding: isMobile ? 18 : isTablet ? 24 : 40,
  };

  const leftPanelStyle = {
    background: "#0f0f0f",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 22,
    padding: isTablet && !isMobile ? 24 : "36px 24px",
    display: "flex",
    flexDirection: isTablet && !isMobile ? "row" : "column",
    alignItems: isTablet && !isMobile ? "flex-start" : "center",
    textAlign: isTablet && !isMobile ? "left" : "center",
    gap: isTablet && !isMobile ? 24 : 20,
    opacity: leftVisible ? 1 : 0,
    transform: leftVisible ? "translateX(0)" : "translateX(-28px)",
    transition: "opacity 0.55s cubic-bezier(0.22,1,0.36,1), transform 0.55s cubic-bezier(0.22,1,0.36,1)",
  };

  const rightPanelStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 20,
    opacity: rightVisible ? 1 : 0,
    transform: rightVisible ? "translateX(0)" : "translateX(28px)",
    transition: "opacity 0.55s cubic-bezier(0.22,1,0.36,1), transform 0.55s cubic-bezier(0.22,1,0.36,1)",
  };

  const infoGridStyle = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
    gap: 20,
  };

  const uidBoxStyle = {
    width: "100%",
    background: "rgba(0,0,0,0.4)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: "14px 16px",
    textAlign: "left",
    marginTop: 6,
    display: isTablet ? "none" : "block",
  };

  const backLabelStyle = {
    display: isMobile ? "none" : "inline",
  };

  if (loading) {
    return (
      <section
        style={{
          minHeight: "100vh",
          background: "#050505",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: pageVisible ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              border: "2px solid transparent",
              borderBottomColor: "#dc2626",
              transform: `rotate(${spinAngle}deg)`,
              margin: "0 auto",
            }}
          />
          <p style={{ color: "#9ca3af", marginTop: 16, fontSize: 14, letterSpacing: "0.05em" }}>
            Memuat profil...
          </p>
        </div>
      </section>
    );
  }

  if (!profile) return null;

  return (
    <section
      style={{
        minHeight: "100vh",
        background: "#050505",
        padding: "clamp(24px, 4vw, 60px) clamp(12px, 3vw, 24px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: pageVisible ? 1 : 0,
        transition: "opacity 0.3s ease",
      }}
    >
      {/* OUTER CARD */}
      <div
        style={{
          maxWidth: 1100,
          maxHeight: "90vh",
          width: "100%",
          margin: "auto",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: 28,
          overflow: "hidden",
          boxShadow: "0 8px 56px rgba(220,38,38,0.09)",
          opacity: cardVisible ? 1 : 0,
          transform: cardVisible ? "translateY(0)" : "translateY(36px)",
          transition: "opacity 0.45s cubic-bezier(0.22,1,0.36,1), transform 0.45s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            background: "#0f0f0f",
            borderBottom: "1px solid rgba(255,255,255,0.09)",
            padding: "28px 36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            opacity: headerVisible ? 1 : 0,
            transform: headerVisible ? "translateX(0)" : "translateX(-28px)",
            transition: "opacity 0.5s cubic-bezier(0.22,1,0.36,1), transform 0.5s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <div>
            <p
              style={{
                fontSize: 11,
                letterSpacing: "4px",
                color: "#f87171",
                textTransform: "uppercase",
                fontWeight: 500,
                marginBottom: 6,
              }}
            >
              Akun Saya
            </p>
            <h1
              style={{
                fontSize: "clamp(24px, 3vw, 32px)",
                fontWeight: 800,
                color: "#fff",
                letterSpacing: "-0.5px",
              }}
            >
              Profil Pengguna
            </h1>
          </div>

          <button
            onClick={() => router.push("/")}
            onMouseEnter={() => setBtnHover(true)}
            onMouseLeave={() => {
              setBtnHover(false);
              setBtnPressed(false);
            }}
            onMouseDown={() => setBtnPressed(true)}
            onMouseUp={() => setBtnPressed(false)}
            style={{
              background: btnHover ? "#b91c1c" : "#dc2626",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "12px 24px",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
              transform: btnPressed ? "scale(0.95)" : "scale(1)",
              transition: "background 0.15s, transform 0.1s",
            }}
          >
            ← <span style={backLabelStyle}>Kembali</span>
          </button>
        </div>

        {/* BODY — responsive with inline styles */}
        <div style={profileBodyStyle}>
          {/* LEFT PANEL */}
          <div style={leftPanelStyle}>
            {/* Avatar */}
            <div
              style={{
                width: 110,
                height: 110,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #dc2626, #7f1d1d)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 40,
                fontWeight: 900,
                color: "#fff",
                letterSpacing: "-1px",
                flexShrink: 0,
                outline: "2.5px solid rgba(220,38,38,0.4)",
                outlineOffset: 4,
                opacity: avatarVisible ? 1 : 0,
                transform: avatarVisible ? "scale(1)" : "scale(0.7)",
                transition: "opacity 0.55s cubic-bezier(0.22,1,0.36,1), transform 0.55s cubic-bezier(0.22,1,0.36,1)",
              }}
            >
              {initials}
            </div>

            {/* Name + role */}
            <div>
              <p style={{ fontSize: 20, fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>
                {profile.name || "—"}
              </p>
              <span
                style={{
                  display: "inline-block",
                  padding: "6px 16px",
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 600,
                  background: "rgba(220,38,38,0.15)",
                  color: "#f87171",
                  border: "1px solid rgba(220,38,38,0.25)",
                  textTransform: "capitalize",
                  marginTop: 10,
                  boxShadow: pulseOn
                    ? "0 0 0 8px rgba(220,38,38,0)"
                    : "0 0 0 0 rgba(220,38,38,0.45)",
                  transition: "box-shadow 1.2s ease-in-out",
                }}
              >
                {profile.role}
              </span>
            </div>

          </div>

          {/* RIGHT PANEL */}
          <div style={rightPanelStyle}>
            <InfoCard label="Email" value={profile.email} delay={0} />

            <div style={infoGridStyle}>
              <InfoCard label="Nomor Telepon" value={profile.notelp} delay={40} />
              <InfoCard
                label="Bergabung"
                delay={40}
                value={
                  profile.created_at
                    ? new Date(profile.created_at).toLocaleString("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : undefined
                }
              />
            </div>

            <InfoCard label="Alamat" value={profile.alamat} multiline delay={80} />
          </div>
        </div>
      </div>
    </section>
  );
}