
import { Route, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container } from '@mui/system';
import Navbar from './components/Navbar/Navbar';
import Chessboard from './components/Chessboard/Chessboard';
import Learn from './components/Learn/Learn';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#51504c',
      paper: '#353433'
    }
  },
});


const App = () => {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
        <Navbar />
          <Container maxWidth="xl">
              <Routes>
                <Route path="/" element={<Chessboard />} />
                <Route path="learn" element={<Learn />} />
              </Routes>
          </Container>
    </ThemeProvider>
  )
}

export default App