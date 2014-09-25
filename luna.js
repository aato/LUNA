/**
 * CPS730 - Assignment 1
 * Written by: 		 Alex Alksne
 * E-Mail: 			 alex.alksne@ryerson.ca
 * Student ID: 		 500 357 261
 * Submitted on:     Sept. 25th, 2014
 */

// Include some basic node.js libraries.
var http = require('http');
var fs = require('fs');

// Read in myhttpd.conf and set configuration variables.
var CONF = require('./myhttpd.conf');
var DEBUG = false;
var PORT = 62261;
var SERVER_ROOT = CONF.server_root;
var SUPPORTED_FILE_TYPES = CONF.supported_file_types;

// Response codes supported by LUNA
var RESPONSES = 
{
	"201" : "201.html",
	"400" : "400.html",
	"404" : "404.html",
	"500" : "500.html",
	"501" : "501.html",
	"505" : "505.html"
};

// Send a 200 to the client.
function send200(res, data, mimeType)
{
	// Unless otherwise specified, the defauly MIME type is 'text/html'.
	mimeType = mimeType || "text/html";

	res.writeHead(200, {'Content-Type': mimeType, 'Content-Length' : data.length});
	res.write(data)
	res.end();
}
// Send a 201 to the client.
function send201(res)
{
	fs.readFile("./" + RESPONSES["201"], "ascii", function(err, data)
	{
		if(err)
		{
			send500(res);
			return;
		}

		res.writeHead(201, {'Content-Type': 'text/html', 'Content-Length' : data.length});
		res.write(data)
		res.end();
	});
}

// Send a 400 to the client.
function send400(res)
{
	fs.readFile("./" + RESPONSES["400"], "ascii", function(err, data)
	{
		if(err)
		{
			send500(res);
			return;
		}

		res.writeHead(400, {'Content-Type': 'text/html', 'Content-Length' : data.length});
		res.write(data)
		res.end();
	});
}

// Send a 404 to the client.
function send404(res)
{
	fs.readFile("./" + RESPONSES["404"], "ascii", function(err, data)
	{
		if(err)
		{
			send500(res);
			return;
		}

		res.writeHead(404, {'Content-Type': 'text/html', 'Content-Length' : data.length});
		res.write(data)
		res.end();
	});
}

// Send a 500 to the client.
function send500(res)
{
	fs.readFile("./" + RESPONSES["500"], "ascii", function(err, data)
	{
		res.writeHead(500, {'Content-Type': 'text/html', 'Content-Length' : data.length});
		res.write(data)
		res.end();
	});
}

// Send a 501 to the client.
function send501(res)
{
	fs.readFile("./" + RESPONSES["501"], "ascii", function(err, data)
	{
		res.writeHead(501, {'Content-Type': 'text/html', 'Content-Length' : data.length});
		res.write(data)
		res.end();
	});
}

// Send a 505 to the client.
function send505(res)
{
	fs.readFile("./" + RESPONSES["505"], "ascii", function(err, data)
	{
		if(err)
		{
			send500(res);
			return;
		}

		res.writeHead(505, {'Content-Type': 'text/html', 'Content-Length' : data.length});
		res.write(data)
		res.end();
	});
}

// Check if a file exists in the filesystem.
function fileExists(filepath)
{
	return fs.existsSync(filepath);
}

// Send a file to the client.
function sendFile(res, filepath)
{
	fs.readFile(filepath, "ascii", function(err, data)
	{
		if(err)
		{
			send500(res);
			return;
		}

		var fileExtension = filepath.split(".");
		fileExtension = fileExtension[fileExtension.length - 1];
		fileExtension = fileExtension.toLowerCase();

		// Are we sending a .txt to the client?
		if(fileExtension === "txt")
		{
			send200(res, data, 'text/plain');
		}
		else
		{
			send200(res, data, 'text/html');
		}

	});
}

// From http://stackoverflow.com/questions/6958780/quitting-node-js-gracefully
process.on('SIGINT', function() {
  console.log( "\n[==============  LUNA HTTP Server ended  ==============]" );
  // some other closing procedures go here
  process.exit();
})

// Process any arguments passed into LUNA.
function processArgs()
{
	for(var i = 0; i < process.argv.length; i++)
	{
		// Did the user supply a port?
		if(process.argv[i] === "-p")
		{
			if(!isNaN(process.argv[i + 1]))
			{
				if(process.argv[i + 1] < 0 || process.argv[i + 1] > 65535)
				{
					console.log("Invalud argument: -p must be between 0 and 65535.");
					process.exit();
				}
				else
				{
					PORT = process.argv[i + 1];

					i++;
				}
			}
			else
			{
				console.log("Invalid argument: -p must be a number.");
				process.exit();
			}
		}
		// Did the user supply a debug-mode flag?
		else if(process.argv[i] === "-d")
		{
			DEBUG = true;
		}
		// Did the user ask for more information on LUNA?
		else if(process.argv[i] === "--help")
		{
			console.log("Usage: node luna.js [OPTION]");
			console.log("Run the LUNA HTTP Server while applying any passed in OPTIONs");
			console.log("Example: node luna.js -p 9001");
			console.log();
			console.log("  -p                        run on a specified port (must be betweenn 0 and 65535)");
			console.log("  -d                        run in debug mode (prints all INFO messages to console)");
			console.log("  --help                    display this help and exit");
			process.exit();
		}
	}

	if(DEBUG)
	{
		console.log("[============== LUNA HTTP Server started (DEBUG ON) ==============]");
		console.log();
		console.log("INFO: SERVER_ROOT: " + SERVER_ROOT);
		console.log("INFO: SUPPORTED_FILE_TYPES: " + SUPPORTED_FILE_TYPES);
	}
	else
	{
		console.log("[============== LUNA HTTP Server started ==============]");
	}
}

processArgs();

// Start the server.
http.createServer(function (req, res) {

	// Is the request using HTTP/2.0?
	if(req.httpVersion === "2.0")
	{
		// Send an error.
		send505(res);
	}

	// Is this a GET request?
	if(req.method === "GET")
	{
		if(DEBUG)
		{
			console.log("INFO: --> Client made GET request");
		}

		// Parse the requested URL for easier processing.
		var get = require("url").parse(req.url, true);

		// Make sure "/" redirects to "/index.*"
		var filepath = "./" + SERVER_ROOT;
		if(get.pathname === "/")
		{
			var validIndexFile = "";

			SUPPORTED_FILE_TYPES.forEach(function(val, index, array)
			{
				if (fileExists(filepath + "/index." + val)) {
					validIndexFile = "/index." + val;
				}
			});

			filepath += validIndexFile;
		}
		else
		{
			filepath += get.pathname;
		}

		// Does the file that the client requested exist?
		if(fileExists(filepath))
		{
			if(DEBUG)
			{
				console.log("INFO: <-- Serving file " + filepath);
			}

			sendFile(res, filepath);
		}
		else
		{
			if(DEBUG)
			{
				console.log("INFO: <-- The file at " + filePath + " was not found");
			}
			send404(res);
		}
	}
	// Is this a POST request?
	else if(req.method === "POST")
	{
		if(DEBUG)
		{
			console.log("INFO: --> Client made POST request");
		}

		// Parse the requested URL for easier processing.
		var post = require("url").parse(req.url, true);
		var filename = post.pathname;

		var fileExtension = filename.split(".");
		fileExtension = fileExtension[fileExtension.length - 1];

		var filePath = "./" + SERVER_ROOT + filename;

		// Does the server support the given file extension?
		if(SUPPORTED_FILE_TYPES.indexOf(fileExtension) > -1)
		{
			// Extract the data (file contents) sent in by the client.
			var body = "";
			// If we're processing the data portion of the POST request.
			req.on('data', function (chunk) {
				body += chunk;
			});
			// If we're done processing the POST request.
			req.on('end', function () {
				// Create the file.
				fs.writeFile(filePath, body, function(err) {
				    if(err) {
				    	console.log("ERROR: <-- Server error");
				        send500(res);
				    } else {
				    	// Make sure to give the file appropriate permissions in case we're running on linux.
						fs.chmodSync(filePath, 0755);

						if(DEBUG)
						{
							console.log("INFO: <-- The file " + filePath + " was successfully created");
						}

				    	send201(res);
				    }
				})
			});			
		}
		else
		{
			if(DEBUG)
			{
				console.log("INFO: <-- The server does not support creating files of type ." + fileExtension);
			}

			send400(res);
		}
	}
	// Is this a HEAD request?
	else if(req.method === "HEAD")
	{
		if(DEBUG)
		{
			console.log("INFO: --> Client made HEAD request");
		}

		// Parse the requested URL for easier processing.
		var head = require("url").parse(req.url);

		// Make sure "/" redirects to "/index.*"
		var filepath = "./" + SERVER_ROOT + head.pathname;
		console.log(filepath);

		// Does the file that the client requested exist?
		if(fileExists(filepath))
		{
			if(DEBUG)
			{
				console.log("INFO: <-- The file " + filepath + " was found");
			}

			send200(res, "");
		}
		else
		{
			if(DEBUG)
			{
				console.log("INFO: <-- The file " + filepath + " was not found");
			}

			send404(res);
		}
	}
	// If the request is not recognized.
	else
	{
		if(DEBUG)
		{
			console.log("INFO: --> Client made " + req.method + " request");
		}

		console.log("ERROR: " + req.method + " is not implemented (must be 'GET', 'POST', or 'HEAD')");

		if(DEBUG)
		{
			console.log("INFO: <-- Sending 501 (Not Implemented) response");
		}

		send501(res);
	}
// Start listening for requests.
}).listen(PORT, "127.0.0.1");

if(DEBUG)
{
	console.log('INFO: Server started at 127.0.0.1:' + PORT);
}