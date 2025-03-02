const { defineConfig } = require('cypress')
const dotenv = require('dotenv')

dotenv.config()

module.exports = defineConfig({
  viewportWidth: 1920,
  viewportHeight: 1080,
  defaultCommandTimeout: 5000,
  pageLoadTimeout: 10000,
  watchForFileChanges: true,
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: `cypress/results`,
    charts: true,
    embeddedScreenshots: true,
    inlineAssets: true,
    overwrite: false,
    saveAllAttempts: true,
  },
  e2e: {
    testIsolation: false,
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    excludeSpecPattern: '*.{feature,txt}',
    specPattern: `cypress/e2e/Kong/*.{js,jsx,ts,tsx}`,
    setupNodeEvents(on, config) {
      config.env.URL = process.env.URL;
      config.env.BE_URL = process.env.BE_URL;
      config.env.LOGIN_ENDPOINT = process.env.LOGIN_ENDPOINT;
      config.env.CULTURE = process.env.CULTURE;
      on('before:browser:launch', (browser, launchOptions) => {
        require('cypress-mochawesome-reporter/plugin')(on);
        if (browser.name === 'chrome' && browser.isHeadless) {
          launchOptions.args.push('--window-size=2560,1080')
          return launchOptions
        }
      });
      return config;
    }
  }
})