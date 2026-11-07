const backendOrigin = 'http://localhost:3003'

export default function resolveImageUrl(imagePath) {
  return new URL(imagePath, backendOrigin).toString()
}
