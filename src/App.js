import React, { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import './App.css';
import Register from './components/Register';
import { 
  loginUser, 
  isAuthenticated, 
  logoutUser, 
  getCurrentUser,
  createStudent,
  getAllStudents,
  sendStudentPDF
} from './services/api';
import { createStudent as studentApiCreateStudent, getAllStudents as studentApiGetAllStudents, sendStudentPDF as studentApiSendStudentPDF } from './services/studentApi';

// Login Component
const Login = ({ onLogin, onShowRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await loginUser({ username, password });
      onLogin(true);
      setError('');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Admin/Teacher Login</h2>
      <form onSubmit={handleLogin} className="login-form">
        <div className="input-group">
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button 
          type="submit" 
          className="login-btn"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
        <p className="register-link">
          Don't have an account? <button 
            type="button" 
            className="link-button" 
            onClick={onShowRegister}
          >
            Register here
          </button>
        </p>
      </form>
    </div>
  );
};

// Main App Component
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if user is already authenticated on component mount
  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(authStatus);
    
    // If authenticated, fetch students from API
    if (authStatus) {
      fetchStudents();
    }
  }, []);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const data = await getAllStudents();
      setStudents(data);
    } catch (err) {
      setError('Failed to fetch students: ' + err.message);
      console.error('Error fetching students:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (status) => {
    setIsAuthenticated(status);
    localStorage.setItem('isAuthenticated', status);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    logoutUser();
  };

  const handleRegisterSuccess = () => {
    setShowRegister(false);
  };

  // Subjects data
  const theorySubjects = [
    { id: 1, name: 'Mathematics' },
    { id: 2, name: 'Physics' },
    { id: 3, name: 'Chemistry' },
    { id: 4, name: 'Computer Science' },
    { id: 5, name: 'English' }
  ];

  const labSubjects = [
    { id: 101, name: 'Physics Lab' },
    { id: 102, name: 'Chemistry Lab' },
    { id: 103, name: 'Computer Lab' },
    { id: 104, name: 'Electronics Lab' }
  ];

  // Input state
  const [inputs, setInputs] = useState({
    rollNo: '',
    name: '',
    theoryAttendance: theorySubjects.map(subject => ({
      subjectId: subject.id,
      subjectName: subject.name,
      attendance: ''
    })),
    labAttendance: labSubjects.map(lab => ({
      labId: lab.id,
      labName: lab.name,
      attendance: ''
    })),
    ia1: '',
    ia2: '',
    ese: '',
    assignments: theorySubjects.map(subject => ({
      subjectId: subject.id,
      subjectName: subject.name,
      marks: ['', '', '']
    })),
    practicals: labSubjects.map(lab => ({
      labId: lab.id,
      labName: lab.name,
      grades: ['', '', '']
    }))
  });

  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeSubject, setActiveSubject] = useState({
    assignments: theorySubjects[0].id,
    practicals: labSubjects[0].id,
    labAttendance: labSubjects[0].id
  });

  const handleInputChange = (e, index, fieldType, subjectIndex, itemIndex) => {
    const { name, value } = e.target;
    
    if (fieldType === 'theoryAttendance') {
      const newTheoryAttendance = [...inputs.theoryAttendance];
      newTheoryAttendance[index].attendance = value;
      setInputs({...inputs, theoryAttendance: newTheoryAttendance});
    }
    else if (fieldType === 'labAttendance') {
      const newLabAttendance = [...inputs.labAttendance];
      newLabAttendance[index].attendance = value;
      setInputs({...inputs, labAttendance: newLabAttendance});
    }
    else if (fieldType === 'assignment') {
      const newAssignments = [...inputs.assignments];
      newAssignments[subjectIndex].marks[itemIndex] = value;
      setInputs({...inputs, assignments: newAssignments});
    }
    else if (fieldType === 'practical') {
      const newPracticals = [...inputs.practicals];
      newPracticals[subjectIndex].grades[itemIndex] = value;
      setInputs({...inputs, practicals: newPracticals});
    }
    else {
      setInputs({...inputs, [name]: value});
    }
  };

  const addStudent = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Format data for API
      const studentData = {
        roll_no: inputs.rollNo,
        name: inputs.name,
        email: '', // Optional
        theory_attendance: inputs.theoryAttendance.reduce((acc, subject) => {
          acc[subject.subjectId] = parseInt(subject.attendance) || 0;
          return acc;
        }, {}),
        lab_attendance: inputs.labAttendance.reduce((acc, lab) => {
          acc[lab.labId] = parseInt(lab.attendance) || 0;
          return acc;
        }, {}),
        ia1: parseInt(inputs.ia1) || 0,
        ia2: parseInt(inputs.ia2) || 0,
        ese: parseInt(inputs.ese) || 0,
        assignments: inputs.assignments.reduce((acc, subject) => {
          acc[subject.subjectId] = subject.marks.map(mark => parseInt(mark) || 0);
          return acc;
        }, {}),
        practicals: inputs.practicals.reduce((acc, lab) => {
          acc[lab.labId] = lab.grades.map(grade => grade || 'N/A');
          return acc;
        }, {})
      };
      
      // Save to API
      const savedStudent = await studentApiCreateStudent(studentData);
      
      // Format for local state
      const newStudent = {
        id: savedStudent.id,
        rollNo: savedStudent.roll_no,
        name: savedStudent.name,
        theoryAttendance: Object.entries(savedStudent.theory_attendance).map(([id, attendance]) => ({
          subjectId: parseInt(id),
          subjectName: theorySubjects.find(s => s.id === parseInt(id))?.name || `Subject ${id}`,
          attendance
        })),
        labAttendance: Object.entries(savedStudent.lab_attendance).map(([id, attendance]) => ({
          labId: parseInt(id),
          labName: labSubjects.find(l => l.id === parseInt(id))?.name || `Lab ${id}`,
          attendance
        })),
        ia1: savedStudent.ia1,
        ia2: savedStudent.ia2,
        ese: savedStudent.ese,
        assignments: Object.entries(savedStudent.assignments).map(([id, marks]) => ({
          subjectId: parseInt(id),
          subjectName: theorySubjects.find(s => s.id === parseInt(id))?.name || `Subject ${id}`,
          marks
        })),
        practicals: Object.entries(savedStudent.practicals).map(([id, grades]) => ({
          labId: parseInt(id),
          labName: labSubjects.find(l => l.id === parseInt(id))?.name || `Lab ${id}`,
          grades
        }))
      };
      
      setStudents([...students, newStudent]);
      resetForm();
    } catch (err) {
      setError('Failed to save student: ' + err.message);
      console.error('Error saving student:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setInputs({
      rollNo: '',
      name: '',
      theoryAttendance: theorySubjects.map(subject => ({
        subjectId: subject.id,
        subjectName: subject.name,
        attendance: ''
      })),
      labAttendance: labSubjects.map(lab => ({
        labId: lab.id,
        labName: lab.name,
        attendance: ''
      })),
      ia1: '',
      ia2: '',
      ese: '',
      assignments: theorySubjects.map(subject => ({
        subjectId: subject.id,
        subjectName: subject.name,
        marks: ['', '', '']
      })),
      practicals: labSubjects.map(lab => ({
        labId: lab.id,
        labName: lab.name,
        grades: ['', '', '']
      }))
    });
  };

  const calculateIAAverage = (ia1, ia2) => {
    return ((ia1 + ia2) / 2).toFixed(2);
  };

  const calculateTotal = (ia1, ia2, ese) => {
    const iaAvg = calculateIAAverage(ia1, ia2);
    return (parseFloat(iaAvg) + ese).toFixed(2);
  };

  const generatePDF = async () => {
    if (!selectedStudent) return;
    
    const element = document.getElementById('student-report');
    const opt = {
      margin: 10,
      filename: `${selectedStudent.name}_Report.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      setIsLoading(true);
      const pdf = await html2pdf().set(opt).from(element).outputPdf('datauristring');
      
      // If student has email, send PDF
      if (selectedStudent.email) {
        await studentApiSendStudentPDF(selectedStudent.email, pdf);
        alert('PDF sent to student email');
      }
      
      // Download PDF
      html2pdf().set(opt).from(element).save();
    } catch (err) {
      setError('Failed to generate PDF: ' + err.message);
      console.error('Error generating PDF:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    if (showRegister) {
      return <Register onRegisterSuccess={handleRegisterSuccess} />;
    }
    return <Login onLogin={handleLogin} onShowRegister={() => setShowRegister(true)} />;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Student Result System</h1>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="main-content">
        {/* Input Column */}
        <div className="input-column">
          <h2>Enter Student Data</h2>
          
          <div className="input-section">
            <h3>Basic Information</h3>
            <div className="input-row">
              <div className="input-group">
                <label>Roll No:</label>
                <input
                  type="text"
                  name="rollNo"
                  value={inputs.rollNo}
                  onChange={(e) => handleInputChange(e)}
                />
              </div>
              <div className="input-group">
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={inputs.name}
                  onChange={(e) => handleInputChange(e)}
                />
              </div>
            </div>
          </div>

          <div className="input-section">
            <h3>Theory Attendance (%)</h3>
            <div className="input-row">
              {inputs.theoryAttendance.map((subject, index) => (
                <div key={subject.subjectId} className="input-group">
                  <label>{subject.subjectName}:</label>
                  <input
                    type="number"
                    value={subject.attendance}
                    onChange={(e) => handleInputChange(e, index, 'theoryAttendance')}
                    min="0"
                    max="100"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="input-section">
            <h3>Lab Attendance (%)</h3>
            <div className="subject-selector">
              <label>Select Lab:</label>
              <select
                value={activeSubject.labAttendance}
                onChange={(e) => setActiveSubject({
                  ...activeSubject,
                  labAttendance: parseInt(e.target.value)
                })}
              >
                {labSubjects.map(lab => (
                  <option key={lab.id} value={lab.id}>
                    {lab.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="input-row">
              {inputs.labAttendance
                .filter(lab => lab.labId === activeSubject.labAttendance)
                .map((lab, index) => (
                  <div key={lab.labId} className="input-group">
                    <label>{lab.labName}:</label>
                    <input
                      type="number"
                      value={lab.attendance}
                      onChange={(e) => handleInputChange(
                        e,
                        inputs.labAttendance.findIndex(
                          l => l.labId === activeSubject.labAttendance
                        ),
                        'labAttendance'
                      )}
                      min="0"
                      max="100"
                    />
                  </div>
                ))}
            </div>
          </div>

          <div className="input-section">
            <h3>Exam Marks</h3>
            <div className="input-row">
              <div className="input-group">
                <label>IA 1 (out of 20):</label>
                <input
                  type="number"
                  name="ia1"
                  value={inputs.ia1}
                  onChange={(e) => handleInputChange(e)}
                  min="0"
                  max="20"
                />
              </div>
              <div className="input-group">
                <label>IA 2 (out of 20):</label>
                <input
                  type="number"
                  name="ia2"
                  value={inputs.ia2}
                  onChange={(e) => handleInputChange(e)}
                  min="0"
                  max="20"
                />
              </div>
              <div className="input-group">
                <label>ESE (out of 80):</label>
                <input
                  type="number"
                  name="ese"
                  value={inputs.ese}
                  onChange={(e) => handleInputChange(e)}
                  min="0"
                  max="80"
                />
              </div>
            </div>
          </div>

          <div className="input-section">
            <h3>Assignments (out of 20)</h3>
            <div className="subject-selector">
              <label>Select Subject:</label>
              <select
                value={activeSubject.assignments}
                onChange={(e) => setActiveSubject({
                  ...activeSubject,
                  assignments: parseInt(e.target.value)
                })}
              >
                {theorySubjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="input-row">
              {inputs.assignments
                .find(subject => subject.subjectId === activeSubject.assignments)
                ?.marks.map((mark, index) => (
                  <div key={index} className="input-group">
                    <label>Assignment {index + 1}:</label>
                    <input
                      type="number"
                      value={mark}
                      onChange={(e) => handleInputChange(
                        e,
                        index,
                        'assignment',
                        inputs.assignments.findIndex(
                          sub => sub.subjectId === activeSubject.assignments
                        ),
                        index
                      )}
                      min="0"
                      max="20"
                    />
                  </div>
                ))}
            </div>
          </div>

          <div className="input-section">
            <h3>Practicals</h3>
            <div className="subject-selector">
              <label>Select Lab:</label>
              <select
                value={activeSubject.practicals}
                onChange={(e) => setActiveSubject({
                  ...activeSubject,
                  practicals: parseInt(e.target.value)
                })}
              >
                {labSubjects.map(lab => (
                  <option key={lab.id} value={lab.id}>
                    {lab.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="input-row">
              {inputs.practicals
                .find(lab => lab.labId === activeSubject.practicals)
                ?.grades.map((grade, index) => (
                  <div key={index} className="input-group">
                    <label>Practical {index + 1}:</label>
                    <input
                      type="text"
                      value={grade}
                      onChange={(e) => handleInputChange(
                        e,
                        index,
                        'practical',
                        inputs.practicals.findIndex(
                          lab => lab.labId === activeSubject.practicals
                        ),
                        index
                      )}
                      placeholder="A, B, C..."
                    />
                  </div>
                ))}
            </div>
          </div>

          <button className="submit-btn" onClick={addStudent}>
            Add Student
          </button>
        </div>

        {/* Output Column */}
        <div className="output-column">
          <div className="output-section">
            <h2>Generate Report</h2>
            <div className="student-selector">
              <select
                onChange={(e) => setSelectedStudent(students[e.target.value])}
                value={selectedStudent ? students.indexOf(selectedStudent) : ''}
              >
                <option value="">Select Student</option>
                {students.map((student, index) => (
                  <option key={index} value={index}>
                    {student.name} (Roll No: {student.rollNo})
                  </option>
                ))}
              </select>
            </div>

            {selectedStudent && (
              <div className="report-container">
                <div id="student-report" className="student-report">
                  <div className="report-header">
                    <div className="header-text">
                      <h2>Student Academic Report</h2>
                      <p>Academic Year 2023-2024</p>
                    </div>
                  </div>

                  <div className="student-info">
                    <div className="info-item">
                      <span>Roll Number:</span>
                      <span>{selectedStudent.rollNo}</span>
                    </div>
                    <div className="info-item">
                      <span>Student Name:</span>
                      <span>{selectedStudent.name}</span>
                    </div>
                  </div>

                  <div className="report-section">
                    <h3>Theory Attendance Records</h3>
                    <div className="data-grid">
                      {selectedStudent.theoryAttendance.map(subject => (
                        <div key={subject.subjectId} className="data-item">
                          <span>{subject.subjectName}</span>
                          <span>{subject.attendance}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="report-section">
                    <h3>Lab Attendance Records</h3>
                    <div className="data-grid">
                      {selectedStudent.labAttendance.map(lab => (
                        <div key={lab.labId} className="data-item highlight">
                          <span>{lab.labName}</span>
                          <span>{lab.attendance}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="report-section">
                    <h3>Examination Marks</h3>
                    <div className="data-grid">
                      <div className="data-item">
                        <span>IA 1</span>
                        <span>{selectedStudent.ia1}/20</span>
                      </div>
                      <div className="data-item">
                        <span>IA 2</span>
                        <span>{selectedStudent.ia2}/20</span>
                      </div>
                      <div className="data-item highlight">
                        <span>IA Average</span>
                        <span>{calculateIAAverage(selectedStudent.ia1, selectedStudent.ia2)}/20</span>
                      </div>
                      <div className="data-item">
                        <span>ESE</span>
                        <span>{selectedStudent.ese}/80</span>
                      </div>
                      <div className="data-item highlight">
                        <span>Total</span>
                        <span>{calculateTotal(selectedStudent.ia1, selectedStudent.ia2, selectedStudent.ese)}/100</span>
                      </div>
                    </div>
                  </div>

                  <div className="report-section">
                    <h3>Assignments</h3>
                    {theorySubjects.map(subject => {
                      const subjectAssignments = selectedStudent.assignments.find(
                        a => a.subjectId === subject.id
                      );
                      return (
                        <div key={subject.id} className="subject-assignments">
                          <h4>{subject.name}</h4>
                          <div className="data-grid">
                            {subjectAssignments.marks.map((mark, index) => (
                              <div key={index} className="data-item">
                                <span>Assignment {index + 1}</span>
                                <span>{mark}/20</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="report-section">
                    <h3>Practicals</h3>
                    {labSubjects.map(lab => {
                      const labPracticals = selectedStudent.practicals.find(
                        p => p.labId === lab.id
                      );
                      return (
                        <div key={lab.id} className="subject-practicals">
                          <h4>{lab.name}</h4>
                          <div className="data-grid">
                            {labPracticals.grades.map((grade, index) => (
                              <div key={index} className="data-item">
                                <span>Practical {index + 1}</span>
                                <span className="grade">{grade}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="report-footer">
                    <div className="signature">
                      <div className="signature-line"></div>
                      <p>Class Coordinator</p>
                    </div>
                    <div className="report-date">
                      Generated on: {new Date().toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <button className="pdf-btn" onClick={generatePDF}>
                  Download PDF Report
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;