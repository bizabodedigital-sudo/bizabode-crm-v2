export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("bizabode_token")
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}
