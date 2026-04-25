import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL = "http://localhost:8000";
const WS_URL   = "ws://localhost:8000";
const getToken = () => localStorage.getItem("token");
const H = () => ({ Authorization: `Bearer ${getToken()}` });

const STYLES = `
@keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
@keyframes msgIn  { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:none} }
`;

const Avatar = ({ username, avatar, size = 36 }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%", flexShrink: 0,
    background: avatar ? `url(${avatar}) center/cover` : "linear-gradient(135deg,#7c3aed,#5b21b6)",
    backgroundSize: "cover", backgroundPosition: "center",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "white", fontWeight: "800", fontSize: size * 0.35,
  }}>
    {!avatar && username?.[0]?.toUpperCase()}
  </div>
);

const ChatPage = () => {
  const { partnerId } = useParams();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages]           = useState([]);
  const [input, setInput]                 = useState("");
  const [partnerInfo, setPartnerInfo]     = useState(null);
  const [myId, setMyId]                   = useState(null);
  const [wsReady, setWsReady]             = useState(false);

  const wsRef        = useRef(null);
  const partnerIdRef = useRef(partnerId); // always up-to-date in WS handler
  const endRef       = useRef(null);

  // Keep ref in sync with param
  useEffect(() => { partnerIdRef.current = partnerId; }, [partnerId]);

  // ── 1. Get my user id ──────────────────────────────────────
  useEffect(() => {
    axios.get(`${BASE_URL}/auth/me`, { headers: H() })
      .then(r => setMyId(r.data.id))
      .catch(() => {});
  }, []);

  // ── 2. Single WebSocket — created once when myId is ready ──
  useEffect(() => {
    if (!myId) return;

    const connect = () => {
      const ws = new WebSocket(`${WS_URL}/chat/ws/${getToken()}`);
      wsRef.current = ws;

      ws.onopen = () => setWsReady(true);

      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        const pid = partnerIdRef.current;

        // Add to current conversation only
        if (
          pid &&
          (String(msg.sender_id)   === String(pid) ||
           String(msg.receiver_id) === String(pid))
        ) {
          setMessages(prev =>
            prev.find(m => m.id === msg.id) ? prev : [...prev, msg]
          );
        }
        // Refresh sidebar
        fetchConversations();
      };

      ws.onclose = () => {
        setWsReady(false);
        // Auto-reconnect after 2s
        setTimeout(connect, 2000);
      };

      ws.onerror = () => ws.close();
    };

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.onclose = null; // prevent reconnect on unmount
        wsRef.current.close();
      }
    };
  }, [myId]); // eslint-disable-line

  // ── 3. Conversations list ──────────────────────────────────
  const fetchConversations = useCallback(async () => {
    try {
      const r = await axios.get(`${BASE_URL}/chat/conversations`, { headers: H() });
      setConversations(r.data);
    } catch {}
  }, []);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  // ── 4. Load history + partner info when partnerId changes ──
  useEffect(() => {
    if (!partnerId) { setMessages([]); setPartnerInfo(null); return; }

    // Load message history
    axios.get(`${BASE_URL}/chat/history/${partnerId}`, { headers: H() })
      .then(r => setMessages(r.data))
      .catch(() => setMessages([]));

    // Try to get partner info from conversations first
    setPartnerInfo(null);
  }, [partnerId]);

  // Set partnerInfo from conversations once loaded
  useEffect(() => {
    if (!partnerId || !conversations.length) return;
    const conv = conversations.find(c => String(c.partner_id) === String(partnerId));
    if (conv) {
      setPartnerInfo({ username: conv.partner_username, avatar: conv.partner_avatar });
    }
  }, [partnerId, conversations]);

  // Also fetch partner from friends/search if not found yet
  useEffect(() => {
    if (!partnerId || partnerInfo) return;
    // Try fetching from public profile
    axios.get(`${BASE_URL}/friends/user/${partnerId}`, { headers: H() })
      .then(r => setPartnerInfo({ username: r.data.username, avatar: r.data.avatar_url }))
      .catch(() => {});
  }, [partnerId, partnerInfo]);

  // ── 5. Scroll to bottom ────────────────────────────────────
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── 6. Send message ────────────────────────────────────────
  const sendMessage = () => {
    const ws = wsRef.current;
    if (!input.trim() || !ws) return;

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        receiver_id: Number(partnerId),
        content: input.trim(),
      }));
      setInput("");
    } else {
      // WS not ready — show hint (could show a toast here)
      console.warn("WebSocket not open, state:", ws.readyState);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // ── Render ─────────────────────────────────────────────────
  return (
    <>
      <style>{STYLES}</style>
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "24px 16px 60px" }}>

        <div style={{ marginBottom: "20px", animation: "fadeUp 0.3s ease" }}>
          <h1 style={{
            color: "var(--text-color)", fontWeight: "900",
            fontSize: "clamp(22px,3vw,30px)", letterSpacing: "-0.5px", margin: 0,
          }}>
            💬 Messages
            {/* WS status dot */}
            <span style={{
              display: "inline-block", width: 8, height: 8, borderRadius: "50%",
              background: wsReady ? "#10b981" : "#f59e0b",
              marginLeft: 10, verticalAlign: "middle",
              boxShadow: wsReady ? "0 0 6px #10b981" : "0 0 6px #f59e0b",
            }} title={wsReady ? "Connected" : "Connecting..."} />
          </h1>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "280px 1fr",
          gap: "16px", height: "600px",
        }}>

          {/* ── Conversations sidebar ── */}
          <div style={{
            background: "var(--block-bg)", borderRadius: "18px",
            border: "1px solid var(--block-border)",
            display: "flex", flexDirection: "column", overflow: "hidden",
          }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--block-border)" }}>
              <p style={{ color: "var(--text-color)", fontWeight: "800", fontSize: "13px", margin: 0 }}>
                Conversations
              </p>
            </div>
            <div style={{ overflowY: "auto", flex: 1 }}>
              {conversations.length === 0 && (
                <div style={{
                  padding: "30px 16px", textAlign: "center",
                  color: "var(--text-color)", opacity: 0.3, fontSize: "12px",
                }}>
                  No conversations yet.<br />Go to Friends and start a chat!
                </div>
              )}
              {conversations.map(c => (
                <div key={c.partner_id}
                  onClick={() => navigate(`/chat/${c.partner_id}`)}
                  style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "12px 14px", cursor: "pointer",
                    background: String(c.partner_id) === String(partnerId)
                      ? "rgba(124,58,237,0.1)" : "transparent",
                    borderLeft: String(c.partner_id) === String(partnerId)
                      ? "3px solid #7c3aed" : "3px solid transparent",
                    transition: "background 0.15s",
                  }}>
                  <Avatar username={c.partner_username} avatar={c.partner_avatar} size={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "var(--text-color)", fontWeight: "700", fontSize: "13px" }}>
                        {c.partner_username}
                      </span>
                      {c.unread > 0 && (
                        <span style={{
                          background: "#7c3aed", color: "white",
                          borderRadius: "10px", padding: "1px 7px",
                          fontSize: "10px", fontWeight: "700",
                        }}>{c.unread}</span>
                      )}
                    </div>
                    <div style={{
                      color: "var(--text-color)", opacity: 0.45, fontSize: "11px",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {c.last_message || "No messages yet"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Chat window ── */}
          <div style={{
            background: "var(--block-bg)", borderRadius: "18px",
            border: "1px solid var(--block-border)",
            display: "flex", flexDirection: "column", overflow: "hidden",
          }}>
            {!partnerId ? (
              <div style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--text-color)", opacity: 0.3,
                flexDirection: "column", gap: "12px",
              }}>
                <div style={{ fontSize: "48px" }}>💬</div>
                <p style={{ margin: 0, fontSize: "14px" }}>Select a conversation</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div style={{
                  padding: "14px 18px", borderBottom: "1px solid var(--block-border)",
                  display: "flex", alignItems: "center", gap: "12px",
                }}>
                  <Avatar username={partnerInfo?.username || "?"} avatar={partnerInfo?.avatar} />
                  <div>
                    <div style={{ color: "var(--text-color)", fontWeight: "800", fontSize: "14px" }}>
                      {partnerInfo?.username || `User #${partnerId}`}
                    </div>
                  </div>
                  {partnerInfo?.username && (
                    <button
                      onClick={() => navigate(`/u/${partnerInfo.username}`)}
                      style={{
                        marginLeft: "auto", padding: "6px 12px", borderRadius: "8px",
                        border: "1px solid var(--block-border)", background: "transparent",
                        color: "var(--text-color)", fontSize: "12px", cursor: "pointer", opacity: 0.7,
                      }}>
                      👤 Profile
                    </button>
                  )}
                </div>

                {/* Messages */}
                <div style={{
                  flex: 1, overflowY: "auto", padding: "16px",
                  display: "flex", flexDirection: "column", gap: "8px",
                }}>
                  {messages.length === 0 && (
                    <div style={{
                      flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                      color: "var(--text-color)", opacity: 0.25, fontSize: "13px",
                    }}>
                      No messages yet. Say hi! 👋
                    </div>
                  )}
                  {messages.map((m, i) => {
                    const isMine = String(m.sender_id) === String(myId);
                    return (
                      <div key={m.id ?? i} style={{
                        display: "flex",
                        justifyContent: isMine ? "flex-end" : "flex-start",
                        animation: "msgIn 0.15s ease",
                      }}>
                        <div style={{
                          maxWidth: "70%", padding: "10px 14px",
                          borderRadius: isMine
                            ? "16px 16px 4px 16px"
                            : "16px 16px 16px 4px",
                          background: isMine
                            ? "linear-gradient(135deg,#7c3aed,#5b21b6)"
                            : "rgba(255,255,255,0.07)",
                          border: isMine ? "none" : "1px solid var(--block-border)",
                          color: isMine ? "white" : "var(--text-color)",
                        }}>
                          <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.5 }}>
                            {m.content}
                          </p>
                          <p style={{
                            margin: "4px 0 0", fontSize: "10px",
                            opacity: 0.6, textAlign: "right",
                          }}>
                            {m.created_at ? formatTime(m.created_at) : ""}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={endRef} />
                </div>

                {/* Input */}
                <div style={{
                  padding: "14px 16px", borderTop: "1px solid var(--block-border)",
                  display: "flex", gap: "10px", alignItems: "center",
                }}>
                  {!wsReady && (
                    <div style={{ fontSize: "11px", color: "#f59e0b", marginRight: 4 }}>
                      Reconnecting…
                    </div>
                  )}
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message… (Enter to send)"
                    disabled={!wsReady}
                    style={{
                      flex: 1, padding: "10px 14px", borderRadius: "12px",
                      border: "1px solid var(--block-border)",
                      background: "rgba(255,255,255,0.04)",
                      color: "var(--text-color)", fontSize: "14px", outline: "none",
                      opacity: wsReady ? 1 : 0.5,
                      transition: "border-color 0.2s",
                    }}
                    onFocus={e => (e.target.style.borderColor = "#7c3aed")}
                    onBlur={e  => (e.target.style.borderColor = "var(--block-border)")}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || !wsReady}
                    style={{
                      padding: "10px 18px", borderRadius: "12px", border: "none",
                      background: input.trim() && wsReady
                        ? "linear-gradient(135deg,#7c3aed,#5b21b6)"
                        : "rgba(124,58,237,0.3)",
                      color: "white", fontWeight: "700", fontSize: "14px",
                      cursor: input.trim() && wsReady ? "pointer" : "not-allowed",
                      transition: "background 0.2s",
                    }}>
                    ➤
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatPage;