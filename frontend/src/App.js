import ItemList from "./components/ItemList";
import CustomNavbar from "./components/Navbar";

function App() {
  return (
    <>
      <CustomNavbar />

      <div style={{ paddingTop: "80px", minHeight: "100vh", background: "#f4f6f8" }}>
        <div
          style={{
            maxWidth: "700px",
            margin: "0 auto",
            padding: "40px 20px",
          }}
        >
          <h1 style={{ textAlign: "center", marginBottom: "30px" }}>
            🎮 Completed Diary
          </h1>

          <ItemList />
        </div>
      </div>
    </>
  );
}

export default App;