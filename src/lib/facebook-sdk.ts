/**
 * Facebook SDK Loader & Helper
 * Handles dynamic script injection and initialization for Meta WhatsApp Embedded Signup.
 */

declare global {
  interface Window {
    fbAsyncInit: () => void;
    FB: any;
  }
}

export const loadFacebookSDK = (): Promise<void> => {
  return new Promise((resolve) => {
    if (window.FB) {
      resolve();
      return;
    }

    window.fbAsyncInit = function() {
      resolve();
    };

    // Load the SDK asynchronously
    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s) as HTMLScriptElement;
      js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode?.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  });
};

export const initFacebookSDK = (appId: string) => {
  if (window.FB) {
    window.FB.init({
      appId: appId,
      cookie: true,
      xfbml: true,
      autoLogAppEvents: true,
      version: 'v25.0'
    });
  }
};

/**
 * Launches the WhatsApp Embedded Signup flow.
 * Returns a promise that resolves with the authResponse.
 */
export const launchWhatsAppSignup = (configId?: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!window.FB) {
      reject(new Error("Facebook SDK not loaded"));
      return;
    }

    const loginOptions = {
      scope: 'whatsapp_business_management,whatsapp_business_messaging',
      extras: {
        feature: 'whatsapp_embedded_signup',
        // If we have a configId (Login for Business), we use it here.
        // setup: { ... }
        ...(configId && { config_id: configId })
      }
    };

    window.FB.login((response: any) => {
      if (response.authResponse) {
        resolve(response.authResponse);
      } else {
        reject(new Error("User cancelled login or did not fully authorize."));
      }
    }, loginOptions);
  });
};
