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
          obj={};
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
                uibody.find('tr td.code:last').append('<c></c>');
                cursorElem=uibody.find('tr td.code > c:last');
              }
            }
            return cursorElem;
          };
          //when the editor is double clicked
          var dblClick=function(e,elem){

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
          //drop the drag-selected text onto the current cursor position
          var follow_drag_timeout;
          var dropAtCursor=function(){
            clearTimeout(follow_drag_timeout);
            var cr=getCur();
            //***
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
                  else{adjElem=elem.next();}
                  //if there is an adjacent element
                  if(adjElem.length>0){
                    //is the adjacent element the cursor?
                    if(!adjElem[0].hasOwnProperty('tagName')||adjElem[0].tagName.toLowerCase()!='c'){
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
                      //move the cursor AFTER the element
                      elem.after(cr);
                    }
                  }
                };
                //depending on the type of hovered element
                var tagName=overElem[0].tagName.toLowerCase();
                switch(tagName){
                  case 'td': //hovered over the code line but NOT over any letter IN the code line
                    //if the cursor is not already at the end of this code line
                    var lastCharInTd=overElem.children(':last');
                    //if there are any chars in the code line
                    if(lastCharInTd.length>0){
                      //if the last code line element is NOT the cursor
                      if(!lastCharInTd[0].hasOwnProperty('tagName')||lastCharInTd[0].tagName.toLowerCase()!='c'){
                        //put the cursor at the end of the code line
                        overElem.append(cr);
                      }
                    }else{
                      //no chars in the code line... put the cursor at the end of the code line
                      overElem.append(cr);
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
          var setUiSelected=function(){
            var retObj;
            var selObj=document.getSelection();
            if(selObj!=undefined){
              if(selObj.hasOwnProperty('type')){
                if(selObj.type.toLowerCase()=='range'){
                  retObj={};
                  //remove the cursor while selecting
                  if(cursorElem!=undefined&&cursorElem.length>0){
                    cursorElem.remove();
                  }
                  //get the starting and end of the selection
                  var startElem=jQuery(selObj.anchorNode.parentNode);
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
                    uibody.find('.sel').not('.new-sel').removeClass('sel');
                    //set new selection (and remove new-sel)
                    uibody.find('.new-sel').removeClass('new-sel').not('.sel').addClass('sel');
                  };
                  //depending on the direction
                  switch(direction){
                    case 'none': //no direction; only one character selected
                      //deselect all that are NOT selected
                      uibody.find('.sel').not(startElem).removeClass('sel');
                      //select the single character
                      startElem.addClass('sel');
                      //should put the cursor to the left of the selected character
                      retObj['cur_pos']='left';
                      break;
                    case 'right': //cursor drag to the right
                      whileNext(startElem,'right');
                      //if MORE than one row was selected
                      if(rowSpan>1){
                        //if more than two rows were selected
                        if(rowSpan>2){
                          //select each full row BETWEEN the first and last row
                          whileNextFullRow(startTr,'right');
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
                          whileNextFullRow(startTr,'left');
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
                }
              }
            }
            return retObj;
          };
          //function to move the UI cursor either left or right of a character element
          var setUiCurByChar=function(e,elem){
            var didSet=false;
            //if nothing is selected (the cursor is already set when text is selected)
            if(uibody.find('tr td.code > .sel:first').length<1){
              didSet=true;
              //get the cursor
              var cr=getCur();
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
            }
            return didSet;
          };
          //set the ui cursor at the end of a td.code line
          var setUiCurAtLineEnd=function(lineTd){
            var didSet=false;
            //if nothing is selected (the cursor is already set when text is selected)
            if(uibody.find('tr td.code > .sel:first').length<1){
              didSet=true;
              //get the cursor
              var cr=getCur();
              //put the cursor at the end of the given line
              lineTd.append(cr);
            }
            return didSet;
          };
          //set the ui cursor at the start of a td.code line
          var setUiCurAtLineStart=function(lineTd){
            var didSet=false;
            //if nothing is selected (the cursor is already set when text is selected)
            if(uibody.find('tr td.code > .sel:first').length<1){
              didSet=true;
              //get the cursor
              var cr=getCur();
              //put the cursor at the end of the given line
              lineTd.prepend(cr);
            }
            return didSet;
          };
          //set the cursor at the start of the document
          var setUiCurAtStart=function(){
            var didSet=false;
            //if nothing is selected (the cursor is already set when text is selected)
            if(uibody.find('tr td.code > .sel:first').length<1){
              didSet=true;
              //get the cursor
              var cr=getCur();
              //get the first code line
              var firstLineTd=uibody.find('tr td.code:first');
              firstLineTd.prepend(cr);
            }
            return didSet;
          };
          //set the cursor inside the textarea, aligned with the UI cursor
          var setTextareaCaret=function(){
            //if no UI text is selected
            if(uibody.find('tr td.code > .sel:first').length<1){
              //add temporary classes to help count number of characters appearing BEFORE the cursor
              var uiCur=getCur(); uiCur.addClass('cur');
              var curTd=uiCur.parent(); curTd.addClass('cur');
              //==COUNT THE NUMBER OF CHARACTERS THAT APPEAR BEFORE THE UI CURSOR==
              var caretPos=0;
              //for each td.code element, BEFORE the one that contains the cursor
              uibody.find('tr td.code').each(function(){
                //if this code line contains the cursor
                if(jQuery(this).hasClass('cur')){
                  //count all of the characters, UP TO the cursor
                  jQuery(this).children().each(function(){
                    //if this is the cursor
                    if(jQuery(this).hasClass('cur')){
                      //end counting characters in this line
                      return false;
                    }else{
                      //count this character that appears BEFORE the cursor in this line
                      caretPos++;
                    }
                  });
                  //end counting code lines
                  return false;
                }else{
                  //cursor is NOT in this code line... so add all of the characters in this line to the count
                  caretPos+=jQuery(this).children().length+1; //+1 for the newline character
                }
              });
              //==SET THE CURSOR POSITION IN THE HIDDEN TEXTAREA==
              //if the cursor is NOT already at the correct position
              if(ta[0].selectionStart!=caretPos){
                //set the new caret position in the textarea
                ta[0].setSelectionRange(caretPos, caretPos);
              }
              uiCur.removeClass('cur'); curTd.removeClass('cur');
            }
          };
          //function to duplicate UI selection into the hidden textarea's selection
          var setTextareaSelected=function(){
            //==COUNT THE SELECT START AND END INDEXES==
            var selectionStart=0;var selectionEnd=0; var foundFirstSel=false;
            //get all rows and all characters
            var allRows=uibody.children('tr');
            var allChars=allRows.children('td.code').children().not('c');
            //count the number of characters BEFORE the first selected
            allChars.each(function(c){
              //if this character is selected
              if(jQuery(this).hasClass('sel')){
                //mark the first selected row
                jQuery(this).parents('tr:first').addClass('start-sel');
                foundFirstSel=true;
                //end the counting
                return false;
              }else{
                selectionStart++;
                //if this is the last character in this row
                if(jQuery(this).next().length<1){
                  //count the extra newline character
                  selectionStart++;
                }
              }
            });
            if(foundFirstSel){
              //get the select end index
              selectionEnd=selectionStart+allChars.filter('.sel').length;
              //count the number of newline characters INSIDE the selection
              var lastSelChar=allChars.filter('.sel:last');
              var lastSelRow=lastSelChar.parents('tr:first');
              while(!lastSelRow.hasClass('start-sel')){
                //one more new line character
                selectionEnd++;
                lastSelRow=lastSelRow.prev();
              }
              lastSelRow.removeClass('start-sel');
              //==SET THE SELECTION START AND END INDEXES IN THE TEXTAREA
              //set the textarea selection range
              ta[0].selectionStart=selectionStart;
              ta[0].selectionEnd=selectionEnd;
            }
          };
          //handle when the selecting of letters stops
          var selectStop=function(){
            //set the selection class on UI characters (that are in the selection range)
            var selObj=setUiSelected();
            //if selection info is found
            if(selObj!=undefined){
              var cr=getCur();
              //put the cursor somewhere around the selection
              if(selObj.cur_pos=='left'){
                selObj.endElem.before(cr);
              }else{
                selObj.endElem.after(cr);
              }
            }
            //align textarea with the UI selection
            setTextareaSelected();
          };
          //deselect any selected ui letters
          var deselect=function(){
            //remove selection from ui elements
            if(uibody.find('tr td.code .sel').removeClass('sel').length>0){
              //remove selection from hidden textarea
              ta[0].selectionStart=ta[0].selectionEnd=-1;
            }
          };
        //==ATTACH EVENTS==
          //mouse up event
          jQuery('body:first').mouseup(function(e){
            //if dragging cursor
            if(wrap.hasClass('drag')){
              //stop dragging
              dragStop(e);
              //if dragging selected text, NOT selecting new text
              if(wrap.hasClass('drag-sel')){
                dropAtCursor();
                dragSelStop(e);
              }else{
                //NOT dragging selected text... stop selecting text
                selectStop();
              }
            }else{
              //NOT dragging at all... deselect text if any is selected
              deselect();
            }
          });
          jQuery('body:first').mouseleave(function(e){
            dragStop(e);
            dragSelStop(e);
          });
          wrap.mousemove(function(e){
            if(wrap.hasClass('drag')){
              //if dragging selected text
              if(wrap.hasClass('drag-sel')){
                followMouseDrag(e);
              }else{
                //NOT dragging selected text
                setUiSelected();
              }
            }
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
          //click outer wrap
          wrap.click(function(e){
            stopBubbleUp(e);
            focusOn(e,jQuery(this));
            //if NOT dragging
            if(!wrap.hasClass('drag')){
              //set the cursor at the start of the document
              if(setUiCurAtStart()){
                //update the cursor position
                setTextareaCaret();
              }
            }
            //***
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
            return ret;
          };
          //return UI row html from raw rowTxtl
          var appendUiRow=function(rowNum,rowTxt){
            //add the basic row html to the ui table body
            uibody.append('<tr><td class="num">'+rowNum+'</td><td class="code">'+toUiStr(rowTxt)+'</td></tr>');
            //get this latest row
            var newRow=uibody.children('tr:last');
            var numTd=newRow.children('td:first'); var lineTd=newRow.children('td:last');
            var lineChars=lineTd.children();
            //add the new row's events
            numTd.click(function(e){
              stopBubbleUp(e); focusOn(e,jQuery(this));
              //if NOT dragging
              if(!wrap.hasClass('drag')){
                //set the cursor at the end of this line
                if(setUiCurAtLineStart(jQuery(this).next('td.code:first'))){
                  //update the cursor position
                  setTextareaCaret();
                }
              }
              //***
            });
            numTd.select(function(e){
              stopBubbleUp(e); preventDefault(e);
            });
            numTd.on('mousemove touchmove',function(e){
              stopBubbleUp(e); preventDefault(e);
            });
            lineTd.click(function(e){
              stopBubbleUp(e); focusOn(e,jQuery(this));
              //if NOT dragging
              if(!wrap.hasClass('drag')){
                //set the cursor at the end of this line
                if(setUiCurAtLineEnd(jQuery(this))){
                  //update the cursor position
                  setTextareaCaret();
                }
              }
              //***
            });
            lineTd.mousedown(function(e){
              deselect();
              dragStart(e);
            });
            lineTd.hover(function(e){
              jQuery(this).addClass('over');
            },function(e){
              jQuery(this).removeClass('over');
            });
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
            },function(e){
              stopBubbleUp(e);
              jQuery(this).parent().removeClass('over');
              jQuery(this).removeClass('over');
            });
            lineChars.click(function(e){
              stopBubbleUp(e); focusOn(e,jQuery(this));
              //if NOT dragging
              if(!wrap.hasClass('drag')){
                //move the cursor next to this character element
                if(setUiCurByChar(e,jQuery(this))){
                  //update the cursor position
                  setTextareaCaret();
                }
              }
              //***
            });
            //==TEXT HIGHLIGHTER==
            //***
          };
          //display the textarea contents, in ui table rows
          var textToUi=function(maxRows){
            //set a default max number of rows, if none given
            if(maxRows==undefined||maxRows<1){maxRows=1000;}
            //get the text value
            var txt=ta.val();
            //clear the contents, if any, of the UI
            uibody.html('');
            //while max rows NOT reached AND endof text NOT reached
            var rowIndex=0;
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
              appendUiRow(rowIndex+1,rowTxt);
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
