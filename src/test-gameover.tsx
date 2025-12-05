import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import Gameover from './Dialogues/Gameover'
import './index.css'

const mockUser = {
  uid: 'test-user-123',
  name: 'Test Winner',
  search: 'test winner',
  photoURL: null,
  language: 'en'
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      background: 'var(--background-color)'
    }}>
      <dialog open style={{
        background: 'var(--dialog-background-color)',
        color: 'var(--primary-color)',
        borderRadius: '10px',
        padding: '20px'
      }}>
        <Gameover user={mockUser} reset={() => alert('Reset clicked!')} />
      </dialog>
    </div>
  </StrictMode>
)
