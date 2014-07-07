/* Main background script for JiffyGIF*|
|* Copyright (C) 2014 Ezra Brooks     */
function main(details){ //where the magic happens
	if(details.url.lastIndexOf('.gif') + '.gif'.length == details.url.length){
		//console.log('It's a GIF!');
		var gfyChecker = new XMLHttpRequest();
		gfyChecker.open('GET', 'http://gfycat.com/cajax/checkUrl/' + encodeURIComponent(encodeURI(details.url)), false);
		gfyChecker.send();
		var gfyData = JSON.parse(gfyChecker.response);
		if(gfyChecker.status >= 300){
			console.log('Contacting gfycat failed. HTTP error ' + gfyChecker.status + '.');
		}else{
			chrome.tabs.update(details.tabId, {})
			//TODO: find some way to pause navigation before even partially loading original .gif
			if(gfyData.urlKnown == true){ //go to the gfycat page
				chrome.tabs.update(details.tabId, {url:gfyData.gfyUrl});
			}else{ //have gfy convert it for us
				var epochTime = Math.round(Date.now() / 1000).toString();
				var key = epochTime.slice(epochTime.length - 6, epochTime.length);
				for(var i = 0; i >= 10 - key.length; i++){
					var randNum = Math.round(Math.random() * 16);
					key += randNum.toString(16);
				}
				var transcodeRequest = new XMLHttpRequest();
				transcodeRequest.open('GET', 'http://upload.gfycat.com/transcode/' + key + '?fetchUrl=' + encodeURIComponent(encodeURI(details.url)), false);
				transcodeRequest.send();
				var gfyResponse = JSON.parse(transcodeRequest.response);
				chrome.tabs.update(details.tabId, {url:'http://www.gfycat.com/' + gfyResponse.gfyname});
			}
			chrome.history.deleteUrl({url:details.url}); //make sure the GIF page doesn't stay in history if gfycat is a bit slow to load
		}
	}
	listenForNavigate();
}
function listenForNavigate(){
	if(!chrome.webNavigation.onBeforeNavigate.hasListener(main)){
		chrome.webNavigation.onBeforeNavigate.addListener(main);
	}
}
chrome.runtime.onStartup.addListener(listenForNavigate);	//When Chrome opens and initializes itself, call the above function.
chrome.runtime.onInstalled.addListener(listenForNavigate); //When the extension is installed or updated, call the above function.