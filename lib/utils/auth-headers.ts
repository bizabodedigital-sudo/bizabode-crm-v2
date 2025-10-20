export function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("bizabode_token")
  if (!token) {
    return {
      "Content-Type": "application/json",
    }
  }
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  }
}
