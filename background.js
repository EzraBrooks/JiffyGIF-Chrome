/* Main background script for JiffyGIF*|
|* Copyright (C) 2014 Ezra Brooks     */
function jiffyMain(details){ //where the magic happens
	if(details.type == 'main_frame' && details.url.lastIndexOf('.gif') + '.gif'.length == details.url.length){
		//console.log('It's a GIF!');
		var gfyChecker = new XMLHttpRequest();
		gfyChecker.open('GET', 'http://gfycat.com/cajax/checkUrl/' + encodeURIComponent(encodeURI(details.url)), false);
		gfyChecker.send();
		var gfyData = JSON.parse(gfyChecker.response);
		if(gfyChecker.status >= 300){
			console.log('Contacting gfycat failed. HTTP error ' + gfyChecker.status + '.');
		}else{
			if(gfyData.urlKnown == true){ //redirect to the gfycat page
				return {redirectUrl: gfyData.gfyUrl};
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
				return {redirectUrl:'http://www.gfycat.com/' + gfyResponse.gfyname}; //redirect the user to the newly-generated gfycat video
			}
		}
	}else{
		return null;
	}
}
function listenForRequest(){
	if(!chrome.webRequest.onBeforeRequest.hasListener(jiffyMain)){
		chrome.webRequest.onBeforeRequest.addListener(jiffyMain, {urls:['https://*/*','http://*/*']}, ['blocking']);
	}
}
chrome.runtime.onStartup.addListener(listenForRequest);	//When Chrome opens and initializes itself, call the above function.
chrome.runtime.onInstalled.addListener(listenForRequest); //When the extension is installed or updated, call the above function.