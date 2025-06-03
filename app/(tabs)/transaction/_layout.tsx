import { Stack } from "expo-router";
import { ToastProvider } from "~/contexts/toastContext";

export default function TransactionLayout() {
    return (
        <ToastProvider>
            <Stack screenOptions={{ headerShown: false }} />
        </ToastProvider>
    );
}