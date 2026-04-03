import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import NotFound from './pages/NotFound.jsx'
import Login from './pages/Login.jsx'
import Profile from './pages/Profile.jsx'
import CreateQuestion from './pages/CreateQuestion.jsx'
import Question from './pages/Question.jsx'
import QuestionWithId from './pages/QuestionWithId.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/question/create" element={<CreateQuestion />} />
        <Route path="/question" element={<Question />} />
        <Route path="/question/:id" element={<QuestionWithId />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
