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
        //==EVENT HANDLERS==
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
          //deselect any selected ui letters
          var deselect=function(){
            //remove selection from ui elements
            if(uibody.find('tr td.code .sel').removeClass('sel').length>0){
              //remove nl-sel from tr
              uibody.children('tr.nl-sel').removeClass('nl-sel');
              //remove selection from hidden textarea
              ta[0].selectionStart=ta[0].selectionEnd=-1;
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
                    //==MARK TR ELEMENTS FOR REMOVAL OR FOR MERGE WITH NEXT TR==
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
                    //==MERGE TR ELEMENTS THAT LOST THEIR NEWLINE CHARACTER
                    //for each tr that no longer ends with a newline, nl, character (needs merge)
                    selTrs.filter('.merge').each(function(){
                      //if there is a next row that needs to merge into this row
                      var intoTr=jQuery(this); intoTr.removeClass('merge');
                      var intoCodeTd=intoTr.children('td.code:last');
                      var fromTr=intoTr.next();
                      if(fromTr.length>0){
                        //merge the letters
                        var fromCodeTd=fromTr.children('td.code:last');
                        intoCodeTd.children(':last').after(fromCodeTd.children());
                        //remove fromTr
                        fromTr.remove();
                      }else{
                        //no next row to be merged into this merge row...

                        //just restore a nl character at the end of the intoTr code line
                        intoCodeTd.append('<nl>&nbsp;</nl>');
                        privObj.evsChars(intoCodeTd.children('nl:last'));
                      }
                    });
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
                    nlChars.each(function(){
                      var nlChar=jQuery(this);
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
                    });
                    uibody.children('tr:last').removeClass('nl-sel');
                    //==UPDATE THE LINE NUMBERS==
                    //updateRowIndex is the first line number row that needs to be updated
                    updateLineNumbers(updateRowIndex);
                  }else{
                    //selected text is all on the SAME code line (no newline characters selected)...

                    //move the selected characters before the cursor element
                    cr.before(selChars); cr.remove();
                  }
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
                    uibody.children('tr:last').removeClass('nl-sel').find('td.code > nl.sel:last').removeClass('sel');
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
              }
            }
          };
          //function to duplicate UI selection into the hidden textarea's selection
          var setTextareaSelected=function(){
            //get the start and end positions of the selection range
            var range=getSelRange();
            if(range!=undefined){
              //set the textarea selection range
              if(range.start!=ta[0].selectionStart){
                ta[0].selectionStart=range.start;
              }
              if(range.end!=ta[0].selectionEnd){
                ta[0].selectionEnd=range.end;
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
            numTd.mouseup(function(e){
              var td=jQuery(this);
              editorMouseRelease(e,td,function(){
                //set the cursor at the end of the code line
                setUiCurAtLineStart(td.parent().children('td.code:last')); //*** select line instead?
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
          //keydown textarea
          ta.keydown(function(e){
            stopBubbleUp(e);
            switch(e.keyCode){
              case 8: //back-space
                break;
              case 46: //delete key
                break;
              case 13: //enter key
                break;
              case 16: //shift key
                break;
              case 27: //escape key
                break;
              case 9: //tab key
                break;
              case 37: //left arrow
                break;
              case 38: //up arrow
                break;
              case 39: //right arrow
                break;
              case 40: //down arrow
                break;
            }
          });
        //==FUNCTIONS TO DISPLAY UI TEXT==
          //convert a string text to something that can be dislayed in the ui
          var toUiStr=function(str){
            if(str==undefined){str='';}
            if(str.length>0){
              //for each character
              var ret='';
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
