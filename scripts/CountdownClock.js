var digit_to_name = 'zero one two three four five six seven eight nine'.split(' ');

// This object will hold the digit elements
var digits = {};

// Positions for the hours, minutes, and seconds
var positions = [
    'h1', 'h2', ':', 'm1', 'm2', ':', 's1', 's2'
];

// Generate the digits with the needed markup,
// and add them to the clock

// var digit_holder = clock.find('.digits');

var digit_holder = $('<div>');
digit_holder.addClass("digits");

$.each(positions, function(){

    if(this == ':'){
        digit_holder.append('<div class="dots">');
    }
    else{

        var pos = $('<div>');

        for(var i=1; i<8; i++){
            pos.append('<span class="d' + i + '">');
        }

        // Set the digits as key:value pairs in the digits object
        digits[this] = pos;

        // Add the digit elements to the page
        digit_holder.append(pos);
    }

});


function clockUpdate(clock, timeLeft){	
	var hours, minutes, seconds;
	hours = parseInt(timeLeft / 3600);
	timeLeft = timeLeft % 3600;
	minutes = parseInt(timeLeft / 60);
	seconds = parseInt(timeLeft % 60);
//	clock.html(hours + " h, " + minutes + " m, " + seconds + " s");
	if(hours!=0){
		document.title = hours+'h'+minutes + "m"+ seconds+"s";
	}else{
		document.title = minutes + "m"+ seconds+"s";
	}
	
	var h1, h2, m1, m2, s1, s2;
	h1 = parseInt(hours / 10);
	h2 = hours % 10;
	m1 = parseInt(minutes / 10);
	m2 = minutes % 10;
	s1 = parseInt(seconds / 10);
	s2 = seconds % 10;

	digits.h1.attr('class', digit_to_name[h1]);
	digits.h2.attr('class', digit_to_name[h2]);
	digits.m1.attr('class', digit_to_name[m1]);
	digits.m2.attr('class', digit_to_name[m2]);
	digits.s1.attr('class', digit_to_name[s1]);
	digits.s2.attr('class', digit_to_name[s2]);

	clock.find('.display').append(digit_holder);
}
var note;
function notify(){
	var havePermission = window.webkitNotifications.checkPermission();
	if(havePermission == 0){
		// 0 means permission allowed
		note = window.webkitNotifications.createNotification(
			'http://i.stack.imgur.com/dmHl0.png',
			"Time's up!",
			"Click here to stop the alarm!");

		note.onclick = function(){
			// stop the alarm, close the modal, and close itself
			$(".alarm_holder").empty();
			$('#myModal').modal('hide');
			note.cancel();
		};
		note.show();
	}else{
		window.webkitNotifications.requestPermission();
	}
	// var opt = {
 //        type: "basic",
 //        title: "Primary Title",
 //        message: "Primary message to display",
 //        iconUrl: "../dmHl0.png"
 //      }; 
	// chrome.notifications.create("note1", opt, function(){});
	// console.log("test");

}

function elementsUpdate(elements, clickedClassPrefix){
	// hide the pause button
	$("#" + clickedClassPrefix + "Pause").hide();
	
	// var toEnable = elements.buttonToEnable;
	// var toDisable = elements.buttonToDisable;

	// $("button." + toEnable).removeAttr("disabled");
	// $("button." + toDisable).attr("disabled", "disabled");

	var videoURI = $("#" + clickedClassPrefix + "AlarmURI").val();
	var matches = videoURI.match(/youtube.com\/watch\?v=([a-zA-Z0-9\-_]+)/);
	if(matches){
		var videoID = matches[1];
		// if (typeof(Storage)!=="undefined"){ // we only save the one that got played
		// 	localStorage.setItem(clickedClassPrefix + "AlarmURI", videoURI);
		// }
		clockSettings[clickedClassPrefix + "AlarmURI"] = videoURI;
		chrome.storage.sync.set({'setting': clockSettings});
		// elements.playerHolder.append('<div><webview width="250" height="125" src="http://www.youtube.com/embed/'+ videoID +'?controls=0&showinfo=0&rel=0&autoplay=1"></webview></div>')
		// elements.playerHolder.append('<div><iframe src="../sandboxed.html" width="300" height="200"></iframe></div>')
	}else{
		elements.playerHolder.append('<audio autoplay controls><source src="audio/audio.mp3" type="audio/mpeg">Your browser does not support the audio element.</audio>')
		document.getElementById('theFrame').contentWindow.postMessage("message", '*');
	}

	// enable the time input
    // $("#"+clickedClassPrefix+"Hour").removeAttr("disabled");
    // $("#"+clickedClassPrefix+"Minute").removeAttr("disabled");
    // $("#"+clickedClassPrefix+"Second").removeAttr("disabled");

    // here we add the desktop notification
	notify();
        
	$('#myModal').modal('show');

	
}

function CountdownClock(hours, minutes, seconds){
	var totalTime = hours * 3600 + minutes * 60 + seconds;
	var timeLeft = totalTime;
	var clockHandler;

	this.getTotalTime = function(){
		return totalTime;
	}

	this.getTimeLeft = function(){
		return timeLeft;
	}

	this.start = function(elementsUpdate, elements, clockUpdate, clockDiv, clickedClassPrefix){
		clockHandler = setInterval(function(){ // here we do not need to pass any parameters, something about closure right?

			if(timeLeft == 0){
				clearInterval(clockHandler);
				elementsUpdate(elements, clickedClassPrefix);
			}

			timeLeft--;
			if(timeLeft >= 0){
				clockUpdate(clockDiv, timeLeft);
			}
		}, 1000);
	}

	this.reset = function(){
		if(clockHandler !== undefined){
			clearInterval(clockHandler);
		}
		timeLeft = totalTime;
	}

	this.pause = function(){
		if(clockHandler !== undefined){
			clearInterval(clockHandler);
		}
	}

	this.setTotalTime = function(hours, minutes, seconds){
		totalTime = hours * 3600 + minutes * 60 + seconds;
		timeLeft = totalTime;
	}

	this.setTime = function(hours, minutes, seconds){
		timeLeft = hours * 3600 + minutes * 60 + seconds;
	}
}