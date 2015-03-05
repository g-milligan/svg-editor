var cleanEditor={
  load:function(s){
    if(s!=undefined){
      //get the text area that will serve as the src code area
      var ta=jQuery(s).filter('textarea');
      if(ta.length>0){
        //only get the first instance
        ta=ta.eq(0);
        //if the editor is NOT already initialized
        if(!ta.hasClass('clean-editor-src')){
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
          ui.append('<table class="ui-table"><tbody><tr><td>1</td><td></td></tr></tbody></table>');
          var uitable=ui.children('table:first');
          var uibody=uitable.children('tbody:first');
          //==REUSABLE FUNCTIONS==


          //==EVENT HANDLERS==
          //when the editor is double clicked
          var doubleClick=function(){

          };
          //when the editor receives focus or SHOULD receive focus
          var focusOn=function(){
            //if already has focus
            if(wrap.hasClass('focus')){
              //***
            }else{
              //doesn't already have focus...

              //***
            }
          };
          //when the editor loses focus or SHOULD lose focus
          var focusOff=function(){
            //if already has focus
            if(wrap.hasClass('focus')){
              //***
            }else{
              //doesn't already have focus...

              //***
            }
          };
          //==ATTACH EVENTS==
          //***
        }
      }
    }
  }
};
