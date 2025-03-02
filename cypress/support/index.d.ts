declare namespace Cypress {
    interface Chainable {
      /**
       * Custom command to do something.
       * @example cy.myCustomCommand('param1', 'param2')
       */
      getByDataTestId(param1: string): Chainable<JQuery<HTMLElement>>;
    }
  }