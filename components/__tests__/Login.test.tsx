import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Login } from "@/components/Login";

const loginMock = vi.fn();
const pushMock = vi.fn();

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    login: loginMock,
    loading: false,
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("Login", () => {
  beforeEach(() => {
    loginMock.mockReset();
    pushMock.mockReset();
  });

  it("shows a validation error when submitted empty", async () => {
    const { container } = render(<Login />);

    const form = container.querySelector("form");
    expect(form).not.toBeNull();
    fireEvent.submit(form as HTMLFormElement);

    expect(
      screen.getByText("Please enter email/username and password"),
    ).toBeInTheDocument();
    expect(loginMock).not.toHaveBeenCalled();
  });

  it("submits credentials and redirects after successful login", async () => {
    loginMock.mockResolvedValueOnce(undefined);
    render(<Login />);

    await userEvent.type(screen.getByLabelText(/email or username/i), "admin@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "secret");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(loginMock).toHaveBeenCalledWith("admin@example.com", "secret");
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/dashboard"), {
      timeout: 1000,
    });
  });

  it("shows the locked account message from auth failures", async () => {
    loginMock.mockRejectedValueOnce({
      statusCode: 423,
      message: "Account locked due to too many failed login attempts. Please try again later.",
    });
    render(<Login />);

    await userEvent.type(screen.getByLabelText(/email or username/i), "admin@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "secret");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(
      await screen.findByText(/account locked due to too many failed login attempts/i),
    ).toBeInTheDocument();
  });
});
