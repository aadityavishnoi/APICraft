import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import AuthView from './pages/AuthView';
import DashboardLayout from './components/DashboardLayout';
import DashboardView from './pages/DashboardView';
import CollectionsView from './pages/CollectionsView';
import ApiKeysView from './pages/ApiKeysView';
import LogsView from './pages/LogsView';
import SettingsView from './pages/SettingsView';
import DocsView from './pages/DocsView';

const PrivateRoute = ({ children }) => {
  const { token } = useContext(AuthContext);
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  const { token } = useContext(AuthContext);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!token ? <AuthView /> : <Navigate to="/" replace />} />
        
        <Route path="/" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardView />} />
          <Route path="collections" element={<CollectionsView />} />
          <Route path="keys" element={<ApiKeysView />} />
          <Route path="logs" element={<LogsView />} />
          <Route path="settings" element={<SettingsView />} />
          <Route path="docs" element={<DocsView />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
