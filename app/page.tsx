export default function Home() {
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "600px",
        margin: "50px auto",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <h1>🤖 Telegram Watermark Bot</h1>
      <p>
        Status: <strong style={{ color: "green" }}>Running</strong>
      </p>
      <p>Timestamp: {new Date().toISOString()}</p>
      <p>Your bot is ready to receive webhooks from Telegram!</p>
    </div>
  );
}
