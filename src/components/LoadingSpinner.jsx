export default function LoadingSpinner() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        alignSelf: "center",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          border: "4px solid #f0f0f0",
          borderTop: "4px solid #f472b6",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
    </div>
  );
}

