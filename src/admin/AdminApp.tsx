import { useEffect, useState } from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';

import Loader from './common/Loader';
import PageTitle from './components/PageTitle';
import SignIn from './pages/Authentication/SignIn';
import Calendar from './pages/Calendar';
import Chart from './pages/Chart';
import ECommerce from './pages/Dashboard/ECommerce';
import FormElements from './pages/Form/FormElements';
import FormLayout from './pages/Form/FormLayout';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Tables from './pages/Tables';
import Products from './pages/Products';
import AdminJournal from './pages/Journal';
import Alerts from './pages/UiElements/Alerts';
import Buttons from './pages/UiElements/Buttons';
import DefaultLayout from './layout/DefaultLayout';
import { AuthProvider, useAuth } from './context/AuthContext';
import './css/satoshi.css';
import './css/style.css';

function ProtectedRoutes() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/admin/auth/signin" replace />;
  }

  return (
    <DefaultLayout>
      <Routes>
        <Route
          index
          element={
            <>
              <PageTitle title="Панель управления | Линия Вкуса" />
              <ECommerce />
            </>
          }
        />
        <Route
          path="products"
          element={
            <>
              <PageTitle title="Продукция | Линия Вкуса" />
              <Products />
            </>
          }
        />
        <Route
          path="journal"
          element={
            <>
              <PageTitle title="Журнал | Линия Вкуса" />
              <AdminJournal />
            </>
          }
        />
        <Route
          path="calendar"
          element={
            <>
              <PageTitle title="Календарь | Линия Вкуса" />
              <Calendar />
            </>
          }
        />
        <Route
          path="profile"
          element={
            <>
              <PageTitle title="Профиль | Линия Вкуса" />
              <Profile />
            </>
          }
        />
        <Route
          path="forms/form-elements"
          element={
            <>
              <PageTitle title="Элементы форм | Линия Вкуса" />
              <FormElements />
            </>
          }
        />
        <Route
          path="forms/form-layout"
          element={
            <>
              <PageTitle title="Макет форм | Линия Вкуса" />
              <FormLayout />
            </>
          }
        />
        <Route
          path="tables"
          element={
            <>
              <PageTitle title="Таблицы | Линия Вкуса" />
              <Tables />
            </>
          }
        />
        <Route
          path="settings"
          element={
            <>
              <PageTitle title="Настройки | Линия Вкуса" />
              <Settings />
            </>
          }
        />
        <Route
          path="chart"
          element={
            <>
              <PageTitle title="Графики | Линия Вкуса" />
              <Chart />
            </>
          }
        />
        <Route
          path="ui/alerts"
          element={
            <>
              <PageTitle title="Уведомления | Линия Вкуса" />
              <Alerts />
            </>
          }
        />
        <Route
          path="ui/buttons"
          element={
            <>
              <PageTitle title="Кнопки | Линия Вкуса" />
              <Buttons />
            </>
          }
        />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </DefaultLayout>
  );
}

function AdminApp() {
  const [loading, setLoading] = useState<boolean>(true);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) return <Loader />;

  return (
    <AuthProvider>
      <Routes>
        <Route
          path="auth/signin"
          element={
            <>
              <PageTitle title="Вход | Линия Вкуса" />
              <SignIn />
            </>
          }
        />
        <Route path="*" element={<ProtectedRoutes />} />
      </Routes>
    </AuthProvider>
  );
}

export default AdminApp;
