import { Service, AdvancedFields } from "../Classes/Service";

export function ServiceCreation(serviceConfig: Service) {
  describe('Instance Creation', () => {
    cy.getByDataTestId('gateway-service-name-input').should('have.attr','placeholder', 'Enter a unique name').type(`${serviceConfig.ServiceName}`);
    cy.getByDataTestId('gateway-service-tags-input').should('have.attr','placeholder', 'Enter a list of tags separated by comma').type(`${serviceConfig.Tags}`);
    cy.getByDataTestId('gateway-service-url-radio').should('have.attr', 'aria-checked', 'true');
    if (serviceConfig.IsFullUrl) {
        cy.getByDataTestId('gateway-service-url-input').should('have.attr', 'placeholder', 'Enter a URL').type(`http://localhost:8002/${serviceConfig.Path.toLowerCase()}`);
    }
    else {
        cy.getByDataTestId('gateway-service-protocol-radio').should('have.attr', 'aria-checked', 'false').click();
        AdvancedServiceEndpointSetup(serviceConfig.Protocol, serviceConfig.Host, serviceConfig.Port, serviceConfig.Path);
    }
    if (serviceConfig.AdvancedFields != null) {
        cy.getByDataTestId('collapse-trigger-label').should('have.text', 'View Advanced Fields').click();
        cy.getByDataTestId('gateway-service-retries-input').should('have.attr', 'value', 5).clear().type("{del}" + serviceConfig.AdvancedFields.Retries.toString());
        cy.getByDataTestId('gateway-service-connTimeout-input').should('have.attr', 'value', 60000).clear().type("{del}" + serviceConfig.AdvancedFields.ConnectionTimeout.toString());
        cy.getByDataTestId('gateway-service-writeTimeout-input').should('have.attr', 'value', 60000).clear().type("{del}" + serviceConfig.AdvancedFields.WriteTimeout.toString());
        cy.getByDataTestId('gateway-service-readTimeout-input').should('have.attr', 'value', 60000).clear().type("{del}" + serviceConfig.AdvancedFields.ReadTimeout.toString());
    }
    cy.getByDataTestId('service-create-form-submit').should('have.text', 'Save').click();
    cy.get('p').should('have.attr', 'class', 'toaster-message').and('have.text', `Gateway Service "${serviceConfig.ServiceName}" successfully created!`);
    cy.getByDataTestId('toaster-close-icon').should('have.attr', 'class', 'toaster-close-icon').click();
  })
}

export function AdvancedServiceEndpointSetup(protocol: string, host: string, port: number, path?: string) {
    cy.getByDataTestId('gateway-service-protocol-select').should('have.attr', 'placeholder', 'http').click();
    cy.getByDataTestId(`select-item-${protocol}`).should('have.attr', 'role', 'option').click(); // check cypress scrolling
    cy.getByDataTestId('gateway-service-host-input').should('have.attr', 'placeholder', 'Enter a host').type(host);
    let secureProtocols: string[] = ["grpcs","https","tls","wss"];
    let protocolsWithPath: string[] = ["http", "https", "ws", "wss"];
    if (protocolsWithPath.filter(item => item == protocol).length > 0)
        cy.getByDataTestId('gateway-service-path-input').should('have.attr', 'placeholder', 'Enter a path').type("/" + path);
    cy.getByDataTestId('gateway-service-port-input').should('have.attr', 'value', secureProtocols.filter(item => item == protocol).length > 0 ? 443 : 80).clear()
        .type(secureProtocols.filter(item => item == protocol).length > 0 ? "{del}8443" : "{del}" + port.toString());
}