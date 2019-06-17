// The Meme Bible 2.0
// app.js

// CONNECT TO WEBSOCKET SERVER //

console.log("[APP] Connecting to websocket...")

const urlParams = new URLSearchParams(window.location.search);
const mnParam = urlParams.get('memeNum')

var url = "http://localhost"

console.log("[APP] memeNum paramater is " + mnParam)

function generateRandomNumber(min , max) {
   let random_number = Math.random() * (max-min) + min;
   return Math.floor(random_number);
}

var mNum = 0
var memeCount = 0

if (mnParam == null) {
	mNum = 0
	console.log("[APP] Meme number is one.")
} else {
	var mNum = parseInt(mnParam) 
	if ((isNaN(mNum)) || (mNum == null)) {
		mNum = 1
		console.log("[APP] Meme number is one.")
	} else {
		console.log("[APP] Meme number is " + mNum)
	}
}

var clientID = generateRandomNumber(1, 9999)

console.log("[APP] Client ID is " + clientID)

var socket = io();

socket.emit("newConnection", {id: clientID})

// CREATE FUNCTIONS FOR BUTTONS ON PAGE //

function nextMeme() {
	mNum = window.mNum
	socket.emit("nextMeme")
	console.log("[APP] Next meme function.")
	socket.on("completedNM", (data) => {
		console.log("[APP] Got completion for next meme.")
		mNum = window.mNum
		if (data.id == clientID) {
			mNum = window.mNum
			console.log("[APP] Client ID is correct, add meme to page. Meme number "+mNum)
			mNum = data.memeNumber
			console.log("[APP] Changed meme number, now "+mNum)
			document.getElementById("image").src = '/cdn/memes/' + data.meme
			hmn = mNum 
			document.getElementById("shareLink").innerHTML = '<a href="' + url + '/?memeNum=' + hmn + '">'+url+'/?memeNum='+hmn+'</span>'
			document.getElementById("title").innerHTML = 'Meme Number ' + mNum + ' - Sent by ' + data.author
		}
	})
}

function prevMeme() {
	mNum = window.mNum
	socket.emit("prevMeme")
	console.log("[APP] Previous meme function.")
	socket.on("completedPM", (data) => {
		console.log("[APP] Got completion for next meme.")
		mNum = window.mNum
		if (data.id == clientID) {
			mNum = window.mNum
			console.log("[APP] Client ID is correct, add meme to page. Meme number "+mNum)
			mNum = data.memeNumber
			console.log("[APP] Changed meme number, now "+mNum)
			document.getElementById("image").src = '/cdn/memes/' + data.meme
			hmn = mNum 
			document.getElementById("shareLink").innerHTML = '<a href="' + url + '/?memeNum=' + hmn + '">'+url+'/?memeNum='+hmn+'</span>'
			document.getElementById("title").innerHTML = 'Meme Number ' + mNum + ' - Sent by ' + data.author
		}
	})
}
	
function getMeme(mNumber) {
	if ((mNumber > memeCount) || (mNumber < 0)) {
		socket.emit("getMeme", {memeNum: 0})
		console.log("[APP] Meme number does not fit criteria. Meme number "+mNumber)
	} else {
		socket.emit("getMeme", {memeNum: mNumber})
		console.log("[APP] Meme number fits criteria. "+mNumber)
	}
	 
	socket.on("completedInit", (data) => {
		console.log("[APP] Got completion for initial meme.")
		 
		if (data.id == clientID) {
			 
			console.log("[APP] Client ID is correct, add meme to page. Meme number "+mNum)
			document.getElementById("image").src = '/cdn/memes/' + data.meme
			mNum = data.memeNumber
			console.log("[APP] Changed meme number, now "+mNum)
			hmn = mNum
			document.getElementById("shareLink").innerHTML = '<a href="' + url + '/?memeNum=' + hmn + '">'+url+'/?memeNum='+hmn+'</span>'
			document.getElementById("title").innerHTML = 'Meme Number ' + mNum + ' - Sent by ' + data.author
		}
	})
}

function pollMemeNumber() {
	socket.emit("getMemeNumber")
	 
	socket.on("memeNumber", (data) => {
		 
		console.log("[APP] Got completion for initial meme.")
		if (data.id == clientID) {
			console.log("[APP] Client ID is correct, add meme count")
			var memeCount = data.number
		}
	})
}

function loadMeme() {
		var userMeme = document.getElementById("userMeme").value
		console.log("[APP] User has requested meme number " + userMeme)
		var newURL = url + "/?memeNum=" + userMeme
		window.location.href = newURL
}

function init() {
	socket.emit("getMemeNumber")
	 
	socket.on("memeNumber", (data) => {
		console.log("[APP] Got completion for initial meme.")
		 
		if (data.id == clientID) {
			console.log("[APP] Client ID is correct, add meme count")
			memeCount = data.mCount + 1
			console.log("[APP] Meme count is " + memeCount)
			getMeme(mNum)
			document.getElementById("image").style.visibility = "visible";
		}
	})
}

init()