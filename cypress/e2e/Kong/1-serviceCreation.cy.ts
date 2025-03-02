import { ServiceCreation } from "../../support/utilities/ServiceCreation";
import { Service, AdvancedFields } from "../../support/Classes/Service";

describe('Service Creation and Personalization', () => {
    let workspaceName: string = 'default';
    let BTN_AddAGateway: string = 'Add a Gateway Service';
    let serviceCreationEndpoint: string = 'services';
    let serviceName: string;
    beforeEach(() => {
        cy.log('Kong\'s about to Roar 🐒');
        let url: string = Cypress.env('URL');

        cy.visit(url);
        cy.title().should('eq', "Workspaces | Kong Manager");
        cy.url().should('contain', "/workspaces");
        cy.getByDataTestId('workspace-link-default').contains('div', workspaceName).click();
        cy.url().should('contains', `/${workspaceName}/overview`);
        cy.getByDataTestId('action-button').contains(BTN_AddAGateway).click();
        cy.url().should('contains', `/${workspaceName}/${serviceCreationEndpoint}/create?cta=new-user`);
    })
    
    it('Happy Path - Create a Service - by specifying Full Url', () => {
        let serviceConfig: Service = new Service('PokemonService', ["tag1"], "http", "localhost", 8002, "Pokemon", true, null);

        ServiceCreation(serviceConfig);
        serviceName = serviceConfig.ServiceName;
    })

    it('Happy Path - Create a Service - by specifying Protocol, Host, Port and Path', () => {
        let serviceConfig: Service = new Service('PokemonService', ["123"], "https", "localhost", 8002, "Pokemon", false, null);

        ServiceCreation(serviceConfig);
        serviceName = serviceConfig.ServiceName;
    })

    it('Happy Path - Create a Service - by Full Url + Advanced Fields', () => {
        let serviceConfig: Service = new Service('PokemonService', ["%#@\\'"], "grpc", "localhost", 8002, "Pokemon", true, new AdvancedFields("5", "30000", "60000", "60000"));

        ServiceCreation(serviceConfig);
        serviceName = serviceConfig.ServiceName;
    })
    
    it('Happy Path - Create a Service - by specifying Protocol, Host, Port and Path + Advanced Fields', () => {
        let serviceConfig: Service = new Service('PokemonService', [`${Math.random()}`], "ws", "localhost", 8002, "Pokemon", false, new AdvancedFields("0", "1000", "30000", "30000"));

        ServiceCreation(serviceConfig);
        serviceName = serviceConfig.ServiceName;
    })

    afterEach(() => {
        cy.log('Monkey goes 💤 . . .');

        cy.getByDataTestId('header-actions').should('contain.text', 'Gateway Service actions').click();
        cy.get('button[data-testaction=action-delete]').click();
        cy.getByDataTestId('confirmation-input').should('have.attr', 'aria-label', `Type '${serviceName}' to confirm your action.`).type(serviceName);
        cy.getByDataTestId('modal-action-button').should('have.text', 'Yes, delete').click();
        cy.get('p[class=toaster-message]').should('have.text', `Gateway Service "${serviceName}" successfully deleted!`);
        cy.getByDataTestId('toaster-close-icon').should('have.attr', 'class', 'toaster-close-icon').click();
    })
})