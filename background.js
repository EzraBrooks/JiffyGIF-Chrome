/* Main background script for JiffyGIF*|
|* Copyright (C) 2014 Ezra Brooks     */
function main(details){ //where the magic happens
	if(details.url.lastIndexOf('.gif') + ".gif".length = details.url.length){
		//console.log("It's a GIF!");
		var gifTabId = details.tabId;
		var gfyChecker = new XMLHttpRequest();
		gfyChecker.open('GET', 'http://gfycat.com/cajax/checkUrl/' + encodeURIComponent(encodeURI(details.url)), false);
		gfyChecker.send();
		var gfyData = JSON.parse(gfyChecker.response);
		if(gfyChecker.status >= 300){
			console.log("Contacting gfycat failed. HTTP error " + gfyChecker.status + ".");
		}else{
			//console.log(gfyData);
			if(gfyData.urlKnown == true){ //go to the gfycat page
				chrome.tabs.update(gifTabId, {url:gfyData.gfyUrl});
			}else{ //upload it to gfycat
				var epochTime = Math.round(Date.now() / 1000).toString();
				var key = epochTime.slice(epochTime.length - 6, epochTime.length);
				for(var i = 0; i >= 10 - key.length; i++){
					var randNum = Math.round(Math.random() * 16);
					key += randNum.toString(16);
				}
				var uploadxhr = new XMLHttpRequest();
				uploadxhr.open('GET', 'http://upload.gfycat.com/transcode/' + key + '?fetchUrl=' + encodeURIComponent(encodeURI(details.url)), false);
				uploadxhr.send();
				var gfyResponse = JSON.parse(uploadxhr.response);
				chrome.tabs.update(gifTabId, {url:"http://www.gfycat.com/" + gfyResponse.gfyname});
			}
			chrome.history.deleteUrl({url:details.url}); //make sure the GIF page doesn't stay in history if gfycat is a bit slow to load
		}
	}
	listenForNavigate();
}
function listenForNavigate(){
	if(!chrome.webNavigation.onBeforeNavigate.hasListeners()){
		chrome.webNavigation.onBeforeNavigate.addListener(function(details){main(details)});
	}
}
chrome.runtime.onStartup.addListener(function(){listenForNavigate()});	//When Chrome opens and initializes itself, call the above function.
chrome.runtime.onInstalled.addListener(function(){listenForNavigate()}); //When the extension is installed or updated, call the above function.