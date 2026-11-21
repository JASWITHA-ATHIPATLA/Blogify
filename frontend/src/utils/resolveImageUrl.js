import apiBaseUrl from './apiBaseUrl.js'

export default function resolveImageUrl(imagePath) {
  return new URL(imagePath, apiBaseUrl).toString()
}
