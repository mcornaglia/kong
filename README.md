# Task

- Setup a CI/CD
- In the first step the pipeline must download, or get to, a `docker-compose.yml`
- Once in the proper folder the pipeline shall run `docker-compose up -d` to bootstrap the application
- It must navigate to `http://localhost:8002` to validate that the application has started
- The pipeline shall execute the test suite from start to end providing the results throughout the console
    - The tests must concern the flow to create a new Service from scratch using the UI
    - And also any additional entity related to a Service
    - The tests shall also provide a report at the end showing the outcome of the test execution
- At the end of the pipeline, whatever the result, a `docker-compose down` command must be ran to shutdown the application.

## General Consideration

I've decided to embark in the assignment by also challenging myself. As mentioned during the interview I've never had experience before on Typescript, nor on CI/CD. I've decided to experiment with both because I think they're both important skills that I wanted to delve into. I've used this situation to understand a few more concepts related to those two realities and also, as mentioned, I like to experiment and improve myself every day.

## Doubts

The Word file mentioned `During your first panel interview, you received login credentials for http://localhost:8002/login.`. I'm not sure I properly understood this part (or maybe I lost something on the way?) because since once Kong was setup I didn't have to login. Moreover, by reaching the `/login` endpoint I noticed the following message ![Authentication not enabled](./img/authNotEnabled.png)

## Installation

* `git clone`
* `cd kong`
* `npm install`
* Add the following `.env` file to the solution:
```
URL = 'http://localhost:8002'
BE_URL = 'http://localhost:8001'
LOGIN_ENDPOINT = '/login'
CULTURE = 'en-US'
APP_VERSION = '1.0.0'
TEST_VERSION = '1.0.0'
```
* `cd .github\workflows`
* `docker-compose up -d`
* `npm run suite` (to run both the test file `1-serviceCreation.cy.ts` and `2-routeAddition.cy.ts`)
* `npm run report` (to generate the report of both the test files)

## CI/CD

For the CI/CD I preferred to rely on your suggestions by using GitHub Actions. I've set up a `.yml` file by also looking up on the internet (specifically for the `.yml` specific commands which I didn't know earlier) that is composed as it follows:
* On push, the pipeline starts.
* The agent first install `ubuntu-24.04`
* Checks out in the current repository. By default `$ {{ github.repository }}`, so the current one
* Downloads docker compose within `curl` and places it in `/usr/bin/docker-compose` (in here I had to rely also in my knowledge of Linux to make it work, because the normal command I've found on the docker website wasn't properly working. Thus I put it in `/usr/bin`, chmodded it to make it executable and then used it aftewards as a global variable)
* Even though it wasn't strictly necessary for the sake of this test, I've tried out the secrets behaviour by adding secrets to the current repositoy referring to the URL of the application and the one of the Backend. To do so I created an `.env` file and placed those two variables in it.
* I then Launched Kong Manager by cd inside the `.github/workflows` path and then `docker-compose up -d`
* Cypress is downloaded and executes the test suite present in the current repository according to the `cypress-config.js` file
* Last, but not least, in whatever the outcome of the Tests executed, I `always()` use `docker-compose down` to shutdown the application.

## Report

Paradoxically, this part has been probably one of the most annoying because I wanted to attach screenshots and videos to the report and I struggled in doing so. I used to do that once in the past, but now I think simply due to the report generation pointing to the wrong folder I couldn't make it work as intended.
However, I generated a report 

## Execution

I've developed a small solution that comprehends two tests:
* Service Creation
* Route Addition

### Service Creation
---

#### beforeEach()

The former one contains a `beforeEach()` function that is responsible to set up any subsequent test. The target of this beforeEach is to reach the the poin where the test is effectively ready to start the creation of the Service. 
This means that the beforeEach:
* Navigates to the initial endpoint
* Clicks on the default workspace generated at the bootstrapping
* Clicks on add a gateway
* Validates that the test has effectively reached the creation endpoint by checking that the endpoint is `/${workspaceName}/${serviceCreationEndpoint}/create?cta=new-user`

#### Service Creation tests

We have a few tests that aims to validate:
* The fact that the option to create a Service by Full Url or Protocol, Host, Port and Path is working
* Checking that it's possible to set the Advanced Fields correctly

Each test is composed of 3 commands, substantially.

* To beautify and simplify the test structure I have created a `Service` class that contains all the options that the user can set inside the application. Due to the nature of the test, each test can have a custom Service to define static data that permits repetition overtime and by different test scenarios. However, it's also possible to declare custom variables on top and inject them at runtime to each test to permit flexibility over test generation.
* The `ServiceCreation` function aims to avoid repetition in each test. It takes in input a `Service` and from there it just compile all the predefined steps intended to be tested (in a happy path forma mentis) throughout the test execution. (here, the solution could've been improved furtherly by creating smaller functions that were targeting chunks of action or even single actions eventually). This function is also responsible to make some logical checks on the type of `Service` properties passed. 
We have a check on `IsFullUrl` which adjust the test to either compile the FullUrl option ![Fullurl](./img/fullUrl.png) or the Protocol,Host,Port and Path option ![Protocol, Host, Port and Path](./img/protocolHostPortPath.png) option. We then have a check on the presence or not of the Advanced Fields. If the object passed is not null, then the function will undergo the Advanced Fields option ![Advanced Fields](./img/viewAdvancedFields.png) and will travel in each field passed on the properties passed. Last, but not least, due to functional behaviour of Kong, we validate the type of protocol in order to enter a path only under some circumstances, there the definitions of `secureProtocols` and `protocolsWithPath`.
* Once the `ServiceCreation` function has finished, we catch the brand new ServiceName our `Service` object. Since we'll need it in the `afterEach()` method

#### afterEach()

In the afterEach method we go, throughout the UI, step by step to achieve the deletion of the service. This will permit our test solution to perform the subsequent test back as it was in the initial state.

##### Consideration on the afterEach()

In a way, this can consist in a drawback since if the first failure, for any reason, returns an error it can cause, at the state of art to make the subsequent tests fail in cascade. There could be eventually the chance to add a condition during the `beforeEach()` that checks the status of the Services and, if there's at least one still up, follows a different path a creates a new service by manually stepping through another application's pathway.

### Route Addition
---

Here things a bit more sophisticated. First of all, the RouteAddition test contains:
* `before()`
* `beforeEach()`
* The list of tests to be executed
* `afterEach()`
* `after()`

Secondly, due to the UI nature of the creation of the `ServiceCreation` test, I wanted to be a bit more creative and play a bit with the APIs. The main consideration which moved me in this direction was the tests speed.

Contrary to the Services, Routes require a service to be already up and running. The procedure would've been to, in every test:
* Land on the application home
* Open the Service Creation form
* Compile the Service Creation form
* Wait for the Service Creation form
* Open the Routes endpoint and proceed with the Route creation

When it comes to a couple of test, it clearly doesn't make the difference, but when you might have hundreds, specifically on routes, then the time consumption becomes significant.
Based on those consideration, let's see in details the composition of each state of the test

#### before()

Inside the `before()` function, I'm generating a service by recalling the `/default/schemas/services/validate` in combo with the `/default/services` endpoint. This is because I've realized that Kong before effectively creating the service launches a `validate` endpoint to be certain that the service has been set up properly and, I assume, to sanitize data from incompliant or dangerous strings. Thus, I first call `validate` and within a promise I then call `services` to effectively create the brand new service. I then return within another promise a log prompting in cypress that the service has been created and, most importantly, I recover the `serviceId`. The serviceId becomes crucial for the proper working of this test because during `after()` function it'll be required to delete the Service and cleanup the state.
Moreover, in the before I check whether the `Service` passed is of type `secure`. This is because based on that I automatically switch the port to :8443 or :443. I also create a serviceName by adding a random floored number to prevent service's duplication error in case of a test failure.

#### beforeEach()

Inside the `beforeEach()` I simply navigate to the routes url.

#### Route Addition tests

Inside each of the tests I define a `Route`. Similar to what has been done for the `Service` class, the `Route` contains informations about the route to be created (for time reasons I stripped the advanced fields in this case since the customisation were too many to be handled, similarly to what has been done with `Service` with the difference that there at least a basic configuration is there). 
The route currently handles different protocols, handled within an `Enum` and different methods, handled as well with an `Enum`. Based on the ACs of an hypothetical implementation, the tester is able to customise is route to accomodate and test the ACs. For instance, in the case of selecting a `TCP` protocol, the user isn't able to input methods.
For the sake of intentionally making a test fail (I made an assumption based on the UI/UX and figured that a specific scenario, in my honest opinion, could've been improved) I've defined a `Source` object. I'll explain it later in the next chapters.
We then have a `RouteCreation` function. Similarly to the `ServiceCreation` function, the target is to collect in a single function all the set of actions that an user makes within the application to set up his/her Routes.
Inside the `RouteCreation` function I undergo all the actions present in the Route creation and then I made the following two conditions:
* Verify that if the test provides a protocol which exists in the `protocolsWithNoPath` array, then the test checks that the `routing-rules-warning` data-testid isn't visible. This will trigger a failure, since it's automatically shown. My assumption here was that if the user selects a protocol which has no Paths, the first option listed below must be selected by default (to avoid the user to make one additional click)
* If the Methods injected are not null, then for each of the methods I target the toggle button of the given method and toggle it

Last, but not least, since I intercept a `*/routes/*` to catch the route creation, I then wait, for the API to respond and I catch the `routeId`. This is currently unimplemented, but in the tests concerning a dependency of the route (i.e. a Plugin) could become handy to delete a route quickly.

#### afterEach()

The `afterEach()` method contains all the UI actions that concur to delete the Route created. Since the `routeName` is initialized globally at the beginning of the fil, each test appends a value on it and in the afterEach we have the Route Name to input during the deletion of the Route.

#### after()

During the `after()` function a `DELETE` is called to also remove the Service created during the test execution. This grants, again, the reset to the initial status.

## Custom Commands

I've noticed the frequency you use to define some data-testid objects in the DOM. I then decided to leverage on their existence to properly target an element in a quicker way. I've then created a custom command called `getByDataTestId` which accepts the name of the data-testid specified in the DOM to yield the object retrieved.

## Final Consideration

Didn't Automate:
- Is the name field accepting only a subset of characters (in the current case, letters, numbers, and chars in ['.','_','-','~']).
- When choosing a non secure protocol, 443 cannot be inserted by the user (it's automatically reverted to :80)

In the routes I avoided adding classes for each type of Protocols. Probably the best idea would be to have classes for each selection that toggle in the test specific criteria based on the type (i.e. enabling Paths, certificates, etc.)

I did not implement a POM for each view, it could've been easier to tag a given DOM element within a talking name (i.e. BTN_AddAGateway). I did not since the repetition isn't too high for the purposes of the assignment.
Due to the nature of the assignment, I mostly aimed to happy path scenarios. I've tried to address some assertions but since I haven't been given specific ACs I've preferred to prepare a happy path by adding some consideration on some behaviours I've found during the testing.

## Questions:

Is a service intended to have a null name (it is generated with a GUID).
Since the same is happening also for routes, I'm guessing it's intended.
I've notice how during the Route selection, by setting a different protocol there's not a default option set (i.e. I select TLS and by default Source or Destionations or SNIs is selected. Prompting the user a warning message). Might be a wanted behaviour, but I'm reporting this because in my opinion that could potentially be an enhancement. (leads to the Failing test I've added on purpose in `2-routeAddition.cy.ts`)

### Elapsed
8.16 PM 28/02/2025

### End Time
7.03 PM 02/03/2025
