import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { analyticsApi } from "@/lib/analytics";

vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockedAxios = vi.mocked(axios);

const predictionRequest = {
  asset_id: "asset-1",
  temperature: 70,
  vibration: 0.3,
  pressure: 12,
  runtime_hours: 1200,
};

describe("analyticsApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches analytics health", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { status: "ok" } });

    await expect(analyticsApi.health()).resolves.toEqual({ status: "ok" });
    expect(mockedAxios.get).toHaveBeenCalledWith("http://localhost:8000/api/v1/analytics/health");
  });

  it("fetches dashboard analytics", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { total_predictions: 2 } });

    await expect(analyticsApi.getDashboard()).resolves.toEqual({ total_predictions: 2 });
    expect(mockedAxios.get).toHaveBeenCalledWith("http://localhost:8000/api/v1/analytics/dashboard");
  });

  it("submits a single prediction request", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { asset_id: "asset-1", risk_score: 0.2 } });

    await expect(analyticsApi.predictSingle(predictionRequest as never)).resolves.toEqual({
      asset_id: "asset-1",
      risk_score: 0.2,
    });
    expect(mockedAxios.post).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/analytics/predict",
      predictionRequest,
    );
  });

  it("submits a batch prediction request", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: [{ asset_id: "asset-1" }] });

    await expect(analyticsApi.predictBatch([predictionRequest] as never)).resolves.toEqual([
      { asset_id: "asset-1" },
    ]);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/analytics/predict/batch",
      [predictionRequest],
    );
  });

  it("fetches the latest prediction for an asset", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { asset_id: "asset-1" } });

    await expect(analyticsApi.getLatestPrediction("asset-1")).resolves.toEqual({ asset_id: "asset-1" });
    expect(mockedAxios.get).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/analytics/predictions/asset-1/latest",
    );
  });

  it("fetches prediction history with a custom limit", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [{ asset_id: "asset-1" }] });

    await expect(analyticsApi.getPredictionHistory("asset-1", 5)).resolves.toEqual([
      { asset_id: "asset-1" },
    ]);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/analytics/predictions/asset-1/history",
      { params: { limit: 5 } },
    );
  });

  it("fetches prediction history with the default limit", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [] });

    await analyticsApi.getPredictionHistory("asset-1");

    expect(mockedAxios.get).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/analytics/predictions/asset-1/history",
      { params: { limit: 50 } },
    );
  });

  it("maps timeout errors", async () => {
    mockedAxios.get.mockRejectedValueOnce({ code: "ECONNABORTED" });

    await expect(analyticsApi.health()).rejects.toThrow("Request timeout. Please try again later.");
  });

  it("maps network errors", async () => {
    mockedAxios.get.mockRejectedValueOnce({ code: "ERR_NETWORK" });

    await expect(analyticsApi.health()).rejects.toThrow(
      "Unable to connect to the analytics service. Please check your connection and try again.",
    );
  });

  it("maps not found errors", async () => {
    mockedAxios.get.mockRejectedValueOnce({ response: { status: 404 } });

    await expect(analyticsApi.health()).rejects.toThrow("The requested resource was not found.");
  });

  it("maps validation errors with detailed messages", async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: { status: 422, data: { detail: [{ msg: "asset_id required" }, { msg: "temperature invalid" }] } },
    });

    await expect(analyticsApi.predictSingle(predictionRequest as never)).rejects.toThrow(
      "Validation error: asset_id required, temperature invalid",
    );
  });

  it("maps validation errors without details", async () => {
    mockedAxios.post.mockRejectedValueOnce({ response: { status: 422, data: {} } });

    await expect(analyticsApi.predictSingle(predictionRequest as never)).rejects.toThrow(
      "Invalid request. Please check your input.",
    );
  });

  it("maps server errors", async () => {
    mockedAxios.get.mockRejectedValueOnce({ response: { status: 500 } });

    await expect(analyticsApi.getDashboard()).rejects.toThrow("Analytics service error. Please try again later.");
  });

  it("uses response message when present", async () => {
    mockedAxios.get.mockRejectedValueOnce({ response: { data: { message: "Custom message" } } });

    await expect(analyticsApi.getDashboard()).rejects.toThrow("Custom message");
  });

  it("uses response detail when present", async () => {
    mockedAxios.get.mockRejectedValueOnce({ response: { data: { detail: "Detailed error" } } });

    await expect(analyticsApi.getDashboard()).rejects.toThrow("Detailed error");
  });

  it("falls back to a generic error", async () => {
    mockedAxios.get.mockRejectedValueOnce({});

    await expect(analyticsApi.getDashboard()).rejects.toThrow("An error occurred. Please try again.");
  });
});
