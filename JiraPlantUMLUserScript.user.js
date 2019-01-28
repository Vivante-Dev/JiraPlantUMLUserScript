// ==UserScript==
// @name        JiraPlantUMLUserScript
// @include     https://jira.*
// @version     1
// @grant       none
// @run-at      document-end
// @noframes    
// @require     https://raw.githubusercontent.com/johan/js-deflate/master/rawdeflate.js
// @updateURL   https://raw.githubusercontent.com/vivante-health/JiraPlantUMLUserScript/master/JiraPlantUMLUserScript.user.js
// @downloadURL https://raw.githubusercontent.com/vivante-health/JiraPlantUMLUserScript/master/JiraPlantUMLUserScript.user.js
// ==/UserScript==

const selector = 'div.codeContent > pre';

function encode64(data) {
	r = "";
	for (i=0; i<data.length; i+=3) {
 		if (i+2==data.length) {
			r +=append3bytes(data.charCodeAt(i), data.charCodeAt(i+1), 0);
		} else if (i+1==data.length) {
			r += append3bytes(data.charCodeAt(i), 0, 0);
		} else {
			r += append3bytes(data.charCodeAt(i), data.charCodeAt(i+1),
				data.charCodeAt(i+2));
		}
	}
	return r;
}

function append3bytes(b1, b2, b3) {
	c1 = b1 >> 2;
	c2 = ((b1 & 0x3) << 4) | (b2 >> 4);
	c3 = ((b2 & 0xF) << 2) | (b3 >> 6);
	c4 = b3 & 0x3F;
	r = "";
	r += encode6bit(c1 & 0x3F);
	r += encode6bit(c2 & 0x3F);
	r += encode6bit(c3 & 0x3F);
	r += encode6bit(c4 & 0x3F);
	return r;
}

function encode6bit(b) {
	if (b < 10) {
 		return String.fromCharCode(48 + b);
	}
	b -= 10;
	if (b < 26) {
 		return String.fromCharCode(65 + b);
	}
	b -= 26;
	if (b < 26) {
 		return String.fromCharCode(97 + b);
	}
	b -= 26;
	if (b == 0) {
 		return '-';
	}
	if (b == 1) {
 		return '_';
	}
	return '?';
}

(function () {
  
  function renderPlantUML() {
    var canidates = document.querySelectorAll(selector);
    
    console.log(canidates.length);
    canidates = [].filter.call(canidates, function(el) {
      return el.innerText.startsWith('@startuml');
    });
    
    
    
    console.log(canidates.length);
    
    [].forEach.call(canidates, function (el) {
      const source = el.innerText;
      
      s = unescape(encodeURIComponent(source));
      const parent = el.parentNode;
      parent.innerHTML = '<img style="width:100%; height:100%" src="' +  'http://www.plantuml.com/plantuml/img/' + encode64(deflate(s, 9)) + '">';
      parent.classList.remove('codeContent');
      parent.classList.remove('panelContent');
      
      parent.parentNode.classList.remove('code');
      parent.parentNode.classList.remove('panel');
    });
  }
 
  function register() {
    renderPlantUML();
    //const id = 'description-val';
    const id = 'issue-content';
    //const id = 'descriptionmodule';
    
    // Select the node that will be observed for mutations
    var targetNode = document.getElementById(id);

    // Options for the observer (which mutations to observe)
    var config = { attributes: true, childList: true, subtree: true };


    // Create an observer instance linked to the callback function
    var observer = new MutationObserver(function(){ console.log('OBSERVED');  setTimeout(renderPlantUML, 500);});

    console.log(targetNode);
    if (targetNode) {
      // Start observing the target node for configured mutations
      observer.observe(targetNode, config);
    } else {
    
      const overviewId = 'jira';// 'ghx-detail-view';
      const overviewElement = document.getElementById(overviewId);

      if (overviewElement) {
        observer.observe(overviewElement, config);
      }
    }
  }
  
 	window.addEventListener('load', register, false);
}) ();
