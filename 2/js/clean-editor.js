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
          };
          //when the mouse down happens on a letter, or should happen
          var dragStart=function(e){
            if(!wrap.hasClass('select')){
              //allow select to be detected
              wrap.addClass('select');
            }
          };
          //when the mouse is released, or should happen
          var dragStop=function(e){
            if(wrap.hasClass('select')){
              //stop allowing select to be detected
              wrap.removeClass('select');
            }
          };
          //highlight letters that are selected
          var selectOn=function(){
            var selObj=document.getSelection();
            if(selObj!=undefined){
              if(selObj.hasOwnProperty('type')){
                if(selObj.type.toLowerCase()=='range'){
                  //get the starting and end of the selection
                  var startElem=jQuery(selObj.anchorNode.parentNode);
                  var endElem=jQuery(selObj.focusNode.parentNode);
                  //decide what direction the selectino was dragged
                  var direction='';
                  //get parent tr elements
                  var startTr=startElem.parents('tr:first');
                  var endTr=endElem.parents('tr:first');
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
                  }else{
                    //start row is after the end row
                    direction='left';
                  }
                  //***
                  console.log(direction);
                }
              }
            }
          };
        //==ATTACH EVENTS==
          //mouse up event
          jQuery('body:first').mouseup(function(e){
            if(wrap.hasClass('select')){
              dragStop(e);
              selectOn();
            }
          });
          jQuery('body:first').mouseleave(function(e){
            dragStop(e);
          });
          /*if(jQuery(document).selectionchange){
            jQuery(document).selectionchange(function(){
              if(wrap.hasClass('select')){

              }
            });
          }else{

          }*/
          //src text gains focus by itself (tab entry?)
          ta.focus(function(e){
            stopBubbleUp(e);
            focusOn(e,jQuery(this));
          });
          //src text loses focus
          ta.blur(function(e){
            stopBubbleUp(e);
            focusOff(e,jQuery(this));
          });
          //click outer wrap
          wrap.click(function(e){
            stopBubbleUp(e);
            focusOn(e,jQuery(this));
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
            uibody.append('<tr><td>'+rowNum+'</td><td>'+toUiStr(rowTxt)+'</td></tr>');
            //get this latest row
            var newRow=uibody.children('tr:last');
            var numTd=newRow.children('td:first'); var lineTd=newRow.children('td:last');
            var lineChars=lineTd.children();
            //add the new row's events
            numTd.click(function(e){
              stopBubbleUp(e); focusOn(e,jQuery(this));
              //***
            });
            lineTd.click(function(e){
              stopBubbleUp(e); focusOn(e,jQuery(this));
              //***
            });
            lineChars.click(function(e){
              stopBubbleUp(e); focusOn(e,jQuery(this));
              //***
            });
            lineTd.mousedown(function(e){
              dragStart(e);
            });
            /*lineChars.mousemove(function(e){
              if(jQuery(this).is(':selected')){
                stopBubbleUp(e); focusOn(e,jQuery(this));
                selectOn(e,jQuery(this));
              }
            });*/
          };
          //display the textarea contents, in ui table rows
          var textToUi=function(maxRows){
            //set a default max number of rows, if none given
            if(maxRows==undefined||maxRows<1){maxRows=333;}
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
