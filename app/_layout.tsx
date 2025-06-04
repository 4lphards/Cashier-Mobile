import { Stack } from "expo-router"
import { ToastProvider } from "~/contexts/toastContext"
import { RefreshProvider } from "~/contexts/refreshContext"
import "~/global.css"

export default function RootLayout() {
  return (
    <RefreshProvider>
      <ToastProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </ToastProvider>
    </RefreshProvider>
  )
}
