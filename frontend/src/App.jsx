import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { ConfirmProvider } from './components/ConfirmDialog';
import { ReactQueryProvider } from './config/reactQueryConfig';
import ErrorBoundary from './components/ErrorBoundary';
import ToastContainer from './components/Toast';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

// Lazy load pages for code splitting
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Contacts = lazy(() => import('./pages/Contacts'));
const ContactProfile = lazy(() => import('./pages/ContactProfile'));
const ContactForm = lazy(() => import('./pages/ContactForm'));
const Tags = lazy(() => import('./pages/Tags'));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <ReactQueryProvider>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <ConfirmProvider>
                <BrowserRouter>
                  <ToastContainer />
                  <Suspense fallback={<PageLoader />}>
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

                      <Route
                        path="/"
                        element={<Navigate to="/contacts" replace />}
                      />

                      {/* 404 Route */}
                      <Route
                        path="*"
                        element={
                          <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                            <div className="text-center">
                              <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                404
                              </h1>
                              <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Page not found
                              </p>
                              <a
                                href="/"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                              >
                                Go Home
                              </a>
                            </div>
                          </div>
                        }
                      />
                    </Routes>
                  </Suspense>
                </BrowserRouter>
              </ConfirmProvider>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </ReactQueryProvider>
    </ErrorBoundary>
  );
}

export default App;
