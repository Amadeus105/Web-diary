import React from "react";
import ItemList from "./components/ItemList";

function App() {
  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">🎮 My Completed Diary</h1>
      <ItemList />
    </div>
  );
}

export default App;
