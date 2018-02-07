var clientId = "{{clientId}}";
var clientSecret = "{{clientSecret}}";
context.setVariable("clientIdSecret", Base64.encode(clientId + ":" + clientSecret));