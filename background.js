//Main background script for JiffyGIF
function main(details){ //where the magic happens
	if(details.url.lastIndexOf('.gif') != -1){
		var xhr = new XMLHttpRequest();
		xhr.open('GET', encodeURIComponent('http://gfycat.com/cajax/checkUrl/' + encodeURI(details.url)), false);
		xhr.send();
		
	}
}
chrome.runtime.onInstalled.addListener(function(details){ //DOUBLE EVENT LISTENERS ALL THE WAY ACROSS THE SKY
	chrome.webNavigation.onBeforeNavigate.addListener(function(details){ //WHAT DOES IT MEAN
		main(details); //It means that this script will only really trigger each time a tab navigates to a new URL.
	});
});