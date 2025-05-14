import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';
import Login from '@/app/login/page';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/utils/api';
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock axios
jest.mock('axios', () => ({
  AxiosError: class AxiosError extends Error {
    constructor(message, config) {
      super(message);
      this.name = 'AxiosError';
      this.config = config;
    }
  },
}));

// Mock API
jest.mock('@/utils/api', () => ({
  api: {
    post: jest.fn(),
  },
}));

// Mock AuthContext
jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock UI components
jest.mock('@/app/components/ui/Button', () => ({
  Button: jest.fn(({ children, onClick, type }) => (
    <button
      onClick={onClick}
      type={type}
      data-testid={`button-${children
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')}`}
    >
      {children}
    </button>
  )),
}));

jest.mock('@/app/components/ui/Input', () => ({
  Input: jest.fn(({ type, name, placeholder, value, onChange }) => (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      data-testid={`input-${name}`}
    />
  )),
}));

// Mock react-icons
jest.mock('react-icons/fc', () => ({
  FcGoogle: () => <span data-testid="google-icon">Google Icon</span>,
}));

describe('Login Page', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mocks
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuth as jest.Mock).mockReturnValue({ login: mockLogin });
  });

  it('renders the login form', () => {
    render(<Login />);

    // Check for form elements
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByTestId('input-username')).toBeInTheDocument();
    expect(screen.getByTestId('input-password')).toBeInTheDocument();
    expect(screen.getByTestId('button-log-in')).toBeInTheDocument();
    expect(
      screen.getByTestId('button-sign-in-with-google')
    ).toBeInTheDocument();
    expect(screen.getByText('Dont have an account?')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  it('updates form values when typing', () => {
    render(<Login />);

    // Type in username field
    const usernameInput = screen.getByTestId('input-username');
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    expect(usernameInput).toHaveValue('testuser');

    // Type in password field
    const passwordInput = screen.getByTestId('input-password');
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    expect(passwordInput).toHaveValue('password123');
  });

  it('navigates to register page when register link is clicked', () => {
    render(<Login />);

    // Click register link
    fireEvent.click(screen.getByText('Register'));

    // Should navigate to register page
    expect(mockRouter.push).toHaveBeenCalledWith('/register');
  });

  it('submits the form and handles successful login', async () => {
    // Mock successful API response
    const mockAuthResponse = {
      status: 200,
      data: {
        access_token: 'test-token',
        user: {
          id: 'user-1',
          username: 'testuser',
        },
      },
    };
    (api.post as jest.Mock).mockResolvedValue(mockAuthResponse);

    render(<Login />);

    // Fill in the form
    fireEvent.change(screen.getByTestId('input-username'), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByTestId('input-password'), {
      target: { value: 'password123' },
    });

    // Submit the form
    fireEvent.submit(screen.getByTestId('button-log-in'));

    // Wait for the API call
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('auth/login', {
        username: 'testuser',
        password: 'password123',
      });
    });

    // Check that login function from AuthContext was called
    expect(mockLogin).toHaveBeenCalledWith(
      mockAuthResponse.data.access_token,
      mockAuthResponse.data.user
    );
  });

  it('handles login failure with appropriate error message', async () => {
    // Mock API error response
    const mockError = {
      response: {
        status: 401,
        data: {
          message: 'Invalid credentials',
        },
      },
    };
    (api.post as jest.Mock).mockRejectedValue(mockError);

    // Spy on setError state update
    const setErrorMock = jest.fn();
    jest
      .spyOn(React, 'useState')
      .mockImplementationOnce(() => ['', setErrorMock]);

    render(<Login />);

    // Fill in the form
    fireEvent.change(screen.getByTestId('input-username'), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByTestId('input-password'), {
      target: { value: 'wrongpassword' },
    });

    // Submit the form
    fireEvent.submit(screen.getByTestId('button-log-in'));

    // Wait for the API call to fail
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('auth/login', {
        username: 'testuser',
        password: 'wrongpassword',
      });
    });

    // Check that error state was updated
    expect(setErrorMock).toHaveBeenCalledWith('Invalid email or password');
  });

  it('handles network errors during login', async () => {
    // Mock network error
    (api.post as jest.Mock).mockRejectedValue(new Error('Network Error'));

    // Spy on setError state update
    const setErrorMock = jest.fn();
    jest
      .spyOn(React, 'useState')
      .mockImplementationOnce(() => ['', setErrorMock]);

    render(<Login />);

    // Fill in the form
    fireEvent.change(screen.getByTestId('input-username'), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByTestId('input-password'), {
      target: { value: 'password123' },
    });

    // Submit the form
    fireEvent.submit(screen.getByTestId('button-log-in'));

    // Wait for the API call to fail
    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
    });

    // Check that error state was updated with network error message
    expect(setErrorMock).toHaveBeenCalledWith(
      'Network error. Please check your connection.'
    );
  });

  it('handles Google sign-in button click', () => {
    // Create a spy for console.log
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    render(<Login />);

    // Click Google sign in button
    fireEvent.click(screen.getByTestId('button-sign-in-with-google'));

    // Verify console.log was called
    expect(consoleSpy).toHaveBeenCalledWith('Google Sign In');

    // Clean up
    consoleSpy.mockRestore();
  });
});
