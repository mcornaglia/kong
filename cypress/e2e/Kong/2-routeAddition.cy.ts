import { AdvancedFields, Service } from "../../support/Classes/Service";
import { RouteProtocols } from "../../support/Enums/RouteProtocols";
import { Methods } from "../../support/Enums/Methods";
import { RouteCreation } from "../../support/utilities/RouteCreation";
import { Route, Source } from "../../support/Classes/Route";

describe('Service Creation and Personalization', () => {
    let serviceId: string;
    let routeName: string;
    let routeId: string;
    let serviceConfig: Service = new Service('', "tag1", RouteProtocols.HTTP.toLowerCase(), "localhost", 8002, "Pokemon", true, new AdvancedFields("5", "30000", "60000", "60000"));
    before(() => {
        cy.log('Kong\'s about to Roar 🐒');
        let secureProtocols: string[] = ["grpcs","https","tls","wss"];
        serviceConfig.ServiceName = "Pokemon" + Math.floor(Math.random()*100000);
        let body: string = `{"name":"${serviceConfig.ServiceName}","tags":["${serviceConfig.Tags}"],"read_timeout":${serviceConfig.AdvancedFields.ReadTimeout},"retries":${serviceConfig.AdvancedFields.Retries},"connect_timeout":${serviceConfig.AdvancedFields.ConnectionTimeout},"ca_certificates":null,"client_certificate":null,"write_timeout":${serviceConfig.AdvancedFields.WriteTimeout},"port":${secureProtocols.filter(item => item == serviceConfig.Protocol).length > 0 ? 8443 : serviceConfig.Port},"url":"${serviceConfig.Protocol}://${serviceConfig.Host}:${secureProtocols.filter(item => item == serviceConfig.Protocol).length > 0 ? 8443 : serviceConfig.Port}"}`
        cy.request({
            method: 'POST',
            url: `${Cypress.env('BE_URL')}/default/schemas/services/validate`,
            body: body,
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(() => {
            cy.request({
                method: 'POST',
                url: `${Cypress.env('BE_URL')}/default/services`,
                body: body,
                headers: {
                    'Content-Type': 'application/json',
                }
            }).then((req) => {
                cy.log(`Service ${serviceConfig.ServiceName} created successfully ! 😉`);
                serviceId = req.body["id"];
            })
        });
    })
    beforeEach(() => {
        let urlGateway: string = Cypress.env('URL');
        cy.visit(urlGateway + "/default/routes");
    })
    
    it('Happy Path - RESTful - Add a Route to a Service', () => {
        routeName = 'fire_type';
        let routePath: string = '/fire'
        let routeConfig: Route = new Route(
            routeName,
            routePath.replace("/", ""),
            RouteProtocols.HTTP_HTTPS,
            routePath,
            [Methods.GET, Methods.PUT],
            null
        );

        RouteCreation(serviceConfig, routeConfig)
        cy.wait('@routeCreation').then((req) => {
            cy.log(`Attached route to ${serviceConfig.ServiceName} with name ${routeConfig.RouteName}`)
            routeId = req.response.body["id"];
        })
    })
    it('Happy Path - Validate that Protocols without Path have an option selected automatically', () => {
        routeName = 'psychic_type';
        let routePath: string = '/psychic'
        let routeConfig: Route = new Route(
            routeName, 
            routePath.replace("/", ""), 
            RouteProtocols.TCP_TLS, 
            routePath, 
            Methods.NONE,
            new Source("192.168.10.147",8443)
        );
        RouteCreation(serviceConfig, routeConfig)
        cy.wait('@routeCreation').then((req) => {
            cy.log(`Attached route to ${serviceConfig.ServiceName} with name ${routeConfig.RouteName}`)
            routeId = req.response.body["id"];
        })
    })

    afterEach(() => {
        cy.log('Route goes 💤 . . .');

        cy.getByDataTestId('header-actions').should('contain.text', 'Route actions').click()
        cy.get('button[data-testaction=action-delete]').click();
        cy.getByDataTestId('confirmation-input').should('have.attr', 'aria-label', `Type '${routeName}' to confirm your action.`).type(routeName);
        cy.getByDataTestId('modal-action-button').should('have.text', 'Yes, delete').click();
        cy.get('p[class=toaster-message]').should('have.text', `Route "${routeName}" successfully deleted!`);
    })
    after(() => {
        cy.request({
            method: 'DELETE',
            url: `${Cypress.env('BE_URL')}/default/services/${serviceId}`,
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(() => {
            cy.log('.. and with Monkey also the Service shuts down');
        })
    })
})