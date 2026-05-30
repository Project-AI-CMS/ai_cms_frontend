import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WorkOrderForm } from "@/components/WorkOrderForm";

const apiMocks = vi.hoisted(() => ({
  assetGetAllMock: vi.fn(),
  workOrderCreateMock: vi.fn(),
  workOrderGetByIdMock: vi.fn(),
  workOrderUpdateMock: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  assetApi: {
    getAll: apiMocks.assetGetAllMock,
  },
  workOrderApi: {
    create: apiMocks.workOrderCreateMock,
    getById: apiMocks.workOrderGetByIdMock,
    update: apiMocks.workOrderUpdateMock,
  },
}));

const user = {
  id: "user-1",
  name: "Ada Admin",
  role: "Administrator" as const,
  email: "admin@example.com",
};

describe("WorkOrderForm", () => {
  it("loads dropdown data and validates required fields", async () => {
    apiMocks.assetGetAllMock.mockResolvedValueOnce({ data: [] });

    render(
      <WorkOrderForm
        user={user}
        onBack={vi.fn()}
        onSuccess={vi.fn()}
      />,
    );

    await waitFor(() => expect(apiMocks.assetGetAllMock).toHaveBeenCalledWith({}));

    const form = document.querySelector("form");
    expect(form).not.toBeNull();
    fireEvent.submit(form as HTMLFormElement);

    expect(await screen.findByText("Please fix the validation errors")).toBeInTheDocument();
    expect(screen.getByText("Title is required")).toBeInTheDocument();
    expect(screen.getByText("Description is required")).toBeInTheDocument();
    expect(screen.getByText("Asset is required")).toBeInTheDocument();
    expect(apiMocks.workOrderCreateMock).not.toHaveBeenCalled();
  });
});
