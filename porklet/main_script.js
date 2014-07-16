/* Functions from other sources */

/* http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array */
function shuffleArray(array) {
  var currentIndex = array.length
    , temporaryValue
    , randomIndex
    ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

/* http://www.w3schools.com/dom/dom_loadxmldoc.asp */

function loadXMLString(txt) 
{
if (window.DOMParser)
  {
  parser=new DOMParser();
  xmlDoc=parser.parseFromString(txt,"text/xml");
  }
else // Internet Explorer
  {
  xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
  xmlDoc.async=false;
  xmlDoc.loadXML(txt); 
  }
return xmlDoc;
}

/* My code */

function setDialogueBox(speaker, content, shouldShowButton) {
    var boxheader = document.getElementById("dialogue-box-header");
    var boxcontent = document.getElementById("dialogue-box-content");
    boxheader.innerHTML = speaker;
    boxcontent.innerHTML = content;
    if (shouldShowButton) {
        boxcontent.innerHTML += NEXT_STATE_BUTTON;
        var tmptypingtext = new TypingText(boxcontent, TEXT_SPEED_CONSTANT, null, null);
    } else {
        var tmptypingtext = new TypingText(boxcontent, TEXT_SPEED_CONSTANT, null, main);
    }
    tmptypingtext.run();
}

function setChoiceBox(choices) {
    var boxcontent = document.getElementById("choice-box-content");
    var htmlcodeArray = new Array();
    for (var i = 0; i < choices.length; i++) {
        if (i == 0) {
            htmlcodeArray[0] = "<input type=\"radio\" name=\"choices-box-radio-buttons\" onclick=\"main();\">" + choices[0] + "</input>";
        } else {
            htmlcodeArray[i] = "<input type=\"radio\" name=\"choices-box-radio-buttons\" onclick=\"playWrongChoice(); g_state_type = 'wrong_choice'; main();\">" + choices[i] + "</input>";
        }
    }
    htmlcodeArray = shuffleArray(htmlcodeArray);
    var htmlcodeString = "";
    for (var i = 0; i < htmlcodeArray.length; i++) {
        htmlcodeString += htmlcodeArray[i] + "<br />";
    }
    boxcontent.innerHTML = htmlcodeString;
    var tmptypingtext = new TypingText(boxcontent, TEXT_SPEED_CONSTANT);
    tmptypingtext.run();
}

function displayDialogueBox(value) {
    if (value) {
        document.getElementById("dialogue-box").removeAttribute("hidden");
    } else {
        document.getElementById("dialogue-box").setAttribute("hidden", "hidden");
    }
}

function displayChoiceBox(value) {
    if (value) {
        document.getElementById("choice-box").removeAttribute("hidden");
    } else {
        document.getElementById("choice-box").setAttribute("hidden", "hidden");
    }
}

function getStringFromDOM(domobject) {
    try {
        return (new XMLSerializer()).serializeToString(domobject);
    } catch (e) {
        /* IE 8 and older */
        return domobject.xml;
    }
}

function playWrongChoice() {
    document.getElementById("wrong_choice").play();
}

var g_state_type = "init";
var NEXT_STATE_BUTTON = "<br /><button onclick=\"main();\">Continue</a>";
var TEXT_SPEED_CONSTANT = 30;
var g_xmldoc;
var g_xml_index = 0;

function main() {
    if (g_state_type == "wrong_choice") {
        displayDialogueBox(false);
        displayChoiceBox(false);
        document.getElementById("bgm-loop").pause();
        alert("Hamlet did not say that!\nGame Over!\n\nClick OK to restart the game.");
        window.location.reload(false);

    } else {
        if (g_state_type == "init") {
            g_xmldoc = loadXMLString(XML_STRING);
        }

        var t_currentstate = g_xmldoc.getElementsByTagName("state")[g_xml_index];
        g_state_type = t_currentstate.getAttribute("type");
        g_xml_index += 1;

        if (g_state_type == "hide_dialogue_box") {
            displayDialogueBox(false);
            main();

        } else if (g_state_type == "hide_choice_box") {
            displayChoiceBox(false);
            main();

        } else if (g_state_type == "dialogue_with_button") {
            displayDialogueBox(true);
            setDialogueBox(t_currentstate.getElementsByTagName("speaker")[0].childNodes[0].textContent, getStringFromDOM(t_currentstate.getElementsByTagName("dialogue")[0]), true);

        } else if (g_state_type == "dialogue_no_button") {
            displayDialogueBox(true);
            setDialogueBox(t_currentstate.getElementsByTagName("speaker")[0].childNodes[0].textContent, getStringFromDOM(t_currentstate.getElementsByTagName("dialogue")[0]), false);

        } else if (g_state_type == "choice_box") {
            displayChoiceBox(true);
            var choicesarray = new Array();
            var elementsarray = t_currentstate.getElementsByTagName("choice");
            for (var i = 0; i < elementsarray.length; i++) {
                choicesarray[i] = getStringFromDOM(elementsarray[i]);
            }
            setChoiceBox(choicesarray);

        } else if (g_state_type == "set_background") {
            document.getElementsByTagName('body')[0].style.backgroundImage = "url(" + t_currentstate.getElementsByTagName("value")[0].textContent + ")";
            main();

        } else if (g_state_type == "complete_game") {
            displayDialogueBox(false);
            displayChoiceBox(false);
            document.getElementById("bgm-loop").pause();
            alert("Congratulations you beat the game!");
        }
    }
}

document.addEventListener("DOMContentLoaded", main);
