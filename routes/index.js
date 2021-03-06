var express = require('express');
var router = express.Router();
var decode = require('salesforce-signed-request');
var request = require('request');
var consumerSecret = process.env.CONSUMER_SECRET;
var qrcode = require('qrcode-npm');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.send("working");
});

router.post('/signedrequest', function(req, res) {

    // You could save this information in the user session if needed
    console.log("here");
    var signedRequest = decode(req.body.signed_request, consumerSecret);
      var context = signedRequest.context;
      var  oauthToken = signedRequest.client.oauthToken;
        instanceUrl = signedRequest.client.instanceUrl;

      var  query = "SELECT Id, FirstName, LastName, Phone, Email FROM Contact WHERE Id = '" + context.environment.record.Id + "'";
      var  contactRequest = {
            url: instanceUrl + '/services/data/v29.0/query?q=' + query,
            headers: {
                'Authorization': 'OAuth ' + oauthToken
            }
        };

    request(contactRequest, function(err, response, body) {
        var qr = qrcode.qrcode(4, 'L'),
            contact = JSON.parse(body).records[0],
            text = 'MECARD:N:' + contact.LastName + ',' + contact.FirstName + ';TEL:' + contact.Phone + ';EMAIL:' + contact.Email + ';;';
        qr.addData(text);
        qr.make();
        var imgTag = qr.createImgTag(4);
        console.log("final");
       // res.render('index', {context: context, imgTag: imgTag});
      res.send(body);

});



});

module.exports = router;
