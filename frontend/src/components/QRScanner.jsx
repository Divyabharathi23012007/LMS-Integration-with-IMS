import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

const QRScanner = ({ onScan, onClose }) => {
  const html5QrCodeRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const scannerId = "qr-reader-box";

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const html5QrCode = new Html5Qrcode(scannerId);
      html5QrCodeRef.current = html5QrCode;

      html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1.0,
          disableFlip: false,
        },
        (decodedText) => {
          // Null out ref so cleanup knows scan already stopped it
          html5QrCodeRef.current = null;
          html5QrCode.stop().then(() => {
            onScan(decodedText);
          }).catch(() => {
            onScan(decodedText);
          });
        },
        () => { /* scan errors — ignore */ }
      ).catch(() => {
        setError("Unable to access camera. Please allow camera permission.");
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      // Only stop if ref still set — means scan did not already stop it
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
        html5QrCodeRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 50,
      display: "flex", alignItems: "center", justifyContent: "center",
      backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)"
    }}>
      <div style={{
        backgroundColor: "white", borderRadius: "20px",
        padding: "28px", width: "100%", maxWidth: "400px",
        margin: "0 16px", border: "1px solid #e2e8f0",
        boxShadow: "0 30px 60px rgba(0,0,0,0.35)"
      }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: 0 }}>
              Scan Your College ID
            </h3>
            <p style={{ fontSize: "13px", color: "#94a3b8", margin: "4px 0 0 0" }}>
              Align QR code within the frame
            </p>
          </div>
          <button onClick={onClose} style={{
            background: "#f1f5f9", border: "none", cursor: "pointer",
            color: "#64748b", display: "flex", alignItems: "center",
            justifyContent: "center", borderRadius: "50%",
            width: "36px", height: "36px"
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>close</span>
          </button>
        </div>

        {/* Scanner Box — single clean feed */}
        <div style={{
          borderRadius: "16px", overflow: "hidden",
          backgroundColor: "#000", marginBottom: "16px",
          position: "relative",
          width: "100%",
          aspectRatio: "1 / 1",
        }}>
          <div id="qr-reader-box" style={{ width: "100%", height: "100%" }} />

          {/* Corner frame overlay */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <div style={{ position: "relative", width: "220px", height: "220px" }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: "28px", height: "28px",
                borderTop: "3px solid #1152d4", borderLeft: "3px solid #1152d4", borderRadius: "6px 0 0 0" }} />
              <div style={{ position: "absolute", top: 0, right: 0, width: "28px", height: "28px",
                borderTop: "3px solid #1152d4", borderRight: "3px solid #1152d4", borderRadius: "0 6px 0 0" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, width: "28px", height: "28px",
                borderBottom: "3px solid #1152d4", borderLeft: "3px solid #1152d4", borderRadius: "0 0 0 6px" }} />
              <div style={{ position: "absolute", bottom: 0, right: 0, width: "28px", height: "28px",
                borderBottom: "3px solid #1152d4", borderRight: "3px solid #1152d4", borderRadius: "0 0 6px 0" }} />
            </div>
          </div>
        </div>

        {/* Status */}
        {error ? (
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            color: "#dc2626", backgroundColor: "#fef2f2",
            padding: "12px 16px", borderRadius: "10px", fontSize: "14px"
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>error</span>
            {error}
          </div>
        ) : (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: "8px", color: "#64748b", fontSize: "13px",
            backgroundColor: "#f8fafc", padding: "10px", borderRadius: "10px"
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: "18px", color: "#1152d4" }}>
              qr_code_scanner
            </span>
            Point camera at the QR code on your college ID
          </div>
        )}
      </div>

      <style>{`
        /* Force html5-qrcode video to fill container cleanly — no duplication */
        #qr-reader-box { position: relative; }
        #qr-reader-box video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          position: absolute !important;
          top: 0 !important; left: 0 !important;
        }
        #qr-reader-box canvas { display: none !important; }
        #qr-reader-box__dashboard { display: none !important; }
        #qr-reader-box__header_message { display: none !important; }
        #qr-reader-box img[alt="Info icon"] { display: none !important; }
        #qr-reader-box img[alt="Camera based scan"] { display: none !important; }
        #qr-reader-box__status_span { display: none !important; }
        #qr-reader-box__camera_selection { display: none !important; }
        #qr-reader-box select { display: none !important; }
        #qr-reader-box button { display: none !important; }
      `}</style>
    </div>
  );
};

export default QRScanner;