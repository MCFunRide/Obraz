// The Meme Bible 2.0
// Funey 2019

const express = require('express')
const path = require("path");
const fs = require('fs');
const app = express()
var http = require('http').Server(app);

const debug = true
const repollpwd = "password64" // Change this password, anyone with this password can "repoll" images, albeit it doesn't work.

function debLog(textMsg) {
    if (debug == true) {
        console.log("[DEBUG] " + textMsg)
    }
}

// This should be replaced with _dirname in final release.
var path = __dirname + "\\cdn\\memes";
var absPath = __dirname;

fs.readdir(path, function(err, items) {
    const memes = items
    const memeCount = memes.length - 2
    const memeNum = memes.length - 2
    const properCount = memes.length
    debLog("Memes collected, total meme amount is " + memeCount)


    var fs = require('fs');

    const memeData = JSON.parse(fs.readFileSync('memes.json', 'utf8'));


    function isEmpty(obj) {
        return !Object.keys(obj).length;
    }

    function checkMemeLength(res) {
        if (memes.length == 0) {
            res.status(500)
            res.send("<h1><strong>500 Internal Server Error</strong></h1><p>You have no memes in the 'cdn/memes' directory.</p>")
            return
        } else if (isEmpty(memeData)) {
            res.status(500)
            res.send("<h1><strong>500 Internal Server Error</strong></h1><p>You have no meme data in your 'memes.json' file.</p>")
            return
        }
    }


    const port = 80
    app.use('/cdn', express.static(__dirname + '/public'));
    // This main page is deprecated and should not be used.
    var mainPage = "<h1>This should not have been called, please fix your code.</h1>"

    var allPage = `
<html>
    <head>
        <title>The Meme Bible</title>
    </head>
    <body style="text-align: center;font-family: Arial, Helvetica;">
        <h1>The Meme Bible</h1>
        <h1 id="title">All Memes</h1>
		<div id="allMemes">
			
		</div>
    </body>
	<script src="/socket.io/socket.io.js"></script>
    <script src="/cdn/js/altApp.js"></script>
</html>
`


    function generateRandomNumber(min, max) {
        let random_number = Math.random() * (max - min) + min;
        return Math.floor(random_number);
    }

    if (memes.length == 0) {
        app.get("/", (req, res) => checkMemeLength(res));
        app.get("/allMemes", (req, res) => checkMemeLength(res));
    } else if (isEmpty(memeData)) {
        app.get("/", (req, res) => checkMemeLength(res));
        app.get("/allMemes", (req, res) => checkMemeLength(res));
    } else {
        app.get('/', (req, res) => res.sendFile(absPath + "mainPage.html"));
        app.get('/allMemes', (req, res) => res.send(allPage));
    }

    app.get("/repoll/meme/list", function(req, res) {
        if (req.query.now == repollpwd) {
            fs.readdir(path, function(err, items) {
                const memes = items
                const memeCount = memes.length - 2
                const memeNum = memes.length - 2
                const properCount = memes.length
                debLog("Memes collected, total meme amount is " + memeCount)
                const memeData = JSON.parse(fs.readFileSync('memes.json', 'utf8'));
            });
            res.send("Completed repolling of memes.")
        } else {
            res.send("Nice try, bold guy.<br>The Meme Bible development team are not retarded.")
        }
    });


    var fs = require('fs');
    server = app.listen(port, () => debLog(`TMB2 launched successfully on port ${port}.`))

    var io = require('socket.io')(server);
    io.on('connection', function(socket) {
        debLog('New client connection.');
        socket.sessionID = generateRandomNumber(1, 9999)
        socket.memeNum = 1;
        socket.on('newConnection', (data) => {
            socket.sessionID = data.id
            debLog("Client has been given session ID " + socket.sessionID)
            socket.memeNum = 0;
        })
        socket.on('nextMeme', (data) => {
            debLog("Client " + socket.sessionID + " has requested the next meme.")

            if (socket.memeNum <= memeNum) {
                debLog("Sending client " + socket.sessionID + " their next meme.")
                socket.memeNum = socket.memeNum + 1
                debLog("Client " + socket.sessionID + " is now on meme number " + socket.memeNum + ".")
                io.sockets.emit('completedNM', { meme: memes[socket.memeNum], author: memeData.memeAuthor[socket.memeNum], id: socket.sessionID, memeNumber: socket.memeNum })
            } else {
                // Do nothing.
                debLog("Client " + socket.sessionID + " is at the end of the meme range, do nothing.")
            }

        })
        socket.on('prevMeme', (data) => {
            debLog("Client " + socket.sessionID + " has requested the previous meme.")
            if (socket.memeNum >= 1) {
                debLog("Sending client " + socket.sessionID + " their next meme.")
                socket.memeNum = socket.memeNum - 1
                debLog("Client " + socket.sessionID + " is now on meme number " + socket.memeNum + ".")
                io.sockets.emit('completedPM', { meme: memes[socket.memeNum], author: memeData.memeAuthor[socket.memeNum], id: socket.sessionID, memeNumber: socket.memeNum })
            } else {
                // Do nothing.
                debLog("Client " + socket.sessionID + " is at the end of the meme range, do nothing.")
            }
        })
        socket.on('getMeme', (data) => {
            debLog("Client " + socket.sessionID + " has requested meme number " + data.memeNum + ".")
            if ((data.memeNum >= 0) && (data.memeNum <= properCount)) {
                debLog("Sending client " + socket.sessionID + " meme number " + data.memeNum + ".")
                socket.memeNum = data.memeNum
                debLog("Client " + socket.sessionID + " is now on meme number " + socket.memeNum + ".")
                io.sockets.emit('completedInit', { meme: memes[socket.memeNum], author: memeData.memeAuthor[socket.memeNum], id: socket.sessionID, memeNumber: socket.memeNum })
            } else {
                // Do nothing.
                debLog("Client " + socket.sessionID + " requested invalid meme number " + data.memeNum + ". Do nothing.")
            }
        })
        socket.on('getMemeNumber', (data) => {
            debLog("Client " + socket.sessionID + " has requested meme count.")
            io.sockets.emit('memeNumber', { mCount: memeNum, id: socket.sessionID, memeNumber: socket.memeNum })
        });
        socket.on('allMemes', (data) => {
            debLog("Client " + socket.sessionID + " has requested all memes.")
            var i;
            for (i = 0; i < memes.length; i++) {
                io.sockets.emit('amRender', { meme: memes[i], id: socket.sessionID })
            }
            debLog("Client " + socket.sessionID + " has received all memes.")
            io.sockets.emit('amComplete', { id: socket.sessionID })
        });
    })

    app.use('*/cdn', express.static(__dirname + '/cdn'));
});