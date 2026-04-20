import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import NotFound from "./pages/NotFound.jsx";
import Login from "./pages/Login.jsx";
import Profile from "./pages/Profile.jsx";
import CreateQuestion from "./pages/CreateQuestion.jsx";
import Question from "./pages/Question.jsx";
import QuestionWithId from "./pages/QuestionWithId.jsx";
import Admin from "./pages/Admin.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/question/create" element={<CreateQuestion />} />
          <Route path="/question" element={<Question />} />
          <Route path="/question/:id" element={<QuestionWithId />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
