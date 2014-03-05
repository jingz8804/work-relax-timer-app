var clockSettings;
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
        if(data){
            console.log(data);
            if(data.setting && data.setting.workHours !== undefined){
                $("#workHour").val(data.setting.workHours);
            }else{
                $("#workHour").val(0);
            }

            if(data.setting && data.setting.workMinutes !== undefined){
                $("#workMinute").val(data.setting.workMinutes);
            }else{
                $("#workMinute").val(25);
            }

            if(data.setting && data.setting.workSeconds !== undefined){
                $("#workSecond").val(data.setting.workSeconds);
            }else{
                $("#workSecond").val(0);
            }

            if(data.setting && data.setting.workAlarmURI !== undefined){
                $("#workAlarmURI").val(data.setting.workAlarmURI);
            }

            // for the relax clock
            if(data.setting && data.setting.relaxHours !== undefined){
                $("#relaxHour").val(data.setting.relaxHours);
            }else{
                $("#relaxHour").val(0);
            }

            if(data.setting && data.setting.relaxMinutes !== undefined){
                $("#relaxMinute").val(data.setting.relaxMinutes);
            }else{
                $("#relaxMinute").val(5);
            }

            if(data.setting && data.setting.relaxSeconds !== undefined){
                $("#relaxSecond").val(data.setting.relaxSeconds);
            }else{
                $("#relaxSecond").val(0);
            }

            if(data.setting && data.setting.relaxAlarmURI !== undefined){
                $("#relaxAlarmURI").val(data.setting.relaxAlarmURI);
            }
        }
    });

    var previouslyClicked = "";
    var isSwitched = false;

    var clickedClassPrefix;
    var unClickedClassPrefix;
    
    $("button").click(function(){
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

            clockSettings = {};
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

    })
    

	$(".audio_holder").click(function(){
		var player = $("#audio_player")[0];
        $(this).hide();
		player.pause();
		player.currentTime = 0;
	});

    $('#myModal').on('hidden.bs.modal', function (e) {
      // stop the alarm
      $(".alarm_holder").empty();
      // note.cancel();
    })
});