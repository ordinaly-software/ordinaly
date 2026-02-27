"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import EmailVerificationModal from "@/components/ui/email-verification-modal";

interface EmailVerificationContextType {
  /**
   * Opens the verification modal for the given email.
   * Call this when you detect the user needs to verify.
   */
  promptVerification: (email: string) => void;

  /**
   * Checks if an API response is a 403 "email_not_verified" error.
   * If so, opens the verification modal and returns true.
   * Otherwise returns false.
   *
   * Usage:
   *   const data = await res.json();
   *   if (handleVerificationError(res, data)) return;
   */
  handleVerificationError: (
    response: Response,
    data: Record<string, unknown>
  ) => boolean;
}

const EmailVerificationContext = createContext<
  EmailVerificationContextType | undefined
>(undefined);

export function EmailVerificationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const patchedRef = useRef(false);

  const promptVerification = useCallback((userEmail: string) => {
    setEmail(userEmail);
    setIsOpen(true);
  }, []);

  const handleVerificationError = useCallback(
    (response: Response, data: Record<string, unknown>): boolean => {
      if (response.status === 403 && data?.code === "email_not_verified") {
        const userEmail =
          (data.email as string) ||
          localStorage.getItem("pending_email") ||
          "";
        if (userEmail) {
          promptVerification(userEmail);
        }
        return true;
      }
      return false;
    },
    [promptVerification]
  );

  const handleVerified = useCallback(() => {
    setIsOpen(false);
    setEmail("");
    // Reload the page so all app state reflects the verified status
    window.location.reload();
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Global fetch interceptor: automatically detect 403 "email_not_verified"
  // responses and open the verification modal without needing to modify
  // every individual API call site.
  useEffect(() => {
    if (patchedRef.current) return;
    patchedRef.current = true;

    const originalFetch = window.fetch;

    window.fetch = async function patchedFetch(
      input: RequestInfo | URL,
      init?: RequestInit
    ): Promise<Response> {
      const response = await originalFetch.call(window, input, init);

      if (response.status === 403) {
        // Clone so the caller can still read the body normally
        const cloned = response.clone();
        try {
          const data = await cloned.json();
          if (data?.code === "email_not_verified") {
            const userEmail =
              (data.email as string) ||
              (typeof localStorage !== "undefined"
                ? localStorage.getItem("pending_email")
                : "") ||
              "";
            if (userEmail) {
              window.dispatchEvent(
                new CustomEvent("email-verification-required", {
                  detail: { email: userEmail },
                })
              );
            }
          }
        } catch {
          // Response body wasn't JSON – ignore
        }
      }

      return response;
    };
  }, []);

  // Listen for the custom event dispatched by the fetch interceptor
  useEffect(() => {
    const handler = (e: Event) => {
      const { email } = (e as CustomEvent<{ email: string }>).detail;
      if (email) {
        promptVerification(email);
      }
    };

    window.addEventListener("email-verification-required", handler);
    return () =>
      window.removeEventListener("email-verification-required", handler);
  }, [promptVerification]);

  return (
    <EmailVerificationContext.Provider
      value={{ promptVerification, handleVerificationError }}
    >
      {children}
      <EmailVerificationModal
        isOpen={isOpen}
        onClose={handleClose}
        onVerified={handleVerified}
        email={email}
      />
    </EmailVerificationContext.Provider>
  );
}

export function useEmailVerification(): EmailVerificationContextType {
  const context = useContext(EmailVerificationContext);
  if (!context) {
    throw new Error(
      "useEmailVerification must be used within an EmailVerificationProvider"
    );
  }
  return context;
}
