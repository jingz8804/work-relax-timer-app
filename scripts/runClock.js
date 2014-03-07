var clockSettings = {}; // we must initialize it here otherwise we are saving a new object everytime we click the button.
$( document ).ready(function() {
    var clock;

    $("input.time").keyup(function(){
    	var v = this.value;
   		var vReplaced = v.replace(/[^0-9]/g, '');
    	if ( v != vReplaced) {
	       this.value = vReplaced;
	    }
    });

    // retrieve user supplied time units
    chrome.storage.sync.get("setting", function(data){
        if(data && data.setting){
            console.log(data);
            clockSettings = data.setting;
            if(data.setting.workHours !== undefined){
                $("#workHour").val(data.setting.workHours);
            }else{
                $("#workHour").val(0);
            }

            if(data.setting.workMinutes !== undefined){
                $("#workMinute").val(data.setting.workMinutes);
            }else{
                $("#workMinute").val(25);
            }

            if(data.setting.workSeconds !== undefined){
                $("#workSecond").val(data.setting.workSeconds);
            }else{
                $("#workSecond").val(0);
            }

            // if(data.setting.workAlarmURI !== undefined){
            //     $("#workAlarmURI").val(data.setting.workAlarmURI);
            // }

            if(data.setting.workChosenFile !== undefined){
                chrome.fileSystem.isRestorable(data.setting.workChosenFile, function(bIsRestorable) {
                  // the entry is still there, load the content
                  console.info("Restoring " + data.setting.workChosenFile);
                  chrome.fileSystem.restoreEntry(data.setting.workChosenFile, function(chosenEntry) {
                    if (chosenEntry) {
                      loadFileEntry(chosenEntry, 'work');
                    }
                  });
                });
            }

            // for the relax clock
            if(data.setting.relaxHours !== undefined){
                $("#relaxHour").val(data.setting.relaxHours);
            }else{
                $("#relaxHour").val(0);
            }

            if(data.setting.relaxMinutes !== undefined){
                $("#relaxMinute").val(data.setting.relaxMinutes);
            }else{
                $("#relaxMinute").val(5);
            }

            if(data.setting.relaxSeconds !== undefined){
                $("#relaxSecond").val(data.setting.relaxSeconds);
            }else{
                $("#relaxSecond").val(0);
            }

            // if(data.setting.relaxAlarmURI !== undefined){
            //     $("#relaxAlarmURI").val(data.setting.relaxAlarmURI);
            // }

            if(data.setting.relaxChosenFile !== undefined){
                chrome.fileSystem.isRestorable(data.setting.relaxChosenFile, function(bIsRestorable) {
                  // the entry is still there, load the content
                  console.info("Restoring " + data.setting.relaxChosenFile);
                  chrome.fileSystem.restoreEntry(data.setting.relaxChosenFile, function(chosenEntry) {
                    if (chosenEntry) {
                      loadFileEntry(chosenEntry, 'relax');
                    }
                  });
                });
            }
        }
    });

    var previouslyClicked = "";
    var isSwitched = false;

    var clickedClassPrefix;
    var unClickedClassPrefix;
    
    $("button.count").click(function(){
        // check which side is clicked
        var isWork = $(this).hasClass("work");
        clickedClassPrefix = "work";
        unClickedClassPrefix = "relax";
        if(isWork !== true){
            clickedClassPrefix = "relax";
            unClickedClassPrefix = "work";
        }

        if ((previouslyClicked !== "") && (clickedClassPrefix !== previouslyClicked)){
            isSwitched = true;
        }

        previouslyClicked = clickedClassPrefix;

        // get the button text
        var buttonText = $(this).text();
        var hours;
        var minutes;
        var seconds;

        if(buttonText == "START COUNTDOWN"){
            // var havePermission = window.webkitNotifications.checkPermission();
            // if(havePermission == 1){
            //     window.webkitNotifications.requestPermission();
            // }
            // if we are clicking on the Start button
            hours = $("#"+clickedClassPrefix+"Hour").val();
            minutes = $("#"+clickedClassPrefix+"Minute").val();
            seconds = $("#"+clickedClassPrefix+"Second").val();

            // the input we got is text string! So be sure to convert it to integer first!
            if(hours === ""){
                hours = 0;
            }else{
                hours = parseInt(hours);
            }

            if(minutes === ""){
                minutes = 0;
            }else{
                minutes = parseInt(minutes);
            }

            if(seconds === ""){
                seconds = 0;
            }else{
                seconds = parseInt(seconds);
            }

            // if(typeof(Storage) !== "undefined"){
            //     localStorage.setItem(clickedClassPrefix + "Hours", hours);
            //     localStorage.setItem(clickedClassPrefix + "Minutes", minutes);
            //     localStorage.setItem(clickedClassPrefix + "Seconds", seconds);
            // }

            
            clockSettings[clickedClassPrefix + "Hours"] = hours;
            clockSettings[clickedClassPrefix + "Minutes"] = minutes;
            clockSettings[clickedClassPrefix + "Seconds"] = seconds;
            chrome.storage.sync.set({'setting': clockSettings});

            // be sure to always change the text of the pause button
            $("#" + clickedClassPrefix + "Pause").text("PAUSE");

            if (clock){
                clock.pause(); // must pause first to clear the time interval, otherwise it will keep going
                clock.setTotalTime(hours, minutes, seconds);
                if (isSwitched){
                    // do not forget to show the clock face
                    $("#" + clickedClassPrefix + "Div").fadeIn('slow');

                    $("#" + unClickedClassPrefix + "Div").hide("slow");

                    $("#" + clickedClassPrefix + "Pause").show('fast');
                    $("#" + unClickedClassPrefix + "Pause").hide('slow');
                }
            }else{
                clock = new CountdownClock(hours, minutes, seconds);
                // do not forget to show the clock face
                $("#" + clickedClassPrefix + "Div").fadeIn('slow');

                $("#" + unClickedClassPrefix + "Div").hide("slow");

                $("#" + clickedClassPrefix + "Pause").show('fast');
                $("#" + unClickedClassPrefix + "Pause").hide('slow');
            }

            if(clock.getTimeLeft() <= 0){
                clock.setTime(0, 0, 0);
            }

            // immediately show the time
            clockUpdate($("#"+clickedClassPrefix+"Div"), clock.getTimeLeft());

            var elements = {
                playerHolder: $("#"+clickedClassPrefix+"Audio_holder")
            };

            clock.start(elementsUpdate, elements, clockUpdate, $("#"+clickedClassPrefix+"Div"), clickedClassPrefix);
        }else if(buttonText == "RESUME"){
            $(this).text("PAUSE");
            if(clock.getTimeLeft() <= 0){
                clock.setTime(0, 0, 0);
            }
            // clockUpdate($("#"+clickedClassPrefix+"Div"), clock.getTimeLeft())
            var elements = {
                playerHolder: $("#"+clickedClassPrefix+"Audio_holder")
            };

            clock.start(elementsUpdate, elements, clockUpdate, $("#"+clickedClassPrefix+"Div"), clickedClassPrefix);
        }else if(buttonText == "PAUSE"){ // the modal has a button, here I have to specify this otherwise it will change the modal button too.
            // this is to pause the clock
            $(this).text("RESUME");
            clock.pause();
        }

    });

    $("button.alarm").click(function(){
        console.log("clicked");

        var isWork = $(this).hasClass("work");
        clickedClassPrefix = "work";
        unClickedClassPrefix = "relax";
        if(isWork !== true){
            clickedClassPrefix = "relax";
            unClickedClassPrefix = "work";
        }

        var output = $('#'+clickedClassPrefix+"FilePath");

        var accepts = [{
                mimeTypes: ['audio/*']
            }];
            chrome.fileSystem.chooseEntry({type: 'openFile', accepts: accepts}, function(theEntry) {
                if (!theEntry) {
                    output.textContent = 'No file selected.';
                    return;
                }
            // use local storage to retain access to this file
            clockSettings[clickedClassPrefix+'ChosenFile'] = chrome.fileSystem.retainEntry(theEntry);
            // chrome.storage.local.set({'ChosenFile': chrome.fileSystem.retainEntry(theEntry)});
            chrome.storage.sync.set({'setting': clockSettings});

            loadFileEntry(theEntry, clickedClassPrefix);
        });

    })
    

	$(".audio_holder").click(function(){
		var player = $("#audio_player")[0];
        $(this).hide();
		player.pause();
		player.currentTime = 0;
	});

    $('#myModal').on('hidden.bs.modal', function (e) {
      // stop the alarm
      // $(".alarm_holder").empty();
      // $('audio')[0].pause();
      // $('audio')[0].currentTime = 0;
      // $('audio')[1].pause();
      // $('audio')[1].currentTime = 0;  
      note.cancel();
    })
});

function loadFileEntry(_chosenEntry, clickedClassPrefix) {
  chosenEntry = _chosenEntry;
  chosenEntry.file(function(file) {
    // check this post for how to get the url of the video.
    // http://stackoverflow.com/questions/4935101/audio-src-change-with-javascript

    var audio_url = webkitURL.createObjectURL(file);
    console.log(audio_url);
    // readAsText(chosenEntry, function(result) {
    //   textarea.value = result;
    // });
    // Update display.
    // saveFileButton.disabled = false; // allow the user to save the content
    displayEntryData(chosenEntry, clickedClassPrefix);

    // check this post for how to set audio src 
    // http://stackoverflow.com/questions/4935101/audio-src-change-with-javascript
    // var player = $('#'+clickedClassPrefix+"Player");
    // var player = $('#'+clickedClassPrefix+"Player")[0];
    // var source = $('#'+clickedClassPrefix+"AlarmSource")[0];
    // source.src = audio_url;
    // player.load();
    var player = document.getElementById(clickedClassPrefix+"Player");
    player.src = audio_url;
    // player.load();
  });
}

function displayEntryData(theEntry, clickedClassPrefix) {
  if (theEntry.isFile) {
    chrome.fileSystem.getDisplayPath(theEntry, function(path) {
      $('#'+clickedClassPrefix+'FilePath').val(path);
    });   
  }
  else {
    $('#'+clickedClassPrefix+'FilePath').val(theEntry.fullPath);
  }
}