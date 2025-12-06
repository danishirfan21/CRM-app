import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { ConfirmProvider } from './components/ConfirmDialog';
import ToastContainer from './components/Toast';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Contacts from './pages/Contacts';
import ContactProfile from './pages/ContactProfile';
import ContactForm from './pages/ContactForm';
import Tags from './pages/Tags';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <ConfirmProvider>
            <BrowserRouter>
              <ToastContainer />
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

          <Route
            path="/contacts"
            element={
              <PrivateRoute>
                <Layout>
                  <Contacts />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/contacts/new"
            element={
              <PrivateRoute>
                <Layout>
                  <ContactForm />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/contacts/:id"
            element={
              <PrivateRoute>
                <Layout>
                  <ContactProfile />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/tags"
            element={
              <PrivateRoute>
                <Layout>
                  <Tags />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route path="/" element={<Navigate to="/contacts" replace />} />
            </Routes>
          </BrowserRouter>
        </ConfirmProvider>
      </ToastProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
