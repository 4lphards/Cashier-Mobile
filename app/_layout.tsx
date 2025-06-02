
import { Stack } from "expo-router"
import { ToastProvider } from "~/contexts/toastContext"
import "~/global.css"

export default function RootLayout() {
  return (
    <ToastProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ToastProvider>
  )
}
