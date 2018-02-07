var action = context.getVariable('action');
var fhirResponse = JSON.parse(context.getVariable('fhirResponse.content'));

var fulfillment = JSON.parse(context.getVariable('fulfillment'));

if(action === "patient"){
    var patient = fhirResponse.entry[0];
    var patientName = patient.resource.name[0].given[0];
    var patientId = patient.resource.id;
    var org = patient.resource.managingOrganization.reference;
    org = org.split('/')[1];
    var speech = "Hello "+patientName+", what can I do for you today?";
    fulfillment.speech = speech;
    fulfillment.messages[0].speech = speech;
    fulfillment.contextOut = [{"name":"patient","parameters":{"patientId":patientId,"patientName":patientName, "organization":org},"lifespan":5}];
    context.setVariable("request.content",JSON.stringify(fulfillment));
}
if( action === "appointment.get" ){
    if(fhirResponse && fhirResponse.entry && fhirResponse.entry[0].resource.participant){
        //present
        var appointment = fhirResponse.entry[0];
        var practitioner = appointment.resource.participant.find(function(element){
                  return (element.actor.reference.indexOf('Practitioner')>-1);
             }).actor.display;
        var loc = appointment.resource.participant.find(function(element){
                  return (element.actor.reference.indexOf('Location')>-1);
             }).actor.display;
        var startTime = new Date(appointment.resource.start);
        startTime = startTime.toLocaleDateString();
        var speech = "Your upcoming appointment is with "+ practitioner +" at "+loc+" on "+ startTime;
        fulfillment.speech = speech;
        fulfillment.messages[0].speech = speech;
        fulfillment.contextOut = [{"name":"appointment","parameters":{"appointmentId":appointment.resource.id},"lifespan":5}];
        context.setVariable("request.content",JSON.stringify(fulfillment));
    }
    else{
        //no appointments
        var speech = "You have no appointments booked";
        fulfillment.speech = speech;
        fulfillment.messages[0].speech = speech;
        context.setVariable("request.content",JSON.stringify(fulfillment));
    }
    
    
}
if( action === "appointment.book" ){
    //already present
    if(fhirResponse && fhirResponse.entry && fhirResponse.entry[0].resource.participant){
        //present
        var appointment = fhirResponse.entry[0];
        var practitioner = appointment.resource.participant.find(function(element){
                  return (element.actor.reference.indexOf('Practitioner')>-1);
             }).actor.display;
        var loc = appointment.resource.participant.find(function(element){
                  return (element.actor.reference.indexOf('Location')>-1);
             }).actor.display;
        var startTime = new Date(appointment.resource.start);
        startTime = startTime.toLocaleDateString();
        var speech = "Your already have an appointment with "+ practitioner +" at "+loc+" on "+startTime;
        fulfillment.speech = speech;
        fulfillment.messages[0].speech = speech;
        fulfillment.contextOut = [{"name":"appointment","parameters":{"appointmentId":appointment.resource.id},"lifespan":5}];
        context.setVariable("request.content",JSON.stringify(fulfillment));
    }
    else{
        //next available
        var speech = "Earliest appointment with your doctor is availabe after 2 hours, shall I book it for you?";
        fulfillment.speech = speech;
        fulfillment.messages[0].speech = speech;
        context.setVariable("request.content",JSON.stringify(fulfillment));
    }
    
}
if( action === "appointment.del" ){
    //present
    //already present
    if(fhirResponse && fhirResponse.entry && fhirResponse.entry[0].resource.participant){
        //present confirm del
        var appointment = fhirResponse.entry[0];
        var practitioner = appointment.resource.participant.find(function(element){
                  return (element.actor.reference.indexOf('Practitioner')>-1);
             }).actor.display;
        var loc = appointment.resource.participant.find(function(element){
                  return (element.actor.reference.indexOf('Location')>-1);
             }).actor.display;
        var startTime = new Date(appointment.resource.start);
        startTime = startTime.toLocaleDateString();
        var speech = "Are you sure that you want to delete your appointment with "+ practitioner +" at "+loc+" on "+startTime;
        fulfillment.speech = speech;
        fulfillment.messages[0].speech = speech;
        fulfillment.contextOut = [{"name":"appointment","parameters":{"appointmentId":appointment.resource.id},"lifespan":5}];
        context.setVariable("request.content",JSON.stringify(fulfillment));
    }
    else{
        //next available
        var speech = "You have no appointments booked";
        fulfillment.speech = speech;
        fulfillment.messages[0].speech = speech;
        context.setVariable("request.content",JSON.stringify(fulfillment));
    }
}
if(action === "appointment.book.confirm"){
    context.setVariable("request.content",JSON.stringify(fulfillment));
}

if(action === "appointment.confirmation.cancel"){
    context.setVariable("request.content",JSON.stringify(fulfillment));
}

if(action === "clinic.confirm"){
    var Locations = fhirResponse;
    var LocationArr = [];
    for(var i = 0 ; i< Locations.entry.length; i++)
    {
        if(Locations.entry[i].resource.position)
        {
            if(Locations.entry[i].resource.position.longitude && Locations.entry[i].resource.position.latitude )
            {
                if(Locations.entry[i].resource.name)
                {
                    var entity = {};
                    entity.lat = Locations.entry[i].resource.position.latitude;
                    entity.lng = Locations.entry[i].resource.position.longitude;
                    entity.name = Locations.entry[i].resource.name;
                    entity.addr = Locations.entry[i].resource.address.line + "," + Locations.entry[i].resource.address.city + ","+ Locations.entry[i].resource.address.country;
                    entity.id = Locations.entry[i].resource.id;
                   LocationArr.push(entity) ;
                }
            }
        }
    }
    
    var myLoc = context.getVariable("CurrentLocation");
    
    
        var lat = myLoc.lat;
        var lng = myLoc.lng;
        var R = 6371; // radius of earth in km
        var distances = [];
        var closest = -1;
        for( i=0;i<LocationArr.length; i++ ) {
            var mlat = LocationArr[i].lat;
            var mlng = LocationArr[i].lng;
            var dLat  = rad(mlat - lat);
            var dLong = rad(mlng - lng);
            
    
             var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(rad(lat)) * Math.cos(rad(lat)) * Math.sin(dLong/2) * Math.sin(dLong/2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            var d = R * c;
            distances[i] = d;
            if ( closest == -1 || d < distances[closest] ) {
                closest = i;
            }
        }
    var speech = "The nearest clinic to you is " + LocationArr[closest].name +"," + LocationArr[closest].addr;
    fulfillment.speech = speech;
    fulfillment.messages[0].speech = speech;
    fulfillment.contextOut = [{"name":"clinic","parameters":{"clinicId":LocationArr[closest].id, "clinicName":LocationArr[closest].name, "clinicAddr":LocationArr[closest].addr},"lifespan":5}];
    context.setVariable("request.content",JSON.stringify(fulfillment));

    
}
function rad(x) {return x*Math.PI/180;}