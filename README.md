# doctor-digital 

## Overview
We have an accelerator called [Apigee HealthAPIx software solution](https://github.com/apigee/flame) which assists healthcare providers in accelerating the development and delivery of digital services based on FHIR (Fast Healthcare Interoperability Resources) APIs.

Apigee HealthAPIx is built on the Apigee Edge API management platform, and features FHIR APIs and a healthcare developer portal to help hospitals meet the demand for data interoperability, deliver patient-centric healthcare, and move faster to the digital world.

http://fhirtest.uhn.ca/ is a publicly accessible FHIR server
We are using the DSTU2 FHIR server for this demo - http://fhirtest.uhn.ca/baseDstu2.
It is accessible using the HAPI client implementation.

We have interfaced some of these APIs(appointment booking) using dialogflow. 

## Components
#### Dialog flow agent - 
These are modules which convert user requests to actionable data
#### Apigee Edge - 
+ apiai-connector - webhook for the dialog flow agent. This is where all the actionable data is used to form an RESTful request for the provider.
+ fhir-api - This is a part of the flame solution which is built as an accelerator. This is the northbound part of the proxy to which the calls are made by the apiai-connector.
+ fhir-connector - This is also part of the flame solution. This is the southbound part of the proxy which connects to the publically accessible FHIR server.
+ auth-b2b - This is also a part of the flame solution. This is a Business2business authorization module for the FHIR APIs exposed as a part of the flame solution.

## Installation Instructions


#### Install edge componenets
#### Pre-requisites
##### Apigee edge account (https://enterprise.apigee.com)
##### node.js and npm
+ https://nodejs.org/en/download/
+ or 
```
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash 
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
nvm install --lts
```

##### Clone the repository
```
git clone https://github.com/rohan-m/doctor-digital.git
```
##### Enter edge directory
```
cd doctor-digital/edge/
```
##### Install gulp 
```
npm install --global gulp-cli
```
If you run into permission issues, try `sudo npm install --global gulp-cli`

##### Pull node modules
```
npm install
```
##### Run the deploy command
```
gulp deploy --target_server_host fhirtest.uhn.ca --target_server_port 80 --target_server_basepath /baseDstu2
```
This will interactively prompt you for following details, and will then create / deploy all relevants bundles and artifacts and will provision the **Doctor Digital Sandbox** on your own Org.

+ Edge Org name
+ Edge Username
+ Edge Password
+ Edge Env for deployment

#### Install dialogflow components
##### Pre-requisites
###### Dialogflow account(https://dialogflow.com)
+ Click on `Go to console`
+ Sign-in with your google account
##### Create a new agent
Before uploading the zip, please create a new agent, which is inturn assigned to a google project(default is to create a new one)
##### Import zip
+ Go to settings of the agent
+ Click on `Export and Import` tab
+ Select the `Import from zip`
+ Include the zip provided in this repository `dialogflow/doctor-digital-health.zip`
##### Modify fulfilment
+ Click on `Fulfilment`
+ Change the Webhook url to include the Edge organisation, environment and the API key of the api ai connector app `https://{org}-{env}.apigee.net/api/ai/connector/fhir?apikey={apiAiApp_consumerkey}`
+ Developer app `apiAiApp` got created in your org by the previous step, copy the consumer key
##### Add Integrations
+ Click on `Integrations`
+ Click on Google Assistant `Integration Settings`
+ You will find `TEST` and `MANAGE ASSISTANT APP`, click on `TEST` to start testing right away. Find the [optional] section here to add more details to the application like name, voice, other innvocations, 
+ You will visit Actions on Google simulator page
+ Please make sure that testing on device is enabled, which is the found at the first icon in the top right corner of the page
+ [Optional start] ----
+ Click on `MANAGE ASSISTANT APP` to configure the assistant
+ You will visit Actions on Google information page.
+ You find `App Information`. Click on it and click `Edit`. 
+ Click on `Assistant app name` to change its name.
+ Click on `Details`, you will find introduction, app voice, descriptions. You can fill them(its optional). In this same section you will find same invocations, ignore the existing ones, you can add upto 5 invocations(like `Connect to Digital Health` or `Connect to Doctor Digital`). Additionally you can also add images and other minute details.
+ Save the changes
+ Try `Test Draft` or Back to Dialogflow page click `TEST`
+ [Optional end] ----

## Usage Steps
Try the following on the actions simulator or your Google assistant app on your phone

+ Start with saying `Connect to Digital Health` or `Talk to Digital health` or any other invocations that may be set
+ It will ask for your phone number - 669 5858 is the default number to use, you can add a patient with a new number and a name and you can specify the same(to create a patient record and clinic location record find below optional section)
+ Once you have provide your phone details there are couple of things you can do Like
  + Get nearby clinic
  + Show my appointments - then delete my appointments 
  + Book a new appointment -works only when you have got the clinic info
  + Get wait time at the clinic -works only when you have got the clinic info
+ The assistant will end the conversation after a successful booking or deletion of an appointment, you may have to reconnect to list the appointment
+ There is a slight delay in listing the appointment as the data in the FHIR server is reflect after a few seconds.
+ [Optional start] ----
+ Please note
+ While creating a patient record, make sure that the phone number you add is unique among your peers and is pronounceable easily for demo purpose :)
```
curl -X POST \
  http://rmahalank1-eval-test.apigee.net/digital/health/admin/Patient \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
    "given_name": "Rohan",
    "family_name": "M",
    "phone_number": "6694747"
  }'
```
+ Please note
+ Fill in complete details to the accurate, especially the latitude and longitude as they are used to determine the clinics near to you.
```
curl -X POST \
  http://rmahalank1-eval-test.apigee.net/digital/health/admin/Location \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/json' \
  -d '{
    "hospital_name":"Digital University Medical Center",
    "addr_line":"Central Park",
    "city":"Bangalore",
    "state":"KA",
    "postal_code":"560033",
    "country":"IN",
    "lat":"12.994261",
    "long":"77.660916"
  }'

```
+ [Optional end] ----
