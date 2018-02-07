
var body = JSON.parse(context.getVariable('request.content'));
context.setVariable("request.content", JSON.stringify(body.result.fulfillment));
print(JSON.stringify(body.result.fulfillment));

var path = "";
var verb = "GET";
var reqBody = "{}";
var action = body.result.action;
var fulfillment = JSON.stringify(body.result.fulfillment);
var serviceCalloutFlag = false;

if (action.indexOf("smalltalk.greeting") > -1) {
  context.setVariable("request.content", fulfillment);
}
if (action === "patient") {
  // get patient info
  path += "Patient/" + body.result.parameters['phone-number'];
  serviceCalloutFlag = true;
  verb = "GET";
}
if (action === "clinic") {
  //get clinic info
  fulfillment = '{"speech":"For Getting clinics near you","data":{"google":{"expectUserResponse":false,"isSsml":false,"noInputPrompts":[],"systemIntent":{"intent":"actions.intent.PERMISSION","data":{"@type":"type.googleapis.com/google.actions.v2.PermissionValueSpec","optContext":"To Get clinics near you","permissions":["NAME","DEVICE_PRECISE_LOCATION"]}}}}}';
  serviceCalloutFlag = true;
  context.setVariable("request.content", fulfillment);
}

if (action === "clinic.confirm") {
  var organization = body.result.contexts.find(function (element) {
    return (element.name = 'patient' && element.parameters.organization);
  }).parameters.organization;

  path += "Location";
  serviceCalloutFlag = true;
  verb = "GET";

  var loc = {};
  loc.lat = body.originalRequest.data.device.location.coordinates.latitude;
  loc.lng = body.originalRequest.data.device.location.coordinates.longitude;
  context.setVariable("CurrentLocation", loc);
}

if (action === "appointment.get" || action === "appointment.book" || action
    === "appointment.del") {
  //get appointment info
  var patientId = body.result.contexts.find(function (element) {
    return (element.name = 'patient' && element.parameters.patientId);
  }).parameters.patientId;
  path += "Appointment/" + patientId;
  serviceCalloutFlag = true;
  verb = "GET";
}
if (action === "appointment.confirmation.cancel") {
  //get appointment info and delete
  var patientId = body.result.contexts.find(function (element) {
    return (element.name = 'patient' && element.parameters.patientId);
  }).parameters.patientId;
  path += "Appointment/" + patientId;
  serviceCalloutFlag = true;
  verb = "DELETE";
}
if (action === "appointment.book.confirm") {
  //book a new appointment - confirm
  var patient = body.result.contexts.find(function (element) {
    return (element.name = 'patient' && element.parameters.patientId);
  }).parameters;
  var clinic = body.result.contexts.find(function (element) {
    return (element.name = 'clinic' && element.parameters.clinicId);
  }).parameters;
  path += "Appointment/" + patient.patientId;
  serviceCalloutFlag = true;
  verb = "PUT";
  var date = new Date();
  date.setHours(date.getHours() + 2);
  date.setMinutes(0);
  var startTime = date.toISOString();
  date.setMinutes(30);
  var endTime = date.toISOString();
  reqBody = '{"' + patient.patientId
      + '":{"resourceType": "Appointment","identifier": [{"system": "http://example.org/sampleappointment-identifier","value": "123"}],"status": "proposed","serviceCategory": {"coding": [{"system": "http://example.org/service-category","code": "gp","display": "General Practice"}]},"specialty": [{"coding": [{"system": "http://example.org/specialty","code": "gp","display": "General Practice"}]}],"appointmentType": {"coding": [{"system": "http://example.org/appointment-type","code": "wi","display": "Walk in"}]},"priority": 5,"description": "Discussion on patients request","minutesDuration": 30,"participant": [{"actor": {"reference": "Patient/'
      + patient.patientId + '","display": "' + patient.patientName
      + '"},"required": "required","status": "needs-action"},{"actor": {"reference": "Practitioner/83780","display": "Dr Prashant S"},"required": "required","status": "accepted"},{"actor": {"reference": "Location/'
      + clinic.clinicId + '","display": "' + clinic.clinicName
      + '"},"required": "required","status": "accepted"}],"start": "'
      + startTime + '","end": "' + endTime + '"}}';
}
if (action === "wait.time") {
  //get wait time
  context.setVariable("request.content", fulfillment);
}
path += ".json";
context.setVariable("action", action);
context.setVariable("fulfillment", fulfillment);
context.setVariable("path", path);
context.setVariable("verb", verb);
context.setVariable("request.content", reqBody);
context.setVariable("serviceCalloutFlag", serviceCalloutFlag);

