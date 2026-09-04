import React from 'react';

// Functional component accepting props
function Student({ name, course, college }) {
  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0', borderRadius: '5px' }}>
      <h3>Student Profile</h3>
      <p><strong>Name:</strong> {name}</p>
      <p><strong>Course:</strong> {course}</p>
      <p><strong>College:</strong> {college}</p>
    </div>
  );
}

export default function App() {
  return (
    <div>
      <h2>Student Profiles</h2>
      {/* Rendering two Student components with props */}
      <Student name="Alex Johnson" course="Computer Science" college="GIET University" />
      <Student name="Sophia Patel" course="AI & ML" college="GIET University" />
    </div>
  );
}
