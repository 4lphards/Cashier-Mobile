import React from "react";
import { Stack } from "expo-router";
import { ToastProvider } from "~/contexts/toastContext";

const TransactionLayout: React.FC = React.memo(() => {
  return (
    <ToastProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ToastProvider>
  );
});

export default TransactionLayout;