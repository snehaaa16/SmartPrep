// import React from 'react';
// import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import Landing from './pages/Landing';
// import Login from './pages/Login';
// import Signup from './pages/Signup';

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* Our new Landing Page is the home route! */}
//         <Route path="/" element={<Landing />} />

//         {/* Auth Routes */}
//         <Route path="/login" element={<Login />} />
//         <Route path="/signup" element={<Signup />} />

//         {/* Placeholder for Dashboard */}
//         <Route path="/dashboard" element={<h1 className="text-white text-center mt-10 text-3xl font-bold">Welcome to Dashboard!</h1>} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import RoadmapView from "./pages/RoadmapView";
import CustomRoadmapView from "./pages/CustomRoadmapView";
import TopicLearning from "./pages/TopicLearning";
import LiveQuizRoom from "./pages/LiveQuizRoom";
import LiveNotification from "./components/LiveNotification";

function App() {
  return (
    <BrowserRouter>
      <LiveNotification />
      <Routes>
        {/* Our new Landing Page is the home route! */}
        <Route path="/" element={<Landing />} />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/roadmap/predefined/:subjectId"
          element={<RoadmapView />}
        />
        <Route
          path="/roadmap/custom/:roadmapId"
          element={<CustomRoadmapView />}
        />
        <Route path="/topic/:id" element={<TopicLearning />} />
        <Route path="/live-quiz" element={<LiveQuizRoom />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
