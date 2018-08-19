var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var date = require('date-and-time');
var moment = require('moment');
var ISO6391 = require('iso-639-1');
var LanguageTranslatorV3 = require('watson-developer-cloud/language-translator/v3');
var plotly = require('plotly')(process.env.PLOTLY_USERNAME, process.env.PLOTLY_APIKEY);
var uuidv4 = require('uuid/v4');
var fs = require('fs')

app.listen(process.env.PORT || 3000, function () {
    console.log('Corriendo en puerto ' + process.env.PORT);
});

var request = require('request'), url = 'https://api.nasa.gov/planetary/apod?api_key=' + process.env.NASA_KEY;


function responseText(texto) {
	return ('{"messages":[{"text":"' + texto + '"}]}');
}

function responseImage(url) {
	return ('{"messages":[{"attachment":{"type":"image","payload":{"url":"' + url + '"}}}]}');
}

function responseVideo(url) {
	return ('{"messages":[{"attachment":{"type":"video","payload":{"url":"' + url + '"}}}]}');
}

function responseAudio(url) {
	return ('{"messages":[{"attachment":{"type":"audio","payload":{"url":"' + url + '"}}}]}');
}

function responseCancion(url) {
	//var a1 = '{"attachment":{"type":"template",  "payload":{"template_type":"open_graph","elements":[{"url":"';
    //var a3 = '","buttons":[{"type":"web_url","url":"https://en.wikipedia.org/wiki/Rickrolling","title":"View More"}]}]}}}'
    return ('{"messages":[{"attachment":{"type":"template","payload":{"template_type":"open_graph","elements":[{"url":"'+ url + '","buttons":[{"type":"web_url","url":"https://en.wikipedia.org/wiki/Rickrolling","title":"View More"}]}]}}}]}');
}

request(url, (error, response, body)=> {
  if (!error && response.statusCode === 200) {
    const fbResponse = JSON.parse(body)
	responseImage(fbResponse.url)
  } else {
    console.log("Got an error: ", error, ", status code: ", response.statusCode)
  }
})

app.get('/', function(req, res) {
	//res.sendStatus(204)
	res.sendFile(__dirname + '/index.html');

})

app.get('/web', function(req, res) {
	//res.sendStatus(204)
	res.sendFile(__dirname + '/index.html');

})

app.get('/ghablame', function(req, res) {
	res.sendFile(__dirname + '/ghablame.html')
})

app.get('/apod', function(req, res) {
    request(url, (error, response, body)=> {
		if (!error && response.statusCode === 200) {
			const fbResponse = JSON.parse(body)
			res.json(JSON.parse(responseImage(fbResponse.url)))
		  }
		  else {
			console.log("Got an error: ", error, ", status code: ", response.statusCode)
			}
})
});

app.get('/apod/explicacion', function(req, res) {
	request(url, (error, response, body)=> {
		if (!error && response.statusCode === 200) {
			const fbResponse = JSON.parse(body)
			res.json(JSON.parse(responseText(fbResponse.explanation)))
		  }
		  else {
			console.log("Got an error: ", error, ", status code: ", response.statusCode)
			}
})
})

app.get('/apod/ayer', function(req, res) {
	ayer = new Date();
	ayer.setDate(ayer.getDate() - 1)
	nuevafecha = ayer.getFullYear() + "-" + (ayer.getMonth()+1) + "-" + ayer.getDate();
	var nrequest = require('request'), url = 'https://api.nasa.gov/planetary/apod?api_key=' + process.env.NASA_KEY + '&date=' + nuevafecha;
	nrequest(url, (error, response, body)=> {
		if (!error && response.statusCode === 200) {
			const fbResponse = JSON.parse(body)
			res.json(JSON.parse(responseImage(fbResponse.url)))
		  }
		  else {
			console.log("Got an error: ", error, ", status code: ", response.statusCode)
			}
})
})

// HORA
var hs2 = function(req, res) {
	var now = new Date();
    res.json(date.format(now, 'hh:mm A'));
}

app.get('/hora', function(req, res) {
	console.log("Hora: ", moment().format('LT'));
	//var timezone = req.query.tz || '0';
	var timezone =  '4';
	console.log("Timezone: ", timezone)
    var h1 = '{"messages":[{"text":"Hora actual en ciudad Juárez: '
	var fix = 7+(timezone);
	var now = moment().add(fix, 'hours').format('LT');
	console.log("now: ", now)
	var h3 = '"}]}'
	var hstr = h1+now+h3
	res.json(JSON.parse(hstr));
});

// Clima
app.get('/clima', function(req,res) {
	var c4 = ("https://api.darksky.net/forecast/" + process.env.DARKSKY_API + "/" + req.query.lat + "," + req.query.lon + "?lang=es")
	console.log("lat: ", req.query.lat)
	console.log("lon: ", req.query.lon)
	request(c4, (error, response, body)=> {
		if (!error && response.statusCode === 200) {
			const fbResponse = JSON.parse(body)
			console.log(c4)
			res.json(JSON.parse(responseText("El clima actual en " + req.query.ciudad + " es " + fbResponse['currently'].summary)))
		  }
		  else {
			res.json(JSON.parse(responseText("No tengo acceso a tu ubicacion")))
			console.log("Got an error: ", error, ", status code: ", response.statusCode)
			}
})
});

app.get('/ubicacionA', function(req,res) {
	if(req.query.loc === "") {
		console.log(req.query.loc);
		res.json(JSON.parse(responseText("No tengo tu ubicacion, por favor utiliza el comando A")));
	}
	else {
		console.log(req.query.loc);
		res.json(JSON.parse(responseText("Hay te va pariente")));
	}
})

app.get('/webhook', function(req,res) {

	res.redirect('http:localhost:9002//' + req.query.parametro);

})

//Temperatura
app.get('/temperatura', function(req,res) {
	if(req.query.lat !== undefined || req.query.lat !== undefined) {
		var c4 = ("https://api.darksky.net/forecast/" + process.env.DARKSKY_API + "/" + req.query.lat + "," + req.query.lon + "?lang=es&units=si")
		request(c4, (error, response, body)=> {
			if (!error && response.statusCode === 200) {
				const fbResponse = JSON.parse(body)
				res.json(JSON.parse(responseText("La temperatura actual en " + req.query.ciudad + " es " + fbResponse['currently'].temperature + "°C")))
			  }
			  else {
				res.json(JSON.parse(responseText("No tengo acceso a tu ubicacion :(")))
				console.log("Got an error: ", error, ", status code: ", response.statusCode)
			}
		}
		)}
	else {
		var c4 = ("https://api.darksky.net/forecast/" + process.env.DARKSKY_API + "/31.606016,-106.39845?lang=es&units=si")
		request(c4, (error, response, body)=> {
			if (!error && response.statusCode === 200) {
				const fbResponse = JSON.parse(body)
				res.json(JSON.parse(responseText("La temperatura actual en ciudad Juárez es " + fbResponse['currently'].temperature + "°C")))
			  }
			  else {
				res.json(JSON.parse(responseText("No tengo acceso a tu ubicacion")))
				console.log("Got an error: ", error, ", status code: ", response.statusCode)
				}
			})
	}

});

// GIF
app.get('/gif', function(req, res) {
    request("http://api.giphy.com/v1/gifs/random?api_key=" + process.env.GIPHY_KEY + "&rating=pg-13&tag=funny", (error, response, body)=> {
		if (!error && response.statusCode === 200) {
			const fbResponse = JSON.parse(body)
			res.json(JSON.parse(responseImage(fbResponse['data']['images']['downsized_medium'].url)))
		  }
		  else {
			console.log("Got an error: ", error, ", status code: ", response.statusCode)
			}
})
});

app.use(express.static(__dirname + '/public'));


// Triste gif
app.get('/gifsad', function(req, res) {
    request("http://api.giphy.com/v1/gifs/random?api_key=" + process.env.GIPHY_KEY + "&rating=pg-13&tag=sad", (error, response, body)=> {
		if (!error && response.statusCode === 200) {
			const fbResponse = JSON.parse(body)
			res.json(JSON.parse(responseImage(fbResponse['data']['images']['downsized_medium'].url)))
		  }
		  else {
			console.log("Got an error: ", error, ", status code: ", response.statusCode)
			}
})
});

//Verificar ubicacion
app.get('/verificargps', function(req, res) {
	console.log("lat: " + req.query.lat + "		lon: " + req.query.lon)
	if(req.query.lat !== undefined && req.query.lon !== undefined) {
		res.json(JSON.parse('{"estado":"true"}'))
	}
	else {
		res.json(JSON.parse('{"estado":"false"}'))
	}
})

//Pronostico
app.get('/pronostico', function(req,res) {
	if(req.query.lat !== undefined || req.query.lat !== undefined) {
		var c4 = ("https://api.darksky.net/forecast/" + process.env.DARKSKY_API + "/" + req.query.lat + "," + req.query.lon + "?lang=es&units=si")
		request(c4, (error, response, body)=> {
			if (!error && response.statusCode === 200) {
				const fbResponse = JSON.parse(body)
				res.json(JSON.parse(responseText(fbResponse['hourly'].summary)))
			  }
			  else {
				res.json(JSON.parse(responseText("No tengo acceso a tu ubicacion :(")))
				console.log("Got an error: ", error, ", status code: ", response.statusCode)
			}
		}
		)}
	else {
		var c4 = ("https://api.darksky.net/forecast/" + process.env.DARKSKY_API + "/31.606016,-106.39845?lang=es&units=si")
		request(c4, (error, response, body)=> {
			if (!error && response.statusCode === 200) {
				const fbResponse = JSON.parse(body)
				res.json(JSON.parse(responseText('No tengo acceso a tu ubicacion. El pronostico en ciudad Juárez es ' + fbResponse['hourly'].summary)))
			  }
			  else {
				res.json(JSON.parse(responseText("No tengo acceso a tu ubicacion")))
				console.log("Got an error: ", error, ", status code: ", response.statusCode)
				}
			})
	}

});

app.get('/descargargif', function(req, res) {
	request(("http://api.giphy.com/v1/gifs/search?q=" + req.query.gif + "&api_key=" + process.env.GIPHY_KEY), (error, response, body)=> {
		if (!error && response.statusCode === 200) {
			const fbResponse = JSON.parse(body)
			var random = Math.floor(Math.random()* Object.keys(fbResponse['data']).length);
			res.json(JSON.parse(responseImage(fbResponse['data'][random]['images']['downsized_medium'].url)))
		  }
		  else {
			console.log("Got an error: ", error, ", status code: ", response.statusCode, "   msg:", response.msg)
			}
})
});

app.get('/wiki', function(req, res) {
	request(("https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&titles=" + req.query.query + "&format=json"), (error, response, body)=> {
		if (!error && response.statusCode === 200) {
			const fbResponse = JSON.parse(body)
			//var img = new Image()
			//img.src = fbResponse['data']['images']['downsized_medium'].url
			//document.write("alv");
			//res.writeHead(200, {'Content-Type': 'image/gif' })
			//res.end(img, 'binary')
			res.json(JSON.parse(responseText(fbResponse['query']['pages']['downsized_medium'].url)))
		  }
		  else {
			console.log("Got an error: ", error, ", status code: ", response.statusCode, "   msg:", response.msg)
			}
})
});

app.get('/hablame', function(req,res) {
	//https://text-to-speech-demo.ng.bluemix.net/api/synthesize?text=Buenas+tardes&voice=es-ES_EnriqueVoice&download=true&accept=audio%2Fmp3
	//https://text-to-speech-demo.ng.bluemix.net/api/synthesize?text=Hola+que+tal+buenas+tardes+este+texto+tiene+muchos+espacios+alaverga+pariente+cero+miedo+puro+culiacan+sinaloa+a+la+verga+pariente&voice=es-ES_LauraVoice&download=true&accept=audio%2Fmp3
	var random = Math.floor(Math.random()*2);
    switch(random){
    case 0:
        res.json(JSON.parse(responseAudio("https://text-to-speech-demo.ng.bluemix.net/api/synthesize?text="+ req.query.texto.replace(/\s/g, "+") + "&voice=es-ES_EnriqueVoice&download=true&accept=audio%2Fmp3")))
        break;
    case 1:
        res.json(JSON.parse(responseAudio("https://text-to-speech-demo.ng.bluemix.net/api/synthesize?text="+ req.query.texto.replace(/\s/g, "+") + "&voice=es-ES_LauraVoice&download=true&accept=audio%2Fmp3")))
    }

});


app.get('/trados', function(req, res) {
  var languageTranslator = new LanguageTranslatorV3({
  version: '2018-05-01',
  iam_apikey: process.env.IAM_KEY
  });

  var parameters = {
    text: req.query.texto,
    model_id: req.query.to
  };

  languageTranslator.translate(
    parameters,
    function(error, response) {
      if (error)
        console.log(error)
      else
        //res.json(response);
        console.log(response['translations'][0].translation);
        res.json(JSON.parse(responseText(response['translations']['0'].translation)))
    }
  );
})

function getRolon() {
  /*var random = Math.floor(Math.random()*2);
  console.log(random)
  switch(random){
    case 0:
      return "https://open.spotify.com/track/6KzeSLDKK4DuFUHy3l9vqv?si=B5A9-fdORtesqtCMR4sX8g";
    case 1:
      return "https://open.spotify.com/track/7vDqM9MFCCAdeSSWQQdzT5?si=uhVri_rJQ8ao0vxLaz-pPQ";
  }*/
  return "https://open.spotify.com/track/6KzeSLDKK4DuFUHy3l9vqv?si=B5A9-fdORtesqtCMR4sX8g";
}


app.get('/cancion', function(req, res) {
	var a1 = '{"attachment":{"type":"template",  "payload":{"template_type":"open_graph","elements":[{"url":"';
    var a3 = '","buttons":[{"type":"web_url","url":"https://en.wikipedia.org/wiki/Rickrolling","title":"View More"}]}]}}}'
    //response = ;
    //getRolon()
    console.log(responseCancion("https://open.spotify.com/track/6KzeSLDKK4DuFUHy3l9vqv?si=B5A9-fdORtesqtCMR4sX8g"));
    res.json(JSON.parse(responseCancion("https://open.spotify.com/track/6KzeSLDKK4DuFUHy3l9vqv?si=B5A9-fdORtesqtCMR4sX8g")));
});

app.get('/dcancion', function(req, res) {
	res.json({
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"open_graph",
        "elements":[
           {
            "url":"https://open.spotify.com/track/7GhIk7Il098yCjg4BQjzvb",
            "buttons":[
              {
                "type":"web_url",
                "url":"https://en.wikipedia.org/wiki/Rickrolling",
                "title":"View More"
              }              
            ]      
          }
        ]
      }
    }
})
})


app.get('/menuinicio', function(req, res) {

})

app.get('/graficar', function(req, res) {
	var nombrearchivoUUID = uuidv4();

	/*var rangoX = {-10, 10};
	var rangoY = {-10, 10}
	if(req.query.rangox == null && req.query.rangoy == null) {
		res.json(JSON.parse('{"estado":"No esta"}'))
	}
	else {
		res.json(JSON.parse(responseText("Todo bien pariente")))
	}*/


	var trace1 = {
	  x: [1, 2, 3, 4],
	  y: [10, 15, 13, 17],
	  type: "scatter"
	};

	var figure = { 'data': [trace1] };

	var imgOpts = {
	    format: 'png',
	    width: 1000,
	    height: 500
	};

	plotly.getImage(figure, imgOpts, function (error, imageStream) {
	    if (error) return console.log (error);

	    var fileStream = fs.createWriteStream(nombrearchivoUUID + '.png');
	    imageStream.pipe(fileStream);
	});
	res.json(JSON.parse(responseImage("https:/vec5bot.herokuapp.com/graficaspng?archivo=" + nombrearchivoUUID + ".png")))
})


app.get('/graficaspng', function(req, res) {
	var file = __dirname + req.query.archivo + ".png";

	/*if (file.indexOf(dir + path.sep) !== 0) {
	    return res.status(403).end('Forbidden');
	}*/

	var type = 'image/png';
	var s = fs.createReadStream(file);

	s.on('open', function () {
	    res.set('Content-Type', type);
	    s.pipe(res);
	});

	s.on('error', function () {
	    res.set('Content-Type', 'text/plain');
	    res.status(404).end('Not found');   
	});
})


app.get('/wachar', function (req, res) {

	var mime = {
    html: 'text/html',
    txt: 'text/plain',
    css: 'text/css',
    gif: 'image/gif',
    jpg: 'image/jpeg',
    png: 'image/png',
    svg: 'image/svg+xml',
    js: 'application/javascript'
};
    //var file = dir, req.path.replace(/\/$/, '/index.html');
    if (file.indexOf(dir + path.sep) !== 0) {
        return res.status(403).end('Forbidden');
    }
    var type = mime[path.extname(file).slice(1)] || 'text/plain';
    var s = fs.createReadStream(file);
    s.on('open', function () {
        res.set('Content-Type', type);
        s.pipe(res);
    });
    s.on('error', function () {
        res.set('Content-Type', 'text/plain');
        res.status(404).end('Not found');
    });
});