'use strict';

const express = require('express');
const request = require('request');
const app = express();
const eport = 1234;
const bodyParser = require('body-parser');


const uriBaseSentiment = 'https://eastus.api.cognitive.microsoft.com/text/analytics/v2.0/sentiment';
const uriBaseKeyPhrases = 'https://eastus.api.cognitive.microsoft.com/text/analytics/v2.0/keyPhrases';

const azureKey = 'URAZUREKEY';

const yelpKey = 'URYELPKEY';
const yelpClientId = 'URCLIENTID';

const yelp = require('yelp-fusion');
const client = yelp.client(yelpKey);

app.use(bodyParser.json());
app.listen(eport, console.log('listening'));

app.get('/home', function(req, res) {
    res.send('working')
});

app.post('/search', function(req, res) {
    let searchQuery = req.body['search'];
    let loc = req.body['location'];
    console.log(req.body);
    client.search({
        term: searchQuery,
        location: loc}).then(response => {
            let searchResult = response.jsonBody.businesses[0].id;
            let name = response.jsonBody.businesses[0].name;
            console.log(searchResult);
            client.reviews(searchResult).then(response => {
                let reviews = {"documents": []};
                for (var i in response.jsonBody.reviews){
                    let tempObj = {"language": "en", "id": i, "text": response.jsonBody.reviews[i].text};
                    reviews["documents"].push(tempObj);
                }
                console.log(reviews);
                keyPhrases(reviews, res, name)

            }).catch(e => {console.log(e);});
    }).catch(e => {console.log(e);});
});

function keyPhrases(text, res, name) {
    let options = {
        method : 'POST',
        uri: uriBaseSentiment,
        body: JSON.stringify(text),
        headers : {
            'Ocp-Apim-Subscription-Key' : azureKey,
        }
    };

    request.post(options, function(err, response, body) {
        let sentimentValues = JSON.parse(body);
        console.log(sentimentValues);
        options = {
            method : 'POST',
            uri: uriBaseKeyPhrases,
            body: JSON.stringify(text),
            headers : {
                'Ocp-Apim-Subscription-Key' : azureKey,
            }
        };

        request.post(options, function(err, response2, body2) {
            let keyPhraseValues = JSON.parse(body2);

            format_data(name, keyPhraseValues, sentimentValues, res)
        });

    })
}

function format_data(name, keyPhraseValues, sentimentValues, res) {

    // let phrases = [];
    // for (var i in keyPhraseValues["documents"])
    let result = {};
    result["name"] = name;

    let sentAvg = 0;
    for (let i in sentimentValues["documents"]) {
        sentAvg += sentimentValues["documents"][i]["score"]
    }
    sentAvg /= sentimentValues["documents"].length;
    result["sentiment"] = sentAvg;

    result["emoji"] = "../assets/" + Math.round(sentAvg*10) + ".png";
    result["keyPhrases"] = [];

    for (let i in keyPhraseValues["documents"]){
        for (let j in keyPhraseValues["documents"][i]["keyPhrases"]) {
            result["keyPhrases"].push(keyPhraseValues["documents"][i]["keyPhrases"][j]);
            console.log(keyPhraseValues["documents"][i]["keyPhrases"][j])
        }
    }
    res.send(result);
}


//////////////////////////

// let doc = {
//     "documents": [
//         {
//             "language": "en",
//             "id": "1",
//             "text": "We love this trail and make the trip every year. The views are breathtaking and well worth the hike!"
//         },
//         {
//             "language": "en",
//             "id": "2",
//             "text": "Poorly marked trails! I thought we were goners. Worst hike ever."
//         },
//         {
//             "language": "en",
//             "id": "3",
//             "text": "Everyone in my family liked the trail but thought it was too challenging for the less athletic among us. Not necessarily recommended for small children."
//         },
//         {
//             "language": "en",
//             "id": "4",
//             "text": "It was foggy so we missed the spectacular views, but the trail was ok. Worth checking out if you are in the area."
//         },
//         {
//             "language": "en",
//             "id": "5",
//             "text": "This is my favorite trail. It has beautiful views and many places to stop and rest"
//         }
//     ]
// };
//
//
//
// let options = {
//     method : 'POST',
//     uri: uriBaseSentiment,
//     body: JSON.stringify(doc),
//     headers : {
//         'Ocp-Apim-Subscription-Key' : azureKey,
//     }
// };
//
// request.post(options, function(err, response, body) {
//     let asdf = JSON.stringify(body);
//     console.log(asdf);
//     if (err){
//         console.log(err)
//     }
// });
//
// options = {
//     method : 'POST',
//     uri: uriBaseKeyPhrases,
//     body: JSON.stringify(doc),
//     headers : {
//         'Ocp-Apim-Subscription-Key' : azureKey,
//     }
// };
//
// request.post(options, function(err, response, body) {
//     let asdf = JSON.stringify(body);
//     console.log(asdf);
//     if (err){
//         console.log(err)
//     }
// });
//
