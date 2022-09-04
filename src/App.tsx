import { HashRouter, Route, Routes } from 'react-router-dom';
import { Container, createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import Navbar from './components/Navbar/Navbar';
import Learn from './pages/Learn/Learn';
import Play from './pages/Play/Play';

const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      background: {
        default: '#51504c',
        paper: '#353433'
      }
    },
  });

function App() {
  return (
    <HashRouter>
      <ThemeProvider theme={darkTheme}>
      <CssBaseline />
        <Navbar />
          <Container maxWidth="xl">
              <Routes>
                <Route path="/" element={<Play />} />
                <Route path="/learn" element={<Learn />} />
              </Routes>
          </Container>
    </ThemeProvider>
    </HashRouter>
  );
}

export default App;
