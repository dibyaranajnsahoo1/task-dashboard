import { Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { getTheme } from './theme';
import AppLayout from './components/Layout/AppLayout';
import BoardPage from './pages/BoardPage';
import CreateTaskPage from './pages/CreateTaskPage';
import TaskDetailPage from './pages/TaskDetailPage';
import { useThemeStore } from './store/themeStore';

const App: React.FC = () => {
  const { mode } = useThemeStore();
  
  const theme = React.useMemo(
    () => getTheme(mode),
    [mode],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<BoardPage />} />
          <Route path="create" element={<CreateTaskPage />} />
          <Route path="task/:id" element={<TaskDetailPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default App;
