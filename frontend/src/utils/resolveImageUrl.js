const backendOrigin = import.meta.env.VITE_API_URL

export default function resolveImageUrl(imagePath) {
  return new URL(imagePath, backendOrigin).toString()
}
