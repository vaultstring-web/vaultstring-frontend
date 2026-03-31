import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LoginForm } from '../LoginForm'
import { useAuth } from '@/src/context/AuthContext'
import { login as loginApi } from '@/src/lib/auth/auth'

// Mock dependencies
jest.mock('@/src/context/AuthContext')
jest.mock('@/src/lib/auth/auth')

describe('LoginForm', () => {
  const mockRefreshUser = jest.fn()
  const mockLogin = loginApi as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      refreshUser: mockRefreshUser,
    });
  })

  it('renders login form correctly', () => {
    render(<LoginForm />)
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in to vault/i })).toBeInTheDocument()
  })

  it('shows error message on invalid credentials', async () => {
    mockLogin.mockResolvedValue(null) // API returns null for failed login
    
    render(<LoginForm />)
    
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' },
    })
    
    fireEvent.click(screen.getByRole('button', { name: /sign in to vault/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
  })

  it('successfully logs in with correct credentials', async () => {
    const mockResponse = { access_token: 'mock-token' }
    mockLogin.mockResolvedValue(mockResponse)
    
    // Completely mock window.location for this test
    const oldLocation = window.location;
    // @ts-ignore
    delete window.location;
    window.location = { href: '', assign: jest.fn() } as any;

    render(<LoginForm />)
    
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    })
    
    fireEvent.click(screen.getByRole('button', { name: /sign in to vault/i }))
    
    await waitFor(() => {
      expect(mockRefreshUser).toHaveBeenCalled()
      expect(window.location.href).toContain('/')
    })

    window.location = oldLocation;
  })
})
