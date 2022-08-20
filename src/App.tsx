import { Container } from '@mui/system';
import Chessboard from './components/Chessboard/Chessboard';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar/Navbar';
import { BrowserRouter } from 'react-router-dom';
import { Route, Routes } from 'react-router-dom';

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
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Chessboard />} />
                <Route path="learn" element={<Chessboard />} />
              </Routes>
              </BrowserRouter>
          </Container>
    </ThemeProvider>
  )
}

export default App