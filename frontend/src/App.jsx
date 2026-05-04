import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import UserDetail from "./UserDetail";
import Chat1 from "./chat1/chat1"; 
import Chat1wsp from "./CHATWSP1/Chat1wsp";


function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/user/:email" element={<UserDetail />} />
      </Routes>

     
      <Chat1 />
      <Chat1wsp />
    </>
  );
}

export default App;