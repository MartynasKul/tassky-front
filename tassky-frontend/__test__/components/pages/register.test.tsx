import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';
import Register from '@/app/register/page';
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

describe('Register Page', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mocks
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        setItem: jest.fn(),
        getItem: jest.fn(),
      },
      writable: true,
    });
  });

  it('renders the registration form', () => {
    render(<Register />);

    // Check for form elements
    expect(screen.getByText('Register')).toBeInTheDocument();
    expect(screen.getByTestId('input-username')).toBeInTheDocument();
    expect(screen.getByTestId('input-email')).toBeInTheDocument();
    expect(screen.getByTestId('input-password')).toBeInTheDocument();
    expect(screen.getByTestId('button-register')).toBeInTheDocument();
    expect(
      screen.getByTestId('button-sign-in-with-google')
    ).toBeInTheDocument();
    expect(screen.getByText('Already have an account?')).toBeInTheDocument();
    expect(screen.getByText('Log in')).toBeInTheDocument();
  });

  it('updates form values when typing', () => {
    render(<Register />);

    // Type in username field
    const usernameInput = screen.getByTestId('input-username');
    fireEvent.change(usernameInput, { target: { value: 'newuser' } });
    expect(usernameInput).toHaveValue('newuser');

    // Type in email field
    const emailInput = screen.getByTestId('input-email');
    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
    expect(emailInput).toHaveValue('new@example.com');

    // Type in password field
    const passwordInput = screen.getByTestId('input-password');
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    expect(passwordInput).toHaveValue('password123');
  });

  it('navigates to login page when login link is clicked', () => {
    render(<Register />);

    // Click login link
    fireEvent.click(screen.getByText('Log in'));

    // Should navigate to login page
    expect(mockRouter.push).toHaveBeenCalledWith('/login');
  });

  it('submits the form and handles successful registration', async () => {
    // Mock successful API response
    const mockRegisterResponse = {
      status: 201,
      data: {
        token: 'new-user-token',
      },
    };
    (api.post as jest.Mock).mockResolvedValue(mockRegisterResponse);

    render(<Register />);

    // Fill in the form
    fireEvent.change(screen.getByTestId('input-username'), {
      target: { value: 'newuser' },
    });
    fireEvent.change(screen.getByTestId('input-email'), {
      target: { value: 'new@example.com' },
    });
    fireEvent.change(screen.getByTestId('input-password'), {
      target: { value: 'password123' },
    });

    // Submit the form
    fireEvent.submit(screen.getByTestId('button-register'));

    // Wait for the API call
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('auth/register', {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
      });
    });

    // Check that token was stored in localStorage
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      'access_token',
      mockRegisterResponse.data.token
    );

    // Should redirect to login page after successful registration
    expect(mockRouter.push).toHaveBeenCalledWith('/login');
  });

  it('handles registration failure with existing user', async () => {
    // Mock API error response for existing user
    const mockError = {
      response: {
        status: 409,
        data: {
          message: 'User with email or username already exists',
        },
      },
    };
    (api.post as jest.Mock).mockRejectedValue(mockError);

    // Spy on setError state update
    const setErrorMock = jest.fn();
    jest
      .spyOn(React, 'useState')
      .mockImplementationOnce(() => ['', setErrorMock]);

    render(<Register />);

    // Fill in the form
    fireEvent.change(screen.getByTestId('input-username'), {
      target: { value: 'existinguser' },
    });
    fireEvent.change(screen.getByTestId('input-email'), {
      target: { value: 'existing@example.com' },
    });
    fireEvent.change(screen.getByTestId('input-password'), {
      target: { value: 'password123' },
    });

    // Submit the form
    fireEvent.submit(screen.getByTestId('button-register'));

    // Wait for the API call to fail
    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
    });

    // Check that error state was updated with the conflict error
    expect(setErrorMock).toHaveBeenCalledWith(
      'User with email or username already exists'
    );
  });

  it('handles invalid registration details', async () => {
    // Mock API error response for invalid details
    const mockError = {
      response: {
        status: 400,
        data: {
          message: 'Invalid registration details',
        },
      },
    };
    (api.post as jest.Mock).mockRejectedValue(mockError);

    // Spy on setError state update
    const setErrorMock = jest.fn();
    jest
      .spyOn(React, 'useState')
      .mockImplementationOnce(() => ['', setErrorMock]);

    render(<Register />);

    // Fill in the form with invalid data
    fireEvent.change(screen.getByTestId('input-username'), {
      target: { value: 'a' },
    }); // Too short
    fireEvent.change(screen.getByTestId('input-email'), {
      target: { value: 'invalid-email' },
    }); // Invalid email
    fireEvent.change(screen.getByTestId('input-password'), {
      target: { value: '123' },
    }); // Too short

    // Submit the form
    fireEvent.submit(screen.getByTestId('button-register'));

    // Wait for the API call to fail
    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
    });

    // Check that error state was updated with the validation error
    expect(setErrorMock).toHaveBeenCalledWith('Invalid registration details');
  });

  it('handles network errors during registration', async () => {
    // Mock network error
    (api.post as jest.Mock).mockRejectedValue(new Error('Network Error'));

    // Spy on setError state update
    const setErrorMock = jest.fn();
    jest
      .spyOn(React, 'useState')
      .mockImplementationOnce(() => ['', setErrorMock]);

    render(<Register />);

    // Fill in the form
    fireEvent.change(screen.getByTestId('input-username'), {
      target: { value: 'newuser' },
    });
    fireEvent.change(screen.getByTestId('input-email'), {
      target: { value: 'new@example.com' },
    });
    fireEvent.change(screen.getByTestId('input-password'), {
      target: { value: 'password123' },
    });

    // Submit the form
    fireEvent.submit(screen.getByTestId('button-register'));

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

    render(<Register />);

    // Click Google sign in button
    fireEvent.click(screen.getByTestId('button-sign-in-with-google'));

    // Verify console.log was called
    expect(consoleSpy).toHaveBeenCalledWith('Google Sign In');

    // Clean up
    consoleSpy.mockRestore();
  });

  it('shows the temporary registration disabled notice', () => {
    render(<Register />);

    // Check for the notice
    expect(
      screen.getByText('*Registration temporarily disabled*')
    ).toBeInTheDocument();
  });
});
