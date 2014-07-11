/* Main background script for JiffyGIF*|
|* Copyright (C) 2014 Ezra Brooks     */
function jiffyMain(details){ //where the magic happens
	var gfyChecker = new XMLHttpRequest();
	gfyChecker.open('GET', 'http://gfycat.com/cajax/checkUrl/' + encodeURIComponent(encodeURI(details.url)), false);
	gfyChecker.send();
	if(gfyChecker.status >= 300){
		console.log('Contacting gfycat failed. HTTP error ' + gfyChecker.status + '.');
	}else{
		var gifReplacerScript = "(function(d, t) {var g = d.createElement(t),s = d.getElementsByTagName(t)[0];g.src = 'https://assets.gfycat.com/js/gfyajax-0.517d.js';s.parentNode.insertBefore(g, s);}(document, 'script'));/*jiffyGIF code*/var gifToReplace = 'GIFURLPLACEHOLDER';var gfyName = 'GFYNAMEPLACEHOLDER';function getFilename(url){return url.substring(url.lastIndexOf('/') + 1, url.length);}console.log(getFilename(gifToReplace));var images = document.getElementsByTagName('img');for (var i = 0; i < images.length; i++) {if(images[i].getAttribute('src') != null && getFilename(images[i].getAttribute('src')) == getFilename(gifToReplace)){images[i].className = 'gfyitem';images[i].setAttribute('data-id', gfyName);images[i].removeAttribute('src');}};";
		var gfyData = JSON.parse(gfyChecker.response);
		if(gfyData.urlKnown == true){
			if(details.type == 'main_frame'){
				return {redirectUrl: gfyData.gfyUrl}; //redirect to the gfycat page
			}else if(details.type == 'image'){
				console.log(gifReplacerScript.replace('GIFURLPLACEHOLDER', details.url).replace('GFYNAMEPLACEHOLDER', gfyData.gfyName));
				chrome.tabs.executeScript(details.tabId, {code: gifReplacerScript.replace('GIFURLPLACEHOLDER', details.url).replace('GFYNAMEPLACEHOLDER', gfyData.gfyName)});
				return null;
			}
		}else{ //have gfy convert it for us
			//generate a unique session ID for gfy transcode request
			var epochTime = Math.round(Date.now() / 1000).toString();
			var key = epochTime.slice(epochTime.length - 6, epochTime.length);
			for(var i = 0; i >= 10 - key.length; i++){
				var randNum = Math.round(Math.random() * 16);
					key += randNum.toString(16);
			}
			//send the request using the session ID
			var transcodeRequest = new XMLHttpRequest();
			transcodeRequest.open('GET', 'http://upload.gfycat.com/transcode/' + key + '?fetchUrl=' + encodeURIComponent(encodeURI(details.url)), false);
			transcodeRequest.send();
			var gfyResponse = JSON.parse(transcodeRequest.response);
			if(details.type == 'main_frame'){
				return {redirectUrl:'http://www.gfycat.com/' + gfyResponse.gfyname}; //redirect the user to the newly-generated gfycat video
			}else if(details.type == 'image'){
				return null;
			}
		}
	}
}
function listenForRequest(){
	if(!chrome.webRequest.onBeforeRequest.hasListener(jiffyMain)){
		chrome.webRequest.onBeforeRequest.addListener(jiffyMain, {urls:['https://*/*.gif','http://*/*.gif']}, ['blocking']);
	}
}
chrome.runtime.onStartup.addListener(listenForRequest);	//When Chrome opens and initializes itself, call the above function.
chrome.runtime.onInstalled.addListener(listenForRequest); //When the extension is installed or updated, call the above function.