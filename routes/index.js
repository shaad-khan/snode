var express = require('express');
var router = express.Router();
var decode = require('salesforce-signed-request');
  var qrcode = require('qrcode-npm');
var  consumerSecret = process.env.CONSUMER_SECRET,

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send("working");
});

router.post('/signedrequest', function(req, res) {

    // You could save this information in the user session if needed
    var signedRequest = decode(req.body.signed_request, consumerSecret),
        context = signedRequest.context,
        oauthToken = signedRequest.client.oauthToken,
        instanceUrl = signedRequest.client.instanceUrl,

        query = "SELECT Id, FirstName, LastName, Phone, Email FROM Contact WHERE Id = '" + context.environment.record.Id + "'",

        contactRequest = {
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
        res.render('index', {context: context, imgTag: imgTag});
    });

});

module.exports = router;
