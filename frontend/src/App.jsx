import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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
    <AuthProvider>
      <BrowserRouter>
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
    </AuthProvider>
  );
}

export default App;
