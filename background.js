/* Main background script for JiffyGIF*|
|* Copyright (C) 2014 Ezra Brooks     */
function main(details){ //where the magic happens
	if(details.url.lastIndexOf('.gif') != -1){
		console.log("It's a GIF!");
		var gifTabId = details.tabId;
		var xhr = new XMLHttpRequest();
		xhr.open('GET', 'http://gfycat.com/cajax/checkUrl/' + encodeURIComponent(encodeURI(details.url)), false);
		xhr.send();
		var gfyData = JSON.parse(xhr.response);
		if(xhr.status >= 300){
			console.log("Contacting gfycat failed. HTTP error " + xhr.status + ".");
		}else{
			console.log(gfyData);
			if(gfyData.urlKnown == true){ //go to the gfycat page
				chrome.tabs.update(gifTabId, {url:gfyData.gfyUrl});
			}else{ //upload it to gfycat
				var epochTime = Math.round(Date.now() / 1000).toString();
				var key = epochTime.slice(4, epochTime.length);
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
		}
	}
	listenForNavigate();
}
function listenForNavigate(){
	chrome.webNavigation.onBeforeNavigate.addListener(function(details){
		main(details); //call the main function when any tab navigates to a new URL.
	})
}
chrome.runtime.onInstalled.addListener(function(details){ //On installation/upgrade, call the function to bind a listener to navigation.
	listenForNavigate();
});