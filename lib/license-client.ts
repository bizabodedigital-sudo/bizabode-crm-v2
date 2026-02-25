import crypto from "crypto";

export interface LicenseValidationResult {
  valid: boolean;
  plan?: string;
  expiresAt?: string;
  error?: string;
  features?: string[];
  status?: string;
}

/**
 * Validates a license key against the official Bizabode Digital Solutions license server.
 * 
 * @param licenseKey The license key to validate
 * @param companyName Optional company name to bind the license to
 * @returns Promise<LicenseValidationResult>
 */
export async function validateLicenseKey(
  licenseKey: string,
  companyName?: string
): Promise<LicenseValidationResult> {
  const licenseServerUrl = process.env.LICENSE_SERVER_URL || "https://bizabodedigitalsolutions.com";
  const appKey = process.env.APP_KEY || "crm-v2-dev-key";
  const appSecret = process.env.APP_SECRET;
  
  const validationEndpoint = `${licenseServerUrl}/api/licenses/validate`;

  if (!appSecret) {
    console.error("APP_SECRET is not defined in environment variables");
    return {
      valid: false,
      error: "Application configuration error: Missing Secret",
    };
  }

  // Generate HMAC signature per APP_LICENSE_VERIFICATION.md spec
  const timestamp = new Date().toISOString();
  const nonce = crypto.randomBytes(16).toString("hex");
  const signatureString = `${appKey}:${timestamp}:${nonce}`;
  const signature = crypto
    .createHmac("sha256", appSecret)
    .update(signatureString)
    .digest("hex");

  try {
    const response = await fetch(validationEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-App-Key": appKey,
        "X-Timestamp": timestamp,
        "X-Nonce": nonce,
        "X-Signature": signature,
      },
      body: JSON.stringify({
        licenseKey,
        companyName,
      }),
      signal: AbortSignal.timeout(10000), 
    });

    if (!response.ok) {
      console.error(`License server returned status ${response.status}`);
      // If it's a 4xx error (like 400 Bad Request or 404 Not Found), it's likely an invalid key.
      if (response.status >= 400 && response.status < 500) {
         try {
           const errData = await response.json();
           return {
             valid: false,
             error: errData.error || "Invalid license key",
           };
         } catch {
            return {
              valid: false,
              error: "Invalid license key rejected by server",
            };
         }
      }
      
      // For 5xx errors, the server might be down
      return {
        valid: false,
        error: "License server is currently unavailable. Please try again later.",
      };
    }

    const data = await response.json();
    return {
      valid: data.valid === true,
      plan: data.plan,
      expiresAt: data.expiresAt,
      status: data.status,
      error: data.error,
    };
  } catch (error: any) {
    console.error("License validation request failed:", error);
    
    // Handle network errors or timeouts
    if (error.name === 'AbortError') {
      return {
        valid: false,
        error: "License validation timed out. Please try again.",
      };
    }
    
    return {
      valid: false,
      error: "Unable to connect to license server to verify your key.",
    };
  }
}
