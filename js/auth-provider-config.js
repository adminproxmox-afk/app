window.AUTH_PROVIDER_CONFIG = {
  google: {
    enabled: true,
    // Must be a Google Cloud "Web application" OAuth client ID.
    // In Google Cloud Console, add every exact origin you use
    // (for example http://localhost:5500 or https://your-domain.com)
    // to "Authorized JavaScript origins" for this client.
    clientId: '996941941657-ircfkrk5tciv6njor6e8ibibc2t3fhhp.apps.googleusercontent.com'
  },
  telegram: {
    enabled: true,
    botUsername: 'app_noyname_bot',
    requestAccess: 'write',
    showUserPhoto: true
  }
};
