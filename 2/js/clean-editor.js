var cleanEditor={
  load:function(s){
    //init the return object
    var obj;
    //if a selector or jQuery element was passed as an arg
    if(s!=undefined){
      var debug=false;
      //get the text area that will serve as the src code area
      var ta=jQuery(s).filter('textarea');
      if(ta.length>0){
        //only get the first instance
        ta=ta.eq(0);
        //if the editor is NOT already initialized
        if(!ta.hasClass('clean-editor-src')){
          //obj is returned to expose its functions and properties.
          //However, privObj holds functions and properties that are private to this load function
          obj={}; var privObj={};
        //==BASIC DOM AND STYLE SETUP==
          //set the class
          ta.addClass('clean-editor-src');
          //calculate % width for the textarea, ta
          var parentWidth=ta.parent().innerWidth();
          var taWidth=ta.outerWidth();
          if(parentWidth<taWidth){taWidth=parentWidth;}
          var widthP=taWidth/parentWidth*100;
          //calculate px height for the textarea, ta
          var heightPx=ta.outerHeight();
          //get the display of the textarea, ta
          var taDisplay=ta.css('display'); if(taDisplay=='inline'){taDisplay='inline-block';}
          //add the parent wrapper
          ta.after('<cleaneditor></cleaneditor>'); var wrap=ta.next('cleaneditor:first');
          wrap.append(ta);
          //set the key styles onto the cleaneditor wrap
          wrap.css('width',widthP+'%').css('height',heightPx+'px').css('display',taDisplay);
          //add the source code view wrapper
          wrap.append('<editorui></editorui>');
          var ui=wrap.children('editorui:first');
          ui.append('<table class="ui-table"><tbody></tbody></table>');
          var uitable=ui.children('table:first');
          var uibody=uitable.children('tbody:first');
        //==REUSABLE FUNCTIONS==
          //turn debugging on/off
          obj['debug']=function(onOff){
            if(onOff==undefined){onOff=true;}
            //if debug is on
            if(onOff){
              wrap.addClass('debug'); debug=true;
            }else{
              wrap.removeClass('debug'); debug=false;
            }return debug;
          };
          //function to return true or false based on element tag name
          var isTag=function(elem,tag){
            var itIs=false;
            if(elem!=undefined){
              if(elem.length>0){
                if(elem[0].hasOwnProperty('tagName')){
                  if(tag!=undefined){
                    tag=tag.toLowerCase();
                    if(elem[0].tagName.toLowerCase()==tag){
                      itIs=true;
                    }
                  }else{
                    //no tag given, but elem has a tagName property
                    itIs=true;
                  }
                }
              }
            }
            return itIs;
          };
          //generic replace all function
          var strRAll=function(theStr,charToReplace,replaceWith){
            if(theStr!=undefined){
              if(charToReplace==undefined){charToReplace='';}
              if(theStr.indexOf(charToReplace)!=-1){
                if(replaceWith==undefined){replaceWith='';}
                if(charToReplace!=replaceWith){
                  while(theStr.indexOf(charToReplace)!=-1){
                    theStr=theStr.replace(charToReplace,replaceWith);
                  }
                }
              }
            }else{theStr='';}
            return theStr;
          };
          //stop bubbling up to parent element events
          var stopBubbleUp=function(e){
            if(e.stopPropagation){e.stopPropagation();}
            else{console.log('This browser doesn\'t support stopPropagation! cleanEditor may not work properly!');}
          };
          //prevent default event action
          var preventDefault=function(e){
            e.preventDefault();
          };
          //detect special key press (ctl, alt, shift...)
          var isHeldSpecial=function(e){
            var isSpecial=true;
            //if event is defined
            if(e!=undefined){
              if(e.shiftKey==undefined||!e.shiftKey){
                if(e.ctrlKey==undefined||!e.ctrlKey){
                  if(e.altKey==undefined||!e.altKey){
                    //command key
                    if(e.metaKey==undefined||!e.metaKey){
                      isSpecial=false;
                    }
                  }
                }
              }
            }else{
              //event is not defined
              isSpecial=false;
            }
            return isSpecial;
          };
          //detect shift key
          var isHeldShift=function(e){
            var isShift=false;
            if(e!=undefined){
              if(e.shiftKey!=undefined&&e.shiftKey){
                isShift=true;
              }
            }
            return isShift;
          };
          //detect Ctl OR Command key
          var isHeldCtl=function(e){
            var isCtl=false;
            //if event is defined
            if(e!=undefined){
              //if normal ctl key held
              if(e.ctrlKey!=undefined&&e.ctrlKey){
                isCtl=true;
              }else{
                //if Mac command key held
                if(e.metaKey!=undefined&&e.metaKey){
                  isCtl=true;
                }
              }
            }
            return isCtl;
          };
          //detect MAC command key
          var isHeldCommand=function(e){
            var isCmd=false;
            //if Mac command key held
            if(e.metaKey!=undefined){
              if(e.metaKey){
                isCmd=true;
              }
            }
            return isCmd;
          };
          //create or find the cursor element, as needed
          var cursorElem;
          var getCur=function(){
            if(cursorElem==undefined||cursorElem.length<1){
              cursorElem=uibody.find('tr td.code > c:first');
              if(cursorElem.length<1){
                uibody.find('tr td.code:last').children('nl:last').before('<c></c>');
                cursorElem=uibody.find('tr td.code > c:last');
              }
            }
            return cursorElem;
          };
          //function that counts the number of characters BEFORE a given character element
          var getPos=function(charElem){
            var pos=0;
            //add temporary classes to help count number of characters appearing BEFORE the target
            charElem.addClass('target');
            var lineTd=charElem.parent(); lineTd.addClass('target');
            //for each td.code element, BEFORE the one that contains the target
            uibody.find('tr td.code').each(function(){
              //if this code line contains the target
              if(jQuery(this).hasClass('target')){
                //count all of the characters, UP TO the target
                jQuery(this).children().each(function(){
                  //if this is the target
                  if(jQuery(this).hasClass('target')){
                    //end counting characters in this line
                    return false;
                  }else{
                    //not the target...

                    //if this is NOT the cursor
                    if(!isTag(jQuery(this),'c')){
                      //count this character that appears BEFORE the target in this line
                      pos++;
                    }
                  }
                });
                //end counting code lines
                return false;
              }else{
                //target is NOT in this code line... so add all of the characters in this line to the count
                pos+=jQuery(this).children().not('c').length;
              }
            });
            //remove temporary helper classes
            charElem.removeClass('target'); lineTd.removeClass('target');
            return pos;
          };
          //function to count the number of characters BETWEEN AND INCLUDING two character elements
          var getRange=function(startChar, lastChar){
            var range=0;
            //temporary search class
            var firstTd=startChar.parent();
            //if end char defined (otherwise, just get range until the end)
            var lastTd;
            if(lastChar!=undefined){
              lastTd=lastChar.parent();
              lastChar.addClass('target'); lastTd.addClass('target');
            }
            //if the startChar and endChar are NOT the same characters
            if(!startChar.hasClass('target')){
              //==COUNT CHARACTERS AFTER THE START CHARACTER, IN THE FIRST CODE LINE==
              //if NOT starting with the cursor
              if(!isTag(startChar,'c')){
                //count the first character within the range
                range++;
              }
              //for each character in the startChar's row (up until the end of the row OR the endChar)
              while(startChar!=undefined){
                startChar=startChar.next();
                //if end of the code line
                if(startChar.length<1){
                  startChar=undefined;
                }else{
                  //NOT the end of the first code line...

                  //if NOT the cursor
                  if(!isTag(startChar,'c')){
                    range++;
                  }
                  //if this is the lastChar
                  if(startChar.hasClass('target')){
                    startChar=undefined;
                  }
                }
              }
              //==COUNT CHARACTERS IN EACH ROW THAT DOESN'T CONTAIN THE LAST CHARACTER
              //if the first row isn't also the last row
              var more=false;
              if(!firstTd.hasClass('target')){
                more=true;
                while(firstTd!=undefined){
                  //next code line
                  firstTd=firstTd.parent().next().children('td.code:last');
                  //if there is a next code line
                  if(firstTd.length>0){
                    //if NOT the code line that contains lastChar
                    if(!firstTd.hasClass('target')){
                      //count all of the characters in this line
                      range+=firstTd.children().not('c').length;
                    }else{
                      //don't count this entire row... it is the target row
                      firstTd=undefined;
                    }
                  }else{
                    //no next code line...
                    firstTd=undefined;
                    more=false;
                  }
                }
              }
              //==COUNT CHARACTERS BEFORE THE END CHARACTER, IN THE LAST CODE LINE==
              //if not already counted the LAST code line
              if(more){
                //if there is a last code line given
                if(lastTd!=undefined&&lastTd.length>0){
                  //for each character up until the last
                  lastTd.children().each(function(){
                    //if this is the last character
                    if(jQuery(this).hasClass('target')){
                      //add one to the range count
                      range++;
                      //force the count to end
                      return false;
                    }else{
                      //not the last character... if NOT the cursor
                      if(!isTag(jQuery(this),'c')){
                        //add one to the range count
                        range++;
                      }
                    }
                  });
                }
              }
            }else{
              //startChar is the endChar...

              //if NOT the cursor
              if(!isTag(startChar,'c')){
                range++;
              }
            }
            //remove temporary search class
            lastChar.removeClass('target'); lastTd.removeClass('target');
            return range;
          };
          //count the number of characters that appear before the cursor in the UI
          var cursorPos;
          var getCurPos=function(movePosSum){
            //if adding to the previous position
            if(movePosSum!=undefined){
              if(cursorPos==undefined){cursorPos=0;}
              //either add or subtract from the previous cursor position
              cursorPos+=movePosSum;
            }else{
              //get the current position, as it appears in the UI...

              //if the cursor position is NOT cached
              if(cursorPos==undefined){
                //count the number of characters that appear BEFORE the cursor
                var cr=getCur();
                cursorPos=getPos(cr);
              }
            }
            return cursorPos;
          };
        //==EVENT HANDLERS==
          //function to create a line break at the cursor
          var breakAtCursor=function(cr){
            if(cr==undefined||cr.length<1){
              cr=getCur();
            }
            //get the parent tr element
            var currentTr=cr.parent().parent();
            var numTd=currentTr.children('td.num:first');
            var num=numTd.text(); num=parseInt(num); num++;
            //create a new row after this tr
            var newTr=privObj.appendUiRow(num,'',currentTr);
            var newCodeTd=newTr.children('td.code:last');
            var newNl=newCodeTd.children('nl:last');
            //move all of the characters after the cursor (before the new line) to the new row
            var nextChar=cr.next();
            while(nextChar.length>0&&!isTag(nextChar,'nl')){
              //move this character before the new nl char
              newNl.before(nextChar);
              //get the next char after the cursor
              nextChar=cr.next();
            }
            return newTr;
          }
          //function to update the line numbers starting at a given tr element
          var updateLineNumbers=function(startTr){
            var updateCount=0;
            if(startTr==undefined){
              uibody.children().children('td.num:first').each(function(n){
                jQuery(this).text((n+1)+'');
                updateCount++;
              });
            }else{
              var index;
              //get starting index
              if(isNaN(startTr)){
                //get the index of the tr element
                index=startTr.index();
              }else{
                //get the tr element from the index
                index=startTr;
                startTr=uibody.children().eq(index);
              }
              if(index!=undefined){
                //if index is a number
                if(!isNaN(index)){
                  //if index is not negative
                  if(index>-1){
                    if(isTag(startTr,'tr')){
                      //for each
                      while(startTr.length>0){
                        startTr.children('td.num:first').text((index+1)+'');
                        startTr=startTr.next();
                        index++;
                        updateCount++;
                      }
                    }
                  }
                }
              }
            }
            return updateCount;
          };
          //get the selection range (start and end pos)
          var selRange;
          var getSelRange=function(){
            //if the range is NOT cached
            if(selRange==undefined){
              //if there is a first selected character
              var firstSelChar=uibody.find('tr td.code > .sel:first');
              if(firstSelChar.length>0){
                //==GET THE POSITION OF THE FIRST SELECTED CHARACTER==
                //get the start position of the first selected character
                var startPos=getPos(firstSelChar);
                //==COUNT UP TO THE LAST SELECTED CHARACTER==
                var lastSelChar=uibody.find('tr td.code > .sel:last');
                var range=getRange(firstSelChar,lastSelChar);
                var endPos=startPos+range;
                //==SET THE START AND END POSITIONS==
                selRange={'start':startPos,'end':endPos};
              }
            }
            return selRange;
          };
          //function to return the tr elements that contain selected characters
          var getSelTrs=function(selChars,trFunc){
            var selTrs;
            if(selChars==undefined){
              selChars=uibody.find('tr td.code > .sel');
            }
            //if there are any selected characters
            if(selChars.length>0){
              //mark the start and end tr rows
              var startTr=selChars.eq(0).parent().parent();
              var endTr=selChars.filter(':last').parent().parent();
              endTr.addClass('target'); onward=true;
              //if the start and end tr are NOT the same
              if(!startTr.hasClass('target')){
                //for each row that has selected characters
                while(onward){
                  //if there is a next row
                  if(startTr.length>0){
                    //has selected characters
                    startTr.addClass('has-sel');
                    //if there is a function to run for tr items
                    if(trFunc!=undefined){
                      trFunc(startTr);
                    }
                    //if this is the end row
                    if(startTr.hasClass('target')){
                      //stop looking for the next one
                      startTr.removeClass('target');
                      onward=false;
                    }else{
                      //not the end row... get the next one
                      startTr=startTr.next();
                    }
                  }else{
                    //no next row... so stop
                    onward=false;
                  }
                }
                //get the selected rows
                endTr.removeClass('target');
                selTrs=uibody.children('.has-sel').removeClass('has-sel');
              }else{
                //start and end tr are the same
                selTrs=endTr.removeClass('target');
                //if there is a function to run for tr items
                if(trFunc!=undefined){
                  trFunc(selTrs);
                }
              }
            }
            return selTrs;
          };
          //function used to mark the rows that should be either merged OR deleted based on their selected characters
          var getSelDelMergeTrs=function(selChars){
            //get the tr elements that contain selected characters
            var selTrs=getSelTrs(selChars,function(selTr){
              //mark the tr rows, with ALL selected characters, with a "remove" class
              var codeTd=selTr.children('td.code:last');
              //if ALL of the characters in this tr are selected
              if(codeTd.children().not('.sel').length<1){
                //mark this tr as needing removal
                selTr.addClass('remove');
              }else{
                //not ALL characters in this tr are selected...

                //if the nl character is selected in this tr
                if(codeTd.children('nl:last').hasClass('sel')){
                  //mark this tr as needing to be merged with the next tr
                  selTr.removeClass('nl-sel');
                  selTr.addClass('merge');
                }
              }
            });
            return selTrs;
          };
          //merge two tr rows together, for example, if tr1 loses its newline character
          var mergeAdjacentTrRows=function(tr1,tr2){
            //if the merge-into row (tr1) exists
            if(tr1!=undefined&&tr1.length>0){
              //if tr2 NOT given
              if(tr2==undefined){
                //get tr2
                tr2=tr1.next();
              }
              //make sure the tr doesn't have merge class anymore
              tr1.removeClass('merge');
              //get the td.code of the tr1 element
              var td1=tr1.children('td.code:last');
              //if there is a tr2 (if tr1 is NOT the last row)
              if(tr2.length>0){
                //merge the letters from tr2 to tr1
                var td2=tr2.children('td.code:last');
                td1.children(':last').after(td2.children());
                //remove tr2
                tr2.remove();
              }
              //if tr1 doesn't end with nl
              if(td1.children(':last').filter('nl').length<1){
                //restore a nl character at the end of the tr1 code line
                td1.append('<nl>&nbsp;</nl>');
                privObj.evsChars(td1.children('nl:last'));
              }
              //remove all but the last nl character
              td1.children('nl').not('nl:last').remove();
            }
          };
          //make sure nl characters are NOT doubled up AND the nl-sel classes are correct
          var cleanNlChars=function(nlChars){
            //if newline characters given
            if(nlChars!=undefined){
              //for each of the given newline characters
              nlChars.each(function(){
                var nlChar=jQuery(this);
                //if this nl char was not in a removed row
                if(nlChar.parent()!=undefined&&nlChar.parent().length>0){
                  //if this newline character is selected
                  if(nlChar.hasClass('sel')){
                    //select the tr
                    nlChar.parent().parent().addClass('nl-sel');
                  }
                  //if there is a character right of this nl character
                  var rChar=nlChar.next();
                  if(rChar.length>0){
                    //remove the right character
                    rChar.remove();
                  }
                  //if there is a character left of this nl character
                  var lChar=nlChar.prev();
                  if(lChar.length>0){
                    //if the left character is ALSO a newline
                    if(isTag(lChar,'nl')){
                      //remove the duplicate nl character
                      lChar.remove();
                    }
                  }
                }
              });
            }
            uibody.children('tr:last').removeClass('nl-sel').children('td.code:last').children('nl:last').removeClass('sel');
          };
          //when the editor receives focus or SHOULD receive focus
          var focusOn=function(e,elem){
            //if doesn't already have focus
            if(!wrap.hasClass('focus')){
              //add the focus
              wrap.addClass('focus');
            }
            //if the focus-triggering element was NOT ta, the textarea (avoid infinite loop)
            if(!elem.hasClass('clean-editor-src')){
              //if the src textarea doesn't already have focus
              if(!ta.is(':focus')){
                //set the focus
                ta.focus();
              }
            }
          };
          //when the editor loses focus or SHOULD lose focus
          var focusOff=function(e,elem){
            //if already has focus
            if(wrap.hasClass('focus')){
              //remove focus
              wrap.removeClass('focus');
            }
            //if the src textarea already has focus
            if(ta.is(':focus')){
              //remove the focus
              ta.blur();
            }
            //if the ui cursor is still blinking
            if(cursorElem!=undefined){
              if(cursorElem.length>0){
                //remove the cursor from the ui
                cursorElem.remove();
              }
            }
          };
          //when start moving selected letters (by dragging)
          var dragSelStart=function(e){
            if(!wrap.hasClass('drag-sel')){
              //allow dragging selected to be detected
              wrap.addClass('drag-sel');
            }
          };
          //when end moving selected letters (by dragging)
          var dragSelStop=function(e){
            if(wrap.hasClass('drag-sel')){
              //stop allowing dragging selected to be detected
              wrap.removeClass('drag-sel');
              //make sure the class indicator for trying to drop selected on itself is removed
              wrap.removeClass('drop-on-sel');
            }
          };
          //when the mouse down happens on a letter, or should happen
          var dragStart=function(e){
            if(!wrap.hasClass('drag')){
              //allow select to be detected
              wrap.addClass('drag');
            }
          };
          //when the mouse is released, or should happen
          var dragStop=function(e){
            if(wrap.hasClass('drag')){
              //stop allowing select to be detected
              wrap.removeClass('drag');
            }
          };
          //function: record the current state of the text area
          var taState={};
          var recordTaState=function(){
            //start
            taState['start']=ta[0].selectionStart;
            //end
            taState['end']=ta[0].selectionEnd;
            //has selection
            taState['has_selected']=taState['start']!=taState['end'];
            //selection count
            if(taState['has_selected']){
              //calculate the number selected
              taState['count_selected']=taState['end']-taState['start'];
            }else{
              //no selectd characters
              taState['count_selected']=0;
            }
            //value
            taState['val']=ta.val();
          };
          //function: record the current state of the text area AND indicate IF/HOW it changed from the previous state
          //these tracked changes help determine how to align the UI with the textarea when keys change data in the textarea
          var trackTaStateChanges=function(e,eType){
            var origState;
            //if NOT the first time this function is called to track the state changes
            if(taState.hasOwnProperty('start')){
              //save this previous state as an original
              origState={};
              for(var key in taState){
                if(taState.hasOwnProperty(key)){
                  origState[key]=taState[key];
                }
              }
            }
            //update the basic tracked values
            recordTaState();
            //indicate changed values
            taState['changed']={'anything':false};
            for(var key in taState){
              if(taState.hasOwnProperty(key)){
                //if not a value type that doesn't count when changed
                if(key!='changed'&&key!='eType'&&key!='keyCode'){
                  taState['changed'][key]={};
                  //if no previous state
                  if(origState==undefined){
                    //any and all state values have changed
                    taState['changed'][key]['flag']=true;
                    taState['changed'][key]['detail']='init';
                    taState['changed'][key]['difference']=-1;
                    taState['changed']['anything']=true;
                  }else{
                    //there was a previous state...
                    taState['changed'][key]['flag']=false;
                    taState['changed'][key]['detail']='same';
                    //if this value is a string
                    switch(typeof taState[key]){
                      case 'string':
                        taState['changed'][key]['difference']=0;
                        var newLen=taState[key].length;
                        var oldLen=origState[key].length;
                        //if this is the val
                        if(key=='val'){
                          //if nothing selected now
                          if(!taState['has_selected']){
                            //if this is a change from last time
                            if(taState['changed']['count_selected']['flag']){
                              //get the number of characters that WERE selected
                              var numPrevSel=taState['changed']['count_selected']['difference'];
                              //if new characters were inserted in addition to the selected characters being deleted
                              if(newLen>(oldLen-numPrevSel)){
                                //do not count the selected letters that were removed, as part of the old length
                                oldLen-=numPrevSel;
                              }
                            }
                          }
                        }
                        //length never changed
                        if(newLen==oldLen){
                          //if the value changed
                          if(taState[key]!=origState[key]){
                            taState['changed'][key]['flag']=true;
                            taState['changed'][key]['detail']='modified';
                            taState['changed']['anything']=true;
                          }
                        }else{
                          //length changed... if letters were removed
                          taState['changed'][key]['flag']=true;
                          taState['changed']['anything']=true;
                          if(newLen<oldLen){
                            taState['changed'][key]['detail']='-';
                            taState['changed'][key]['difference']=oldLen-newLen;
                          }else{
                            //string is longer... letters added (not counting selected letters that were removed)
                            taState['changed'][key]['detail']='+';
                            taState['changed'][key]['difference']=newLen-oldLen;
                          }
                        }
                      break;
                      case 'number':
                        //if the value changed
                        taState['changed'][key]['difference']=0;
                        if(taState[key]!=origState[key]){
                          taState['changed'][key]['flag']=true;
                          taState['changed']['anything']=true;
                          //if the new number is less than the old number
                          if(taState[key]<origState[key]){
                            taState['changed'][key]['detail']='-';
                            taState['changed'][key]['difference']=origState[key]-taState[key];
                          }else{
                            //new number is greater than the old number...
                            taState['changed'][key]['detail']='+';
                            taState['changed'][key]['difference']=taState[key]-origState[key];
                          }
                        }
                      break;
                      default:
                        //not a string nor number... if the value changed
                        if(taState[key]!=origState[key]){
                          taState['changed'][key]['flag']=true;
                          taState['changed']['anything']=true;
                          taState['changed'][key]['detail']='modified';
                        }
                      break;
                    }
                  }
                }
              }
            }
            //if anything changed
            if(taState['changed']['anything']){
              //set what keycode triggered the change
              taState['keyCode']=-1;
              if(e!=undefined){
                if(e.keyCode!=undefined){
                  taState['keyCode']=e.keyCode;
                }
              }
              //set what event type triggered the change
              taState['eType']='?';
              if(eType!=undefined){
                taState['eType']=eType;
              }
            }
          };
          //deselect any selected ui letters
          var deselect=function(){
            //remove selection from ui elements
            if(uibody.find('tr td.code .sel').removeClass('sel').length>0){
              //remove nl-sel from tr
              uibody.children('tr.nl-sel').removeClass('nl-sel');
              //remove selection from hidden textarea
              ta[0].selectionStart=ta[0].selectionEnd=-1;
              //record the state changes to the textarea
              recordTaState();
            }
          };
          //drop the drag-selected text onto the current cursor position
          var follow_drag_timeout;
          var dropAtCursor=function(e){
            clearTimeout(follow_drag_timeout);
            var didDrop=false;
            //get the cursor element
            var cr=getCur();
            //if the cursor is NOT IN or ADJACENT to selected characters
            if(!cr.next().hasClass('sel')){
              if(!cr.prev().hasClass('sel')){
                //if the cursor does NOT have the selected class (it shouldn't)
                if(!cr.hasClass('sel')){
                  //==UPDATE THE HIDDEN TEXT AREA==
                  //get the selection range and the position where the selection should be moved
                  var range=getSelRange();
                  var pos=getCurPos();
                  //get the selected text that will be moved
                  var selTxt=ta.val().slice(range.start,range.end);
                  //get the insert position that will be used after the selected text is removed, temporarily
                  var newPos=pos;
                  //if the drop position is AFTER the selected text, then adjust the drop index to be MINUS the temporarily removed text length
                  var selLen=selTxt.length;
                  if(newPos>range.start){newPos-=selLen;}
                  //remove the selected text, temporarily
                  var newTxt=ta.val().substring(0,range.start)+ta.val().substring(range.end);
                  //split the text at the index where the selected text will be inserted
                  var txtBeforeIns=newTxt.substring(0,newPos);
                  var txtAfterIns=newTxt.substring(newPos);
                  newTxt=undefined; //drop in memory
                  //insert the selected text at the new position and update the textarea value
                  ta.val(txtBeforeIns+selTxt+txtAfterIns); txtAfterIns=undefined; txtBeforeIns=undefined; selTxt==undefined;
                  taState['val']=ta.val();
                  //==UPDATE THE CURSOR POSITION AND SELECTION RANGE INDEXES==
                  cursorPosition=newPos; selRange.start=newPos; selRange.end=newPos+selLen;
                  //==SELECT THE MOVED TEXT IN THE TEXT AREA==
                  ta[0].selectionStart=selRange.start;
                  ta[0].selectionEnd=selRange.end;
                  //==UPDATE THE UI==
                  //get the selected UI characters
                  var selChars=uibody.find('tr td.code > .sel');
                  //if there are any newline characters selected
                  var nlChars=selChars.filter('nl');
                  if(nlChars.length>0){
                    //==MARK TR ELEMENTS, EITHER FOR REMOVAL, OR FOR MERGE==
                    var selTrs=getSelDelMergeTrs(selChars);
                    //==FIGURE OUT THE EARLIEST AFFECTED ROW'S INDEX==
                    //this row index will be the first row number to update
                    var cursorRow=cr.parent().parent();
                    var cursorRowIndex=cursorRow.index();
                    var firstSelRowIndex=selTrs.eq(0).index();
                    var updateRowIndex=cursorRowIndex;
                    //if the first selected row is before the cursor row
                    if(firstSelRowIndex<cursorRowIndex){
                      updateRowIndex=firstSelRowIndex;
                    }
                    //==DROP THE SELECTED CHARACTERS INTO PLACE
                    //move the selected characters before the cursor element
                    cr.before(selChars); cr.remove();
                    //==REMOVE EMPTY TR ELEMENTS
                    //remove the tr rows that are now empty
                    selTrs.filter('.remove').remove(); selTrs=selTrs.not('.remove');
                    //==MERGE TR ELEMENTS THAT LOST THEIR NEWLINE CHARACTER==
                    mergeAdjacentTrRows(selTrs.eq(0));
                    //==ADD NEW CODE LINE ROWS AFTER EACH NEWLINE CHARACTER IN THE DRAG-TO ROW==
                    var rowIndex=0;
                    //for each character in this row (where the selected characters were moved)
                    var resolveChars=selChars.eq(0).parent().children();
                    resolveChars.each(function(){
                      //add the row index class to this character
                      var char=jQuery(this);
                      if(rowIndex>0){
                        char.addClass('new-row-'+rowIndex);
                      }
                      //if this is a newline character
                      if(isTag(char,'nl')){
                        //next row for the next character
                        rowIndex++;
                      }
                    });
                    if(rowIndex>0){rowIndex--;}
                    //if any new rows are needed
                    if(rowIndex>0){
                      //get the current row (to append a new row after)
                      var addAfterTr=selChars.eq(0).parent().parent();
                      //for each new row to create
                      for(var r=1;r<=rowIndex;r++){
                        var rClass='new-row-'+r;
                        //create the new tr row after the addAfterTr element
                        addAfterTr=privObj.appendUiRow(-1,'',addAfterTr);
                        //insert the characters into the new row
                        var newCodeTd=addAfterTr.children('td.code:last');
                        newCodeTd.children().remove();
                        newCodeTd.append(resolveChars.filter('.'+rClass).removeClass(rClass));
                      }
                    }
                    //==CLEAN UP NEWLINE CHARACTERS
                    cleanNlChars(nlChars);
                    //==UPDATE THE LINE NUMBERS==
                    //updateRowIndex is the first line number row that needs to be updated
                    updateLineNumbers(updateRowIndex);
                  }else{
                    //selected text is all on the SAME code line (no newline characters selected)...

                    //move the selected characters before the cursor element
                    cr.before(selChars); cr.remove();
                  }
                  //record the state changes to the textarea
                  recordTaState();
                  //drop done
                  didDrop=true;
                }
              }
            }
            return didDrop;
          };
          //figures out if the mouse curor is closer to the right or left edge of an element
          var findCloserEdgeX=function(e,elem){
            var ret='';
            //get the left and right edges of this letter character
            var elLeft=elem.offset().left;
            var elRight=elLeft+elem.outerWidth();
            //figure out if the mouse is closer to the left or right edge of the letter character
            var rDiff=elRight-e.clientX;
            var lDiff=e.clientX-elLeft;
            //if rDiff is negative, mouse is right of the right edge (out of the element)
            if(rDiff<0){
              ret='right out';
            }else if(lDiff<0){
              //lDiff is negative, mouse is left of the left edge (out of the element)
              ret='left out';
            }else{
              //mouse is BETWEEN left and right edge (is IN the element)...

              //if the mouse is closer to the left edge
              if(lDiff<rDiff){
                ret='left in';
              }else if(lDiff>rDiff){
                //the mouse is closer to the right edge
                ret='right in';
              }else{
                //mouse is equa-distant from either edge
                ret='center in';
              }
            }
            return ret;
          };
          //position the drag cursor to follow the mouse drag
          var followMouseDrag=function(e){
            clearTimeout(follow_drag_timeout);
            follow_drag_timeout=setTimeout(function(){
              //find the cursor
              var cr=getCur();
              //if a cursor element is being hovered
              var overElem=uibody.find('.over:first');
              if(overElem.length>0){
                //function to detect if the cursor is already adjacent to the element
                var crAlreadyThere=function(elem,leftOrRight){
                  var isThere=true;
                  var adjElem;
                  //get the adjacent element
                  if(leftOrRight=='left'){adjElem=elem.prev();}
                  else{
                    //no element can appear AFTER nl
                    if(isTag(elem,'nl')){
                      //check BEFORE the nl instead of AFTER
                      adjElem=elem.prev();
                    }else{
                      //check BEFORE the non-nl element
                      adjElem=elem.next();
                    }
                  }
                  //if there is an adjacent element
                  if(adjElem.length>0){
                    //is the adjacent element the cursor?
                    if(!isTag(adjElem,'c')){
                      isThere=false;}
                  }else{isThere=false;}
                  return isThere;
                };
                //function to move cursor before/after element
                var moveCurNextTo=function(elem,leftOrRight){
                  //if the cursor is NOT already in position
                  if(!crAlreadyThere(elem,leftOrRight)){
                    if(leftOrRight=='left'){
                      //move the cursor BEFORE the element
                      elem.before(cr);
                    }else{
                      //move the cursor AFTER the element...

                      //if the element is a new line, the cursor can only be LEFT of it
                      if(isTag(elem,'nl')){
                        elem.before(cr);
                      }else{
                        //go ahead and move the cursor after the NON <nl> element
                        elem.after(cr);
                      }
                    }
                  }
                };
                //depending on the type of hovered element
                var tagName=overElem[0].tagName.toLowerCase();
                switch(tagName){
                  case 'td': //hovered over the code line but NOT over any letter IN the code line
                    //if the cursor is not already at the end of this code line (before the <nl>)
                    var nl=overElem.children('nl:last');
                    var lastCharInTd=nl.prev();
                    //if there are any chars in the code line
                    if(lastCharInTd.length>0){
                      //if the last code line element is NOT the cursor
                      if(!isTag(lastCharInTd,'c')){
                        //put the cursor at the end of the code line, before the new line
                        nl.before(cr);
                      }
                    }else{
                      //no chars in the code line... put the cursor at the end of the code line, before the new line
                      nl.before(cr);
                    }
                    break;
                  default: //hovered over a character IN the code line
                    //if hovering over a character this is ALREADY selected
                    if(overElem.hasClass('sel')){
                      //get the first selected character
                      var firstSel=uibody.find('.sel:first');
                      moveCurNextTo(firstSel,'left');
                    }else{
                      //NOT hovering over a selected character...

                      //is the mouse closer to the right or left edge of the character?
                      var closerEdge=findCloserEdgeX(e,overElem);
                      //if closer to the left edge (or centered)
                      if(closerEdge.indexOf('left')==0||closerEdge.indexOf('center')==0){
                        moveCurNextTo(overElem,'left');
                      }else{
                        //closer to the right edge...
                        moveCurNextTo(overElem,'right');
                      }
                    }
                    break;
                }
              }
            },16);
          };
          //adds a sel class to the selected characters in the UI
          var setUiSelected=function(e){
            var retObj;
            var selObj=window.getSelection();
            if(selObj!=undefined){
              if(selObj.hasOwnProperty('type')){
                if(selObj.type.toLowerCase()=='range'){
                  //get the start of the selection
                  var startElem=jQuery(selObj.anchorNode.parentNode);
                  //if selected start element is a code letter
                  if(startElem.parent().hasClass('code')){
                    retObj={};
                    //remove the cursor while selecting
                    if(cursorElem!=undefined&&cursorElem.length>0){
                      cursorElem.remove();
                    }
                    //get the end of the selection
                    var endElem=jQuery(selObj.focusNode.parentNode);
                    endElem.addClass('end-sel'); retObj['endElem']=endElem;
                    //==DISCOVER DRAG DIRECTION AND HOW MANY ROWS SELECTION SPANS==
                    //decide what direction the selectino was dragged
                    var direction=''; var rowSpan=1;
                    //get parent tr elements
                    var startTr=startElem.parents('tr:first');
                    var endTr=endElem.parents('tr:first');
                    endTr.addClass('end-sel');
                    //if selection starts and ends in the same row
                    var startRowIndex=startTr.index();
                    var endRowIndex=endTr.index();
                    if(startRowIndex==endRowIndex){
                      //if the start and end letter are the same
                      var startCharIndex=startElem.index();
                      var endCharIndex=endElem.index();
                      if(startCharIndex==endCharIndex){
                        direction='none';
                      }else if(startCharIndex<endCharIndex){
                        //start char is before end char
                        direction='right';
                      }else{
                        //start char is after end char
                        direction='left';
                      }
                    }else if(startRowIndex<endRowIndex){
                      //start row is before the end row
                      direction='right';
                      rowSpan=endRowIndex-startRowIndex+1;
                    }else{
                      //start row is after the end row
                      direction='left';
                      rowSpan=startRowIndex-endRowIndex+1;
                    }
                    //==ADD THE SEL CLASS TO SELECTED CHARACTER ELEMENTS==
                    //select the next adacent character element
                    var nextNew=function(charElem,dir){
                      var el;
                      //get the next adjacent element
                      if(dir=='right'){el=charElem.next();}
                      else{el=charElem.prev();}
                      //if there is another adjacent element
                      if(el.length>0){
                        //mark this as a new selected element
                        el.addClass('new-sel');
                        //if this should be the last selected
                        if(el.hasClass('end-sel')){
                          el=undefined;
                        }
                      }else{el=undefined;} return el;
                    };
                    //select each next adacent character in a single row
                    var whileNext=function(charElem,dir){
                      //the first char element should have the class
                      charElem.addClass('new-sel');
                      //while there is a next element in this row that should get the new-sel class
                      while(charElem!=undefined){
                        //get the next new-sel character element, if there is one
                        charElem=nextNew(charElem,dir);
                      }
                    };
                    //select ALL characters in the next fully selected row
                    var nextNewFullRow=function(rEl,dir){
                      var el;
                      //get the next adjacent element
                      if(dir=='right'){el=rEl.next();}
                      else{el=rEl.prev();}
                      //if there is another adjacent element
                      if(el.length>0){
                        //if this should be the last selected
                        if(el.hasClass('end-sel')){
                          el=undefined;
                        }else{
                          //mark characters in this row as new-sel
                          var cTd=el.children('td.code:last');
                          cTd.children().addClass('new-sel');
                        }
                      }else{el=undefined;} return el;
                    };
                    //select ALL characters in EACH fully selected row (between first and last row)
                    var whileNextFullRow=function(rEl,dir){
                      //mark characters in this row as new-sel
                      var cTd=rEl.children('td.code:last');
                      cTd.children().addClass('new-sel');
                      //while there is a next element in this row that should get the new-sel class
                      while(rEl!=undefined){
                        //get the next FULLY SELECTED tr row, if there is one
                        rEl=nextNewFullRow(rEl,dir);
                      }
                    };
                    //remove new-sel class and replace with actual sel class
                    var finishNewSel=function(){
                      //remove previous selection
                      uibody.find('tr td.code > .sel').not('.new-sel').removeClass('sel');
                      //set new selection (and remove new-sel)
                      var selElems=uibody.find('tr td.code > .new-sel').removeClass('new-sel').not('.sel').addClass('sel');
                      //select tr rows that contain selected newline characters
                      uibody.find('tr td.code > nl.sel').each(function(){
                        jQuery(this).parent().parent().addClass('nl-sel');
                      });
                    };
                    //clear nl-sel classes
                    uibody.children('.nl-sel').removeClass('nl-sel');
                    //depending on the direction
                    switch(direction){
                      case 'none': //no direction; only one character selected
                        //deselect all that are NOT selected
                        uibody.find('tr td.code > .sel').not(startElem).removeClass('sel');
                        //select the single character
                        startElem.addClass('sel');
                        //if this is a newline character
                        if(isTag(startElem,'nl')){
                          //add nl-sel class
                          startTr.addClass('nl-sel');
                        }
                        //should the cursor be to the right or left?
                        var closerEdge=findCloserEdgeX(e,startElem);
                        //if the cursor is closer to the left edge of the selection
                        if(closerEdge.indexOf('left')==0||closerEdge.indexOf('center')==0){
                          //cursor should appear to the left
                          retObj['cur_pos']='left';
                        }else{
                          //cursor should appear to the right
                          retObj['cur_pos']='right';
                        }
                        break;
                      case 'right': //cursor drag to the right
                        whileNext(startElem,'right');
                        //if MORE than one row was selected
                        if(rowSpan>1){
                          //if more than two rows were selected
                          if(rowSpan>2){
                            //select each full row BETWEEN the first and last row
                            whileNextFullRow(startTr.next('tr:first'),'right');
                          }
                          //select the last row up until the last character element
                          whileNext(endTr.children('td.code:last').children(':first'),'right');
                        }
                        retObj['cur_pos']='right';
                        //replace new-sel classes with sel class
                        finishNewSel();
                        break;
                      case 'left': //cursor drag to the left
                        whileNext(startElem,'left');
                        //if MORE than one row was selected
                        if(rowSpan>1){
                          //if more than two rows were selected
                          if(rowSpan>2){
                            //select each full row between the first and last row
                            whileNextFullRow(startTr.prev('tr:first'),'left');
                          }
                          //select the last row up until the last character element
                          whileNext(endTr.children('td.code:last').children(':last'),'left');
                        }
                        retObj['cur_pos']='left';
                        //replace new-sel classes with sel class
                        finishNewSel();
                        break;
                    }
                    endElem.removeClass('end-sel'); endTr.removeClass('end-sel');
                    //the last line shouldn't show having a newline character
                    uibody.children('tr:last').removeClass('nl-sel').children('td.code:last').children('nl:last').removeClass('sel');
                  }
                }
              }
            }
            return retObj;
          };
          //function to move the UI cursor either left or right of a character element
          var setUiCurByChar=function(e,elem){
            //get the cursor
            var cr=getCur();
            //if the element is NOT a new line
            if(!isTag(elem,'nl')){
              //is the mouse closer to the left or right of the char elem
              var closerEdge=findCloserEdgeX(e,elem);
              //if closer to the left edge (or centered)
              if(closerEdge.indexOf('left')==0||closerEdge.indexOf('center')==0){
                //put the cursor to the LEFT of the character element
                elem.before(cr);
              }else{
                //closer to the right edge...

                //put the cursor to the RIGHT of the character element
                elem.after(cr);
              }
            }else{
              //elem is a <nl> character... cursor can only be left of the new line
              elem.before(cr);
            }
          };
          //set the ui cursor at the end of a td.code line
          var setUiCurAtLineEnd=function(lineTd){
            //get the cursor
            var cr=getCur();
            //put the cursor at the end of the given line
            lineTd.children('nl:last').before(cr);
          };
          //set the ui cursor at the start of a td.code line
          var setUiCurAtLineStart=function(lineTd){
            //get the cursor
            var cr=getCur();
            //put the cursor at the end of the given line
            lineTd.prepend(cr);
          };
          //select the entire td.code line
          var selectUiCodeLine=function(lineTd){
            //select the ui code line
            lineTd.children().addClass('sel');
            lineTd.parent().addClass('nl-sel');
            uibody.children('tr:last').removeClass('nl-sel').children('td.code:last').children('nl:last').removeClass('sel');
            //clear the cahced selected range and update the textarea with a new selected range
            selRange=undefined;
            setTextareaSelected();
          };
          //set the cursor at the start of the document
          var setUiCurAtEnd=function(){
            //get the cursor
            var cr=getCur();
            //get the last code line
            var lastLineTd=uibody.find('tr td.code:last');
            lastLineTd.children('nl:last').before(cr);
          };
          //set the cursor inside the textarea, aligned with the UI cursor
          var setTextareaCaret=function(){
            //if no UI text is selected
            if(uibody.find('tr td.code > .sel:first').length<1){
              //==COUNT THE NUMBER OF CHARACTERS THAT APPEAR BEFORE THE UI CURSOR==
              var caretPos=getCurPos();
              //==SET THE CURSOR POSITION IN THE HIDDEN TEXTAREA==
              //if the cursor is NOT already at the correct position
              if(ta[0].selectionStart!=caretPos){
                //set the new caret position in the textarea
                ta[0].setSelectionRange(caretPos, caretPos);
                //record the state changes to the textarea
                recordTaState();
              }
            }
          };
          //function to duplicate UI selection into the hidden textarea's selection
          var setTextareaSelected=function(){
            //get the start and end positions of the selection range
            var range=getSelRange();
            if(range!=undefined){
              var changeMade=false;
              //set the textarea selection range
              if(range.start!=ta[0].selectionStart){
                ta[0].selectionStart=range.start;
                changeMade=true;
              }
              if(range.end!=ta[0].selectionEnd){
                ta[0].selectionEnd=range.end;
                changeMade=true;
              }
              if(changeMade){
                //record the state changes to the textarea
                recordTaState();
              }
            }
          };
          //handle a mouse up event over editor elements
          var editorMouseRelease=function(e,elem,setUiCursorSingleClick){
            //==IF MOUSE UP ON CURSOR==
            if(isTag(elem,'c')){
              //update selected letters class (if any selected)
              setUiSelected(e);
              //prevent bubble
              stopBubbleUp(e);
              //stop drag because the mouse was released
              dragStop(e); dragSelStop(e);
            //==NO SELECTION, SINGLE CLICK TO SET THE CURSOR==
            }else if(uibody.find('tr td.code > .sel:first').length<1){
              //update selected letters class (if any selected)
              var selObj=setUiSelected(e);
              //prevent bubble and set focus
              stopBubbleUp(e); focusOn(e,elem);
              //stop drag because the mouse was released
              dragStop(e); dragSelStop(e);
              //if nothing selected
              if(selObj==undefined){
                //set the cursor
                setUiCursorSingleClick();
                //reset the textarea's cursor position value
                cursorPos=undefined;
                //update the textarea's cursor position
                setTextareaCaret();
              }else{
                //there is selected text (from double click)...

                //align textarea with the UI selection
                selRange=undefined; setTextareaSelected();
              }
            //==DROP THE DRAGGED TEXT SELECTION==
            }else if(wrap.hasClass('drag-sel')){
              //if NOT trying to drop on selected text
              if(!elem.hasClass('sel')){
                //prevent bubble and set focus
                stopBubbleUp(e); focusOn(e,elem);
                //stop drag because the mouse was released
                dragStop(e); dragSelStop(e);
                //drop the selection at the new position
                cursorPos=undefined; dropAtCursor(e);
              }else{
                //dropping OR clicking on selected text...

                //deselect text
                deselect();
                //prevent bubble and set focus
                stopBubbleUp(e); focusOn(e,elem);
                //stop drag because the mouse was released
                dragStop(e); dragSelStop(e);
                //set the cursor
                setUiCursorSingleClick();
                //reset the textarea's cursor position value
                cursorPos=undefined;
                //update the textarea's cursor position
                setTextareaCaret();
              }
            //one or more letters are selected...
            }else{
              //==FINISH DRAGGING TO SELECT TEXT==
              //update selected letters class (if any selected)
              setUiSelected(e);
              //prevent bubble and set focus
              stopBubbleUp(e); focusOn(e,elem);
              //stop drag because the mouse was released
              dragStop(e); dragSelStop(e);
              //align textarea with the UI selection
              selRange=undefined; setTextareaSelected();
            }
          };
          //function to add the eents to characters
          var evsChars=function(lineChars){
            //filter out line characters that ALREADY have these events
            lineChars=lineChars.not('.evs'); lineChars.addClass('evs');
            //attach line character events
            lineChars.mousedown(function(e){
              stopBubbleUp(e);
              //if this letter is NOT already selected
              if(!jQuery(this).hasClass('sel')){
                //select
                deselect();
              }else{
                //maybe drag moving selected letters...
                dragSelStart(e);
              }
              dragStart(e);
            });
            lineChars.hover(function(e){
              stopBubbleUp(e);
              jQuery(this).parent().removeClass('over');
              jQuery(this).addClass('over');
              //if dragging selected text OVER selected text
              var isDragSel=false;
              if(jQuery(this).hasClass('sel')){
                if(wrap.hasClass('drag-sel')){
                  isDragSel=true;
                }
              }
              if(isDragSel){
                //dragging selected text OVER selected text
                wrap.addClass('drop-on-sel');
              }else{
                //NOT dragging selected text over selected text
                wrap.removeClass('drop-on-sel');
              }
            },function(e){
              stopBubbleUp(e);
              jQuery(this).parent().removeClass('over');
              jQuery(this).removeClass('over');
            });
            lineChars.mouseup(function(e){
              var lineChar=jQuery(this);
              editorMouseRelease(e,lineChar,function(){
                //set the cursor adjacent to this letter
                setUiCurByChar(e,lineChar);
              });
            });
          };
          privObj['evsChars']=evsChars;
          //function to add the events to any element under the tr, that doesn't already have the events
          var evsTr=function(tr){
            //get elements that don't hav events
            var numTd=tr.children('td:first').not('.evs'); numTd.addClass('evs');
            var lineTd=tr.children('td:last').not('.evs'); lineTd.addClass('evs');
            //add the new row's events
            var dbl_click_timeout;
            numTd.mouseup(function(e){
              var td=jQuery(this);
              editorMouseRelease(e,td,function(){
                var codeTd=td.parent().children('td.code:last');
                //if NOT double click
                if(!td.hasClass('click')){
                  //watch for double click for a short time
                  td.addClass('click');
                  clearTimeout(dbl_click_timeout);
                  dbl_click_timeout=setTimeout(function(){
                    td.removeClass('click');
                  },225);
                  //set the cursor at the start of the code line
                  setUiCurAtLineStart(codeTd);
                }else{
                  //this is a double click...
                  clearTimeout(dbl_click_timeout);
                  td.removeClass('click');
                  //select the entire code line
                  selectUiCodeLine(codeTd);
                }
              });
            });
            numTd.on('mousemove touchmove',function(e){
              stopBubbleUp(e); preventDefault(e);
            });
            lineTd.mouseup(function(e){
              var td=jQuery(this);
              editorMouseRelease(e,td,function(){
                //set the cursor at the end of the code line
                setUiCurAtLineEnd(td);
              });
            });
            lineTd.mousedown(function(e){
              dragStart(e);
            });
            lineTd.hover(function(e){
              jQuery(this).addClass('over');
            },function(e){
              jQuery(this).removeClass('over');
            });
            //character events
            evsChars(tr.children('td:last').children());
          };
          privObj['evsTr']=evsTr;
          //function that deletes selected ui characters in order to align with the deleted textarea characters
          var deleteSelectedUiChars=function(cr){
            var delCount=0;
            //if the selected state changed in the textarea
            if(taState['changed']['has_selected']['flag']){
              //if there is no longer anything selected in the textarea
              if(!taState['has_selected']){
                //need to align ui with the textarea by removing selected ui chars...

                //get the selected ui characters, if any
                var selChars=uibody.find('tr td.code > .sel');
                delCount=selChars.length;
                if(delCount>0){
                  //set the cursor before the first selected character
                  selChars.eq(0).before(cr);
                  //if there are any newline characters selected
                  var nlChars=selChars.filter('nl');
                  if(nlChars.length>0){
                    //==MARK TR ELEMENTS, EITHER FOR REMOVAL, OR FOR MERGE==
                    var selTrs=getSelDelMergeTrs(selChars);
                    //==DELETE THE ROWS THAT ARE FULLY SELECTED==
                    selTrs.filter('.remove').remove(); selTrs=selTrs.not('.remove');
                    //==DELETE THE SELECTED CHARACTERS IN THE MERGE ROWS==
                    selTrs.children('td.code').children('.sel').remove();
                    //==MERGE THE ROWS THAT NEED MERGING==
                    var firstMergeRow=selTrs.eq(0);
                    mergeAdjacentTrRows(firstMergeRow);
                    //==MAKE SURE THE NEWLINE CHARACTERS ARE NOT DOUBLED UP AND NL-SEL ARE CLASSES CORRECT==
                    cleanNlChars(nlChars);
                    //==UPDATE THE LINE NUMBERS==
                    //updateRowIndex is the first line number row that needs to be updated
                    updateLineNumbers(firstMergeRow);
                  }else{
                    //no newline characters selected... delete the selected characters
                    selChars.remove();
                  }
                }
              }
            }
            return delCount;
          };
          //function: remove ONLY ONE character (either right or left of the cursor)
          var removeOneUiChar=function(cr){
            //==ONLY ONE CHARACTER WAS REMOVED==
            var newStart=ta[0].selectionStart;
            //if cursor moved left (decreased - )
            if(taState['changed']['start']['detail']=='-'){
              //if the cursor is NOT already at the front of the line
              var leftChar=cr.prev();
              if(leftChar.length>0){
                //delete the left character in the UI
                leftChar.remove();
              }else{
                //cursor is already at the front of the line... merge with previous line
                var thisTr=cr.parent().parent(); var prevTr=thisTr.prev();
                //if there is a previous line
                if(prevTr.length>0){
                  mergeAdjacentTrRows(prevTr,thisTr); updateLineNumbers(prevTr);
                }
              }
            }else{
              //cursor didn't move index position... probably deleted character to the right

              //if the cursor is NOT already at the end of the line (if NOT left of end newline character)
              var rightChar=cr.next();
              if(!isTag(rightChar,'nl')){
                //delete the right character in the UI
                rightChar.remove();
              }else{
                //cursor is already at the end of the line... merge with next line
                var thisTr=cr.parent().parent(); var nextTr=thisTr.next();
                //if there is a next line
                if(nextTr.length>0){
                  mergeAdjacentTrRows(thisTr,nextTr); updateLineNumbers(thisTr);
                }
              }
            }
          };
          //function: remove MORE THAN ONE character
          var removeUiChars=function(cr){
            //***
          };
        //==ATTACH EVENTS==
          //mouse up event
          jQuery('body:first').mouseup(function(e){
            dragStop(e);
            dragSelStop(e);
            deselect();
          });
          jQuery('body:first').mouseleave(function(e){
            dragStop(e);
            dragSelStop(e);
          });
          jQuery('body:first').mousemove(function(e){
            if(wrap.hasClass('drag')){
              //if dragging selected text
              if(wrap.hasClass('drag-sel')){
                followMouseDrag(e);
              }else{
                //NOT dragging selected text
                setUiSelected(e);
              }
            }
          });
          wrap.mousedown(function(e){
            dragStart(e);
            deselect();
          });
          wrap.mouseup(function(e){
            editorMouseRelease(e,wrap,function(){
              //set the cursor at the end of the document
              setUiCurAtEnd();
            });
          });
          //src text gains focus by itself (tab entry?)
          ta.focus(function(e){
            stopBubbleUp(e);
            focusOn(e,jQuery(this));
          });
          //src text loses focus
          ta.blur(function(e){
            stopBubbleUp(e);
            focusOff(e,jQuery(this));
            //if cursor is not over any td.code or character element
            if(uibody.find('.over:first').length<1){
              //deselect any ui text (if any is selected)
              deselect();
            }
          });
          //handle routing to the correct key action handler
          var taKeyed=function(e,eType){
            //set the new textarea state (if changed)
            trackTaStateChanges(e,eType);
            //if anything changed in the textarea
            if(taState['changed']['anything']){
              console.log('EVENT: '+eType);
              //get the ui cursor
              var cr=getCur();
              //if the text value changed
              if(taState['changed']['val']['flag']){
                //get the number of characters removed or added
                var charDiff=taState['changed']['val']['difference'];
                //delete the removed selected characters, if any
                var numSelDel=deleteSelectedUiChars(cr);
                //depending on how the value was changed
                switch(taState['changed']['val']['detail']){
                  case '+': //new text written (excluding deleted selected characters)
                    console.log(charDiff+' chars ADDED');
                    //***
                    break;
                  case '-': //existing text deleted
                    console.log(charDiff+' chars REMOVED');
                    //subtract the selected characters that were already deleted
                    charDiff-=numSelDel;
                    console.log(charDiff+' more chars to REMOVE');
                    //if there are any characters left to delete
                    if(charDiff>0){
                      //if only one character removed
                      if(charDiff==1){
                        //remove one character either right or left of the ui cursor
                        removeOneUiChar(cr);
                      }else{
                        //remove all of the characters that were deleted, probably with a special key combo, eg: alt+delete
                        removeUiChars(cr);
                      }
                    }
                    break;
                }
              }else{
                //text VALUE did NOT change...

                //if the cursor position changed
                if(taState['changed']['start']['flag']){
                  //get the number of character spaces moved
                  var moveDiff=taState['changed']['start']['difference'];
                  //depending on how the value was changed
                  switch(taState['changed']['start']['detail']){
                    case '+': //cursor moved right
                      console.log(moveDiff+' moved RIGHT');
                      //***
                      break;
                    case '-': //cursor moved left
                      console.log(moveDiff+' moved LEFT');
                      //***
                      break;
                  }
                }
                //if the selection range changed
                if(taState['changed']['count_selected']['flag']){
                  //if there are any selected characters
                  if(taState['has_selected']){
                    //align the ui with selected characters in the textarea
                    //***
                  }else{
                    //no more selected characters...
                    deselect();
                  }
                }
              }
            }
          };
          //keydown textarea
          ta.keydown(function(e){
            stopBubbleUp(e);
            taKeyed(e,'down');
          });
          //keyup textarea
          ta.keyup(function(e){
            stopBubbleUp(e);
            taKeyed(e,'keyup');
          });
          //keypress textarea
          ta.keypress(function(e){
            stopBubbleUp(e);
            taKeyed(e,'keypress');
          });
          //change textarea
          ta.change(function(e){
            stopBubbleUp(e);
            taKeyed(e,'change');
          });
          //paste textarea
          ta.on('paste',function(e){
            stopBubbleUp(e);
            taKeyed(e,'paste');
          });
        //==FUNCTIONS TO DISPLAY UI TEXT==
          //convert a string text to something that can be dislayed in the ui
          var toUiStr=function(str){
            var ret='';
            if(str==undefined){str='';}
            if(str.length>0){
              //for each character
              for(var c=0;c<str.length;c++){
                var char=str[c];
                switch(char){
                  case ' ':
                    ret+='<sp>&nbsp;</sp>';
                    break;
                  case '\t':
                    ret+='<t>&nbsp;</t>';
                    break;
                  case '<':
                    ret+='<l>&lt;</l>';
                    break;
                  case '>':
                    ret+='<l>&gt;</l>';
                    break;
                  default:
                    ret+='<l>'+char+'</l>';
                    break;
                }
              }
            }
            return ret;
          };
          //return UI row html from raw rowTxtl
          var appendUiRow=function(rowNum,rowTxt,afterTr){
            var newRow;
            if(rowTxt==undefined){rowTxt='';}
            //no specified existing tr to append after
            var rowHtml='<tr><td class="num">'+rowNum+'</td><td class="code">'+toUiStr(rowTxt)+'<nl>&nbsp;</nl></td></tr>';
            if(afterTr==undefined){
              //add the basic row html to the ui table body
              uibody.append(rowHtml);
              //get this latest row
              newRow=uibody.children('tr:last');
              //add the events to this tr row
              evsTr(newRow);
            }else{
              //append new tr row after the given afterTr...

              if(afterTr.length>0){
                if(isTag(afterTr,'tr')){
                  //add the row after the given <tr>
                  afterTr.after(rowHtml);
                  newRow=afterTr.next('tr:first');
                  //add the events to this tr row
                  evsTr(newRow);
                }
              }
            }
            //==TEXT HIGHLIGHTER== ?
            //***
            return newRow;
          };
          privObj['appendUiRow']=appendUiRow;
          //display the textarea contents, in ui table rows
          var textToUi=function(maxRows){
            //set a default max number of rows, if none given
            if(maxRows==undefined||maxRows<1){maxRows=1000;}
            //get the text value
            var txt=ta.val();
            //clear the contents, if any, of the UI
            uibody.html('');
            //while max rows NOT reached AND endof text NOT reached
            var rowIndex=0; var currentRow;
            while(rowIndex<maxRows&&txt.length>0){
              var rowTxt='';
              //if there is another new line character in txt
              var indexOfNewLine=txt.indexOf('\n');
              if(indexOfNewLine!=-1){
                //get the text before this next new line character
                rowTxt=txt.substring(0,indexOfNewLine);
                //remove this row from the txt
                txt=txt.substring(rowTxt.length+1);
              }else{
                //no more new line characters... just get the remaining text
                rowTxt=txt; txt='';
              }
              //add this row to the ui
              currentRow=appendUiRow(rowIndex+1,rowTxt,currentRow);
              //next row index
              rowIndex++;
            }
          };
        //==DO STUFF ON PAGE LOAD==
          //load the textarea contents into the UI
          textToUi();
        }
      }
    }
    return obj;
  }
};
