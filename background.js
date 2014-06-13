//Main background script for JiffyGIF
function main(details){ //where the magic happens
	if(details.url.lastIndexOf('.gif') != -1){
		console.log("It's a GIF!");
		var xhr = new XMLHttpRequest();
		xhr.open('GET', 'http://gfycat.com/cajax/checkUrl/' + encodeURIComponent(encodeURI(details.url)), false);
		xhr.send();
		console.log(xhr.response);
		//handle checking here
		if(xhr.response.urlKnown == true){
			//go to the gfycat page
		}else{
			//upload it to gfycat
		}
	}
}
chrome.runtime.onInstalled.addListener(function(details){ //DOUBLE EVENT LISTENERS ALL THE WAY ACROSS THE SKY
	chrome.webNavigation.onBeforeNavigate.addListener(function(details){ //WHAT DOES IT MEAN
		main(details); //It means that this script will only really trigger each time a tab navigates to a new URL.
	});
});