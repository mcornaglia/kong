import { Route } from "../Classes/Route";
import { Service, AdvancedFields } from "../Classes/Service";

export function RouteCreation(serviceConfig: Service, routeConfig: Route) {
  
  describe('Route Creation', () => {
    cy.getByDataTestId('empty-state-action').should('have.attr', 'href', '/default/routes/create').click();
    cy.getByDataTestId('route-form-name').type(routeConfig.RouteName);
    cy.getByDataTestId('route-form-service-id').click();
    cy.get('div[class="route-form-service-dropdown-item"]>span:first').should('have.text', serviceConfig.ServiceName).click();
    cy.getByDataTestId('route-form-tags').type(routeConfig.Tags);
    cy.getByDataTestId('route-form-protocols').should('have.attr', 'placeholder', 'HTTP, HTTPS').as('ProtocolsSelector')
    cy.get('@ProtocolsSelector').click();
    cy.getByDataTestId(`select-item-${routeConfig.Protocol.toLowerCase().replace(" ", "")}`).should('have.text', `${routeConfig.Protocol.toUpperCase()}`).click();
    let protocolsWithNoPath: string[] = ["TCP","TLS","UDP","TCP,UDP","TCP,TLS","TCP,TLS,UDP","TLS_PASSTHROUGH","UDP"];
    cy.get('@ProtocolsSelector').should('have.attr', 'placeholder', routeConfig.Protocol);
    cy.wait(100); // debounce time
    if (protocolsWithNoPath.filter(item => item == routeConfig.Protocol.replace(" ", "")).length > 0) {
      cy.getByDataTestId(`routing-rules-warning`).should('not.be.visible');
    }
    cy.getByDataTestId('route-form-paths-input-1').should('have.attr', 'placeholder' , 'Enter a path').type(routeConfig.Path);
    cy.getByDataTestId('routing-rule-methods').click();
    if (routeConfig.Methods != null) {
      routeConfig.Methods.forEach(method => {
          cy.get(`div[class="k-badge ${method.toString().toLowerCase()} method"]`).prev().click()
      });
    }
    cy.intercept('*/routes/*').as('routeCreation')
    cy.getByDataTestId('route-create-form-submit').click();
    cy.get('p[class=toaster-message]').should('have.text', `Route "${routeConfig.RouteName}" successfully created!`);
    cy.getByDataTestId('toaster-close-icon').should('have.attr', 'class', 'toaster-close-icon').click();
  })
}