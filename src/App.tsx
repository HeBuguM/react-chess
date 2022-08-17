import { Container } from '@mui/system';
import Chessboard from './components/Chessboard/Chessboard';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar/Navbar';

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
        <Chessboard />
      </Container>
    </ThemeProvider>
  )
}

export default App