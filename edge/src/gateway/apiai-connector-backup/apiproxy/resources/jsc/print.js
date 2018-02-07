var target = context.getVariable('target.url');
var path = context.getVariable('path');
target += path;
context.setVariable('target.url',target);
context.setVariable('request.verb',context.getVariable('verb'));
