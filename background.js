//Main background script for JiffyGIF
function main(details){ //where the magic happens
	if(details.url.lastIndexOf('.gif') != -1){
		console.log("It's a GIF!");
		var gifTabId = details.tabId;
		var xhr = new XMLHttpRequest();
		xhr.open('GET', 'http://gfycat.com/cajax/checkUrl/' + encodeURIComponent(encodeURI(details.url)), false);
		xhr.send();
		var gfyData = JSON.parse(xhr.response)
		if(xhr.status >= 300){
			console.log("Contacting gfycat failed. HTTP error " + xhr.status + ".");
		}else{
			console.log(gfyData);
			if(gfyData.urlKnown == true){
				chrome.tabs.update(gifTabId, {url:gfyData.gfyUrl});
				//go to the gfycat page
			}else{
				//upload it to gfycat
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