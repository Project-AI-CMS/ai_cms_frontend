import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("http://localhost:8001/api/assets", () => {
    return HttpResponse.json({ data: [], pagination: { page: 1, limit: 0, total: 0, totalPages: 1 } });
  }),
];
