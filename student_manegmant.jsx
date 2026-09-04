import React, { createContext, useContext, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams } from 'react-router-dom';

// 1. Context API Setup
const StudentContext = createContext();

export const StudentProvider = ({ children }) => {
  const [student] = useState({ name: 'Rahul Sharma', id: '24CSE101', college: 'GIET University' });
  return <StudentContext.Provider value={student}>{children}</StudentContext.Provider>;
};

// 2. Components / Pages
const Navigation = () => {
  const student = useContext(StudentContext);
  return (
    <nav style={{ padding: '10px', background: '#eee', marginBottom: '15px' }}>
      <Link to="/" style={{ marginRight: '10px' }}>Home</Link>
      <Link to="/courses" style={{ marginRight: '10px' }}>Courses</Link>
      <Link to="/about">About</Link>
      <span style={{ float: 'right' }}>Logged in as: <strong>{student.name}</strong></span>
    </nav>
  );
};

const Home = () => <h2>Home Page</h2>;
const About = () => <h2>About Page</h2>;

const Courses = () => (
  <div>
    <h2>Courses Page</h2>
    <ul>
      <li><Link to="/course/react-101">React Fundamentals</Link></li>
      <li><Link to="/course/node-202">Node.js Basics</Link></li>
    </ul>
  </div>
);

// Dynamic Route Component
const CourseDetail = () => {
  const { id } = useParams();
  const student = useContext(StudentContext);
  return (
    <div>
      <h3>Course ID: {id}</h3>
      <p>Enrolled Student: {student.name} ({student.id})</p>
    </div>
  );
};

// 3. Main App Component
export default function App() {
  return (
    <StudentProvider>
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/course/:id" element={<CourseDetail />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </BrowserRouter>
    </StudentProvider>
  );
}
