jQuery(document).ready(function(){
	jQuery(window).ready(function(){
		updateCode();
	});
});
function srcToDesign(src){
	src=replaceAll(src,'&lt;','<');
	src=replaceAll(src,'&gt;','>');
	return src;
}
function designToSrc(design){
	design=replaceAll(design,'<','&lt;');
	design=replaceAll(design,'>','&gt;');
	//find out if a string is an open tag or close tag
	var getTagInfo=function(tagStr){
		var open_close='open'; var name='';
		//remove starting <
		tagStr=tagStr.substring('&lt;'.length);
		tagStr=tagStr.trim();
		//parse out tag name
		var getTagName=function(str){
			var spaceIndex=str.indexOf(' ');
			//if there is a space
			if(spaceIndex!=-1){
				//end the name before the next space
				str=str.substring(0,spaceIndex);
			}else{
				//if there is a >
				var endIndex=str.indexOf('&gt;');
				if(endIndex!=-1){
					//end the name before the next >
					str=str.substring(0,endIndex);
				}
			}
			return str;
		};
		//if close tag
		if(tagStr.indexOf('/')==0){
			open_close='close';
			//remove starting /
			tagStr=tagStr.substring(1);
			//get the tag name
			tagStr=tagStr.trim();
			name=getTagName(tagStr);
		}
		//parse out the name of the tag
		name=getTagName(tagStr);
		//put the return json together
		var info={'open_close':open_close,'name':name};
		return info;
	};
	//add markup to escaped html
	var matchedHtmlTags=design.match(/&lt;\/?\w+((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[^'"&gt;\s]+))?)+\s*|\s*)\/?&gt;/gi);
	//if any HTML tag markup was matched
	if(matchedHtmlTags!=undefined){
		//for each matched starting and end tag
		var newMatchedHtmlTags=[];
		for(var t=0;t<matchedHtmlTags.length;t++){
			//depending on tag type, add different markup around it
			var matchedTagStr=matchedHtmlTags[t];
			var info=getTagInfo(matchedTagStr);
			//depending on open/close...
			var startGroup=''; var endGroup='';
			if(info.open_close=='open'){
				var firstXClass='';
				if(t==0){firstXClass=' class="first"';}
				startGroup='<x'+firstXClass+'><input type="text" /></x><g class="closed" n="'+info.name.toLowerCase()+'"><oc></oc>';
			}
			else{endGroup='</g>';}
			//replace tag with temporary placeholder, surronded by <e> element markup
			design=design.replace(matchedTagStr,startGroup+'<e n="'+info.name.toLowerCase()+'" class="'+info.open_close+'"><<'+t+'>></e>'+endGroup);
			//insert the <n> markup around the tag name
			matchedTagStr=matchedTagStr.replace(info.name,'<n><txt>'+info.name+'</txt></n>');
			//if this is an open tag
			if(info.open_close=='open'){
				//select all of the key='val' OR key="val" attributes in this open tag
				var matchedAttrs=matchedTagStr.match(/\S+=[\"|']([^"]*)[\"|']/gi);
				//if there are any attributes in this open tag
				if(matchedAttrs!=undefined&&matchedAttrs.length>0){
					//for each matched attribute
					var newMatchedAttrs=[];
					for(var a=0;a<matchedAttrs.length;a++){
						//if this is the first attribute
						var beforeFirstAttr='';
						if(a==0){beforeFirstAttr='<x class="first"><input type="text" /></x>';}
						//if this is the last attribute
						var lastXClass='';
						if(a+1==matchedAttrs.length){lastXClass=' class="last"';}
						//get the matched attribute string, prefixed by a space
						var matchedAttr=' '+matchedAttrs[a];
						//replace the attribute with a temporary placeholder
						matchedTagStr=matchedTagStr.replace(matchedAttr,beforeFirstAttr+'<kv>>>'+a+'<<</kv><x'+lastXClass+'><input type="text" /></x>');
						//surround the attribute key with markup
						matchedAttr='<k><space> </space><txt>'+matchedAttr.trim();
						matchedAttr=matchedAttr.replace('=','</txt></k>=');
						//surround the val with markup
						var valStr=matchedAttr.substring(matchedAttr.indexOf('=')+'='.length);
						//if the value starts with ' or ", then strip it off
						if(valStr.indexOf("'")==0){valStr=valStr.substring(1);}
						else if(valStr.indexOf('"')==0){valStr=valStr.substring(1);}
						//if the value ends with ' or ", then strip it off
						if(valStr.lastIndexOf("'")==valStr.length-1){valStr=valStr.substring(0,valStr.length-1);}
						else if(valStr.lastIndexOf('"')==valStr.length-1){valStr=valStr.substring(0,valStr.length-1);}
						valStr=valStr.trim();
						var strBeforeVal=matchedAttr.substring(0,matchedAttr.lastIndexOf(valStr));
						var strAfterVal=matchedAttr.substring(strBeforeVal.length+valStr.length);
						matchedAttr=strBeforeVal+'<v><txt>'+valStr+'</txt></v>'+strAfterVal;
						//add input elements that consume the focus
						matchedAttr=matchedAttr.replace('</k>','<input type="text" /></k>');
						matchedAttr=matchedAttr.replace('</v>','<input type="text" /></v>');
						//add the modified attribute string to the array
						newMatchedAttrs.push(matchedAttr);
					}
					//for each matched attribute
					for(var a=0;a<newMatchedAttrs.length;a++){
						//restore the attribute
						matchedTagStr=matchedTagStr.replace('>>'+a+'<<',newMatchedAttrs[a]);
					}
				}else{
					//no attributes in this open tag...
					//insert the <x> element after the tag name
					matchedTagStr=matchedTagStr.replace('</n>','</n><x class="first last"><input type="text" /></x>');
				}
			}
			//insert the focus input into the tag <n>ame element
			matchedTagStr=matchedTagStr.replace('</n>','<input type="text" /></n>')
			//push the possibly modified tag html into a new array
			newMatchedHtmlTags.push(matchedTagStr);
		}
		//for each temporary placeholder
		for(var t=0;t<newMatchedHtmlTags.length;t++){
			//add the real tag back in
			design=design.replace('<<'+t+'>>',newMatchedHtmlTags[t]);
		}
	}
	return design;
}
function updateDesign(){
	//get the source code elements
	var codeContent=jQuery('#code-content:last');
	var codeElem=codeContent.children('code:first');
	//design code element
	var designContent=jQuery('#design-content:first');
	var designCodeElem=designContent.children('code:first');
	//get the input source code
	var source=codeElem.text();
	source=srcToDesign(source);
	var currentDesignSrc=designCodeElem.html();
	//if the code isn't updated
	if(source!=currentDesignSrc){
		//update the design code
		designCodeElem.html(source);
	}
}
function updateCode(){
	//get the source code elements
	var codeContent=jQuery('#code-content:last');
	var codeElem=codeContent.children('code:first');
	//design code element
	var designContent=jQuery('#design-content:first');
	var designCodeElem=designContent.children('code:first');
	//get the input source code
	var source=codeElem.html();
	var currentDesignSrc=designCodeElem.html();
	currentDesignSrc=designToSrc(currentDesignSrc);
	//if the code isn't updated
	if(source!=currentDesignSrc){
		//==update code==
		codeElem.html(currentDesignSrc);
		//==ADD ADDITIONAL <x> ELEMENTS==
		var gElems=codeElem.find('g').not('.evs');
		gElems.addClass('evs');
		gElems.each(function(){
			//add the last <x> element after the last <g> and before the closing e.close
			var closeElem=jQuery(this).children('e.close:last');
			closeElem.before('<x class="last"><input type="text" /></x>');
			//add the first class to the first x element nested inside this group
			jQuery(this).children('x:first').addClass('first');
		});
		//if the code doesn't end with an <x> element
		var lastChild=codeElem.children().filter(':last');
		if(lastChild[0].tagName.toLowerCase()!='x'){
			//make sure the code element ends with a <x> element
			codeElem.append('<x class="last"><input type="text" /></x>');
		}
		//==OPEN/CLOSE ELEMENT EVENTS==
		var ocElems=codeElem.find('oc').not('.evs');
		ocElems.addClass('evs');
		ocElems.each(function(){
			var gElem=jQuery(this).parent();
			//if there are no child elements under this parent
			var childElems=gElem.children('g');
			if(childElems.length<1){
				//element is empty
				gElem.addClass('empty');
				gElem.removeClass('opened');
				gElem.removeClass('closed');
			}
			//open close button
			jQuery(this).click(function(){
				//if this <g> element is NOT empty
				if(!gElem.hasClass('empty')){
					//toggle opened/closed
					if(gElem.hasClass('closed')){
						gElem.addClass('opened');
						gElem.removeClass('closed');
					}else{
						gElem.addClass('closed');
						gElem.removeClass('opened');
					}
				}
			});
		});
		//==EDIT XML EVENTS==
		var clickEditElems=codeElem.find('input').not('.evs');
		clickEditElems.addClass('evs');
		var btnElems=clickEditElems.parent();
		//function to clear the current focus
		var clearFocus=function(keepFocusBtn){
			var anyChanges=false;
			//if there are any buttons with focus
			var clearBtns=codeElem.find('.focus');
			if(clearBtns.length>0){
				//if ignore a button that has focus...
				if(keepFocusBtn!=undefined&&keepFocusBtn.length>0){clearBtns=clearBtns.not(keepFocusBtn);}
				//if there are still buttons to clear focus from
				if(clearBtns.length>0){
					//for each button to clear
					clearBtns.each(function(){
						//if this button has the focus class still
						var btn=jQuery(this);
						if(btn.hasClass('focus')){
							//remove the focus and over classes
							btn.removeClass('focus');
							btn.removeClass('over');
							//get <txt>
							var txtElem=btn.children('txt:first');
							//get new text
							var newTxt=txtElem.text(); newTxt=newTxt.trim();
							newTxt=replaceAll(newTxt,'&nbsp;',' ');
							//if the new text is different from the old text
							if(newTxt!=txtElem[0].previousText){
								//make sure the new text is set
								txtElem[0].previousText=newTxt;
								//refresh the design view flag
								anyChanges=true;
							}
							//clear <l> elements
							txtElem.html(newTxt);
						}
					});
				}
			}
			//if any edit changes were made
			if(anyChanges){
				//refresh the design view
				//***
			}
		};
		//function to create the markup for one letter
		var gLetterMarkup=function(letterStr,json){
			if(letterStr==' '){
				letterStr='&nbsp;';
			}
			//surround this letter with an element
			var classStr='';
			if(json!=undefined){
				//cursor class
				if(json.hasOwnProperty('cursorClass')){
					//if first class, start list, otherwise, add separator
					if(classStr.length<1){classStr=' class="';}
					else{classStr+=' ';}
					//add cursor class
					classStr+=json.cursorClass;
				}
				//if any classes added, end them
				if(classStr.length>0){classStr+="\"";}
			}
			//set the markup
			var markup='<l'+classStr+'>'+letterStr+'</l>';
			return markup;
		};
		//function to add events to new <l>etter elements
		var evsLetters=function(txtElem){
			//click events for <l> each letter
			var lElems=txtElem.children('l').not('evs');
			lElems.addClass('evs');
			lElems.click(function(e){
				//move the cursor to the clicked element
				var txtParent=jQuery(this).parent();
				//remove selection from all letters
				txtParent.children('l.sel').removeClass('sel');
				//get the cursor position and the right and left edges of the letter
				var letterLeft=jQuery(this).offset().left;
				var letterRight=letterLeft+jQuery(this).outerWidth();
				var mouseLeft=e.clientX;
				//get the difference between cursor position and LEFT edge of the letter
				var leftDifference=-1;
				if(mouseLeft>letterLeft){leftDifference=mouseLeft-letterLeft;}
				else{leftDifference=letterLeft-mouseLeft;}
				//get the difference between cursor position and RIGHT edge of the letter
				var rightDifference=-1;
				if(mouseLeft>letterRight){rightDifference=mouseLeft-letterRight;}
				else{rightDifference=letterRight-mouseLeft;}
				//remove the previous cursor position
				txtParent.children('.cursor').removeClass('cursor');
				txtParent.children('.before').removeClass('before');
				//which edge is the cursor closer to?
				var cursorLElem=jQuery(this);
				//if closer to the left edge
				if(leftDifference<rightDifference){
					//if there is an element BEFORE this element
					var prevLElem=jQuery(this).prev('l:first');
					if(prevLElem.length>0){
						cursorLElem=prevLElem;
					}else{
						//this is already the first letter element
						cursorLElem.addClass('before');
					}
				}
				//add the new cursor position
				cursorLElem.addClass('cursor');
			});
		};
		//function to set txt element as empty
		var setBlankTxt=function(txtElem){
			txtElem.html('<l class="cursor before blank"></l>');
			//figure out which element to add the "blank-txt" class to
			var btn=txtElem.parent();
			var btnTag=btn[0].tagName.toLowerCase();
			var wrapElem;
			switch(btnTag){
				case 'k': //btn is a key in a key/value pair
					wrapElem=btn.parent(); //wrapElem is <kv>
					break;
				case 'v': //btn is a value in a key/value pair
					wrapElem=btn.parent(); //wrapElem is <kv>
					break;
				case 'n': //btn is a tag <n>ame of an XML node
					wrapElem=btn.parents('g:first'); //wrapElem is a <g>roup node
					break;
				default: //just use btn as the element that will have the "blank-txt" class
					wrapElem=btn;
					break;
			}
			//add the blank-txt class
			wrapElem.addClass('blank-txt');
			//attach events to the new <l class="cursor before blank"> letter
			evsLetters(txtElem);
		};
		//detect special key press (ctl, alt, shift)
		var isSpecialKeyHeld=function(e){
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
		//blur event
		clickEditElems.blur(function(){
			//if NOT hovering over the input that lost focus
			if(!jQuery(this).parent().hasClass('over')){
				//remove focus from previous elements, but keep the focus on any new focused element, if any
				var keepFocusBtns=codeElem.find('.focus > input').not(jQuery(this));
				clearFocus(keepFocusBtns);
			}else{
				//return focus
				jQuery(this).focus();
			}
		});
		//key events
		var keyup_timeout;
		clickEditElems.keyup(function(e){
			//get the typed value
			var typedVal=jQuery(this).val();
			//init the property that saves the typed value, if necessary
			if(!jQuery(this)[0].hasOwnProperty('typedVal')){
				jQuery(this)[0]['typedVal']='';
			}
			//accumulate the typed value
			jQuery(this)[0].typedVal+=typedVal;
			//clear the input value
			jQuery(this).val('');
			//get the input element
			var inputElem=jQuery(this);
			//cancel previous keyup
			clearTimeout(keyup_timeout);
			keyup_timeout=setTimeout(function(){
				//if the typed value property is initialized
				if(inputElem[0].hasOwnProperty('typedVal')){
					//get the value from the hidden input field and clear input field
					var val=inputElem[0].typedVal;
					//if the input field is not blank
					if(val.length>0){
						//reset the typed value
						inputElem[0].typedVal='';
						//split up each character
						var letterArray=val.split('');val='';
						//for each character
						for(var l=0;l<letterArray.length;l++){
							//if last letter... then add cursor class
							var json={};
							if(l==letterArray.length-1){json['cursorClass']='cursor'}
							//get the letter markup
							var letter=letterArray[l];
							val+=gLetterMarkup(letter,json);
						}
						//get the letter <l> that has the cursor
						var btn=inputElem.parent();
						var txtElem=btn.children('txt:first');
						var cursorElem=txtElem.children('l.cursor:first');
						//if there is a letter with a cursor
						if(cursorElem.length>0){
							//remove previous cursor position
							cursorElem.removeClass('cursor');
							//if the cursor is before the letter
							if(cursorElem.hasClass('before')){
								//remove previous cursor position
								cursorElem.removeClass('before');
								//add new letters before the previous cursor
								cursorElem.before(val);
							}else{
								//cursor is after the letter...

								//add the new letters after previous cursor
								cursorElem.after(val);
							}
							//if before, this txt was blank
							var blankElems=txtElem.children('l.blank');
							if(blankElems.length>0){
								//remove blank letters
								blankElems.remove();
								//remove blank-txt class
								txtElem.parents('.blank-txt:first').removeClass('blank-txt');
							}
							//add the dynamic events to the new <l>etter elements
							evsLetters(txtElem);
						}
					}
				}
			}, 10);
		});
		clickEditElems.keydown(function(e){
			//get btn and <txt> elements
			var btn=jQuery(this).parent();
			var txtElem=btn.children('txt:first');
			var cursorElem=txtElem.children('.cursor:first');
			//==INTERNAL FUNCTIONS==
			var deleteSelectedLetters=function(){
				var didDelSel=false;
				//if there are any selected letters
				var selLElems=txtElem.children('l.sel');
				if(selLElems.length>0){
					//if the first selected letter is also the first letter
					var firstSel=selLElems.eq(0);
					if(firstSel.index()==0){
						//if there is a letter AFTER the LAST selected letter
						var lastSel=selLElems.filter(':last');
						var afterSel=lastSel.next('l:first');
						if(afterSel.length>0){
							//delete selected letters
							selLElems.remove();
							//add the cursor to the remaining, and now first, letter
							afterSel.addClass('before');
							afterSel.addClass('cursor');
							didDelSel=true;
						}else{
							//all letters are selected... so delete them all...

							//blank text, but the cursor still blinks
							setBlankTxt(txtElem);
							didDelSel=true;
						}
					}else{
						//first selected letter is NOT also the first letter...

						//get the non selected letter BEFORE the first selected letter
						var beforeSel=firstSel.prev('l:first');
						//remove the selected letters
						selLElems.remove();
						//add the cursor
						beforeSel.addClass('cursor');
						didDelSel=true;
					}
				}
				return didDelSel;
			};
			var backSpaceLetter=function(){
				//if there are NO selected letters to delete
				if(!deleteSelectedLetters()){
					//if NOT blank txt
					if(!cursorElem.hasClass('blank')){
						//if the cursor isn't already at the start
						if(!cursorElem.hasClass('before')){
							//get the previous element
							var prevLElem=cursorElem.prev('l:first');
							//if there is a previous <l>etter
							if(prevLElem.length>0){
								//move the cursor to this element
								cursorElem.removeClass('cursor');
								prevLElem.addClass('cursor');
							}else{
								//no previous letter...

								//if there is a letter after the cursor
								var nextLElem=cursorElem.next('l:first');
								if(nextLElem.length>0){
									//move the cursor to this element
									cursorElem.removeClass('cursor');
									nextLElem.addClass('before');
									nextLElem.addClass('cursor');
								}else{
									//there are no more letters to switch the cursor to...

									//blank text, but the cursor still blinks
									setBlankTxt(txtElem);
								}
							}
							//remove this letter (backspace)
							cursorElem.remove();
						}
					}
				}
			};
			var deleteLetter=function(){
				//if there are NO selected letters to delete
				if(!deleteSelectedLetters()){
					//if NOT blank txt
					if(!cursorElem.hasClass('blank')){
						//if at first letter
						if(cursorElem.hasClass('before')){
							//if there is a next letter
							var nextElem=cursorElem.next('l:first');
							if(nextElem.length>0){
								nextElem.addClass('before');
								nextElem.addClass('cursor');
								cursorElem.removeClass('cursor');
								//remove this letter (delete)
								cursorElem.remove();
							}else{
								//no next letter...

								//blank text, but the cursor still blinks
								setBlankTxt(txtElem);
							}
						}else{
							//not at first letter...

							//if not at last letter
							var delElem=cursorElem.next('l:first');
							if(delElem.length>0){
								//remove this letter (delete)
								delElem.remove();
							}
						}
					}
				}
			};
			var cursorLeft=function(){
				//if NOT already at the left of the first letter
				if(!cursorElem.hasClass('before')){
					//if there is a previous element
					var prevElem=cursorElem.prev('l:first');
					if(prevElem.length>0){
						//transfer cursor to the previous left
						cursorElem.removeClass('cursor');
						prevElem.addClass('cursor');
						//need to select
						if(isSpecialKeyHeld(e)){
							//if NOT already selected
							if(!cursorElem.hasClass('sel')){
								//add the selected class
								cursorElem.addClass('sel');
							}else{
								//already selected... so deselect
								cursorElem.removeClass('sel');
							}
						}else{
							//no letter should be selected
							txtElem.children('.sel').removeClass('sel');
						}
					}else{
						//no previous element...

						//move the cursor to the left of this element
						cursorElem.addClass('before');
						//need to select
						if(isSpecialKeyHeld(e)){
							//if NOT already selected
							if(!cursorElem.hasClass('sel')){
								//add the selected class
								cursorElem.addClass('sel');
							}else{
								//already selected... so deselect
								cursorElem.removeClass('sel');
							}
						}else{
							//no letter should be selected
							txtElem.children('.sel').removeClass('sel');
						}
					}
				}
			};
			var cursorRight=function(){
				//if at the left of the first letter
				if(cursorElem.hasClass('before')){
					//move the cursor to the right side of this element
					cursorElem.removeClass('before');
					//need to select
					if(isSpecialKeyHeld(e)){
						//if NOT already selected
						if(!cursorElem.hasClass('sel')){
							//add the selected class
							cursorElem.addClass('sel');
						}else{
							//already selected... so deselect
							cursorElem.removeClass('sel');
						}
					}else{
						//no letter should be selected
						txtElem.children('.sel').removeClass('sel');
					}
				}else{
					//not at the left of the first letter...

					//if there is a next element
					var nextElem=cursorElem.next('l:first');
					if(nextElem.length>0){
						//transfer cursor to the next right
						cursorElem.removeClass('cursor');
						nextElem.addClass('cursor');
						//need to select
						if(isSpecialKeyHeld(e)){
							//if NOT already selected
							if(!nextElem.hasClass('sel')){
								//add the selected class
								nextElem.addClass('sel');
							}else{
								//already selected... so deselect
								nextElem.removeClass('sel');
							}
						}else{
							//no letter should be selected
							txtElem.children('.sel').removeClass('sel');
						}
					}
				}
			};
			//==DO SOMETHING DEPENDING ON THE KEY CODE(S)==
			//depending on the key downed
			switch(e.keyCode){
				case 8: //back-space
					e.preventDefault();
					if(isSpecialKeyHeld(e)){deleteLetter();}
					else{backSpaceLetter();}
					break;
				case 46: //delete key
					e.preventDefault();
					if(isSpecialKeyHeld(e)){backSpaceLetter();}
					else{deleteLetter();}
					break;
				case 13: //enter key
					e.preventDefault();
					//***
					break;
				case 91: //apple command key
					e.preventDefault();
					break;
				case 16: //shift key
					e.preventDefault();
					break;
				case 27: //escape key
					e.preventDefault();
					//***
					break;
				case 9: //tab key
					e.preventDefault();
					//***
					break;
				case 37: //left arrow
					e.preventDefault();
					cursorLeft();
					break;
				case 38: //up arrow
					e.preventDefault();
					//***
					break;
				case 39: //right arrow
					e.preventDefault();
					cursorRight();
					break;
				case 40: //down arrow
					e.preventDefault();
					//***
					break;
				default:
					//if a special key, like the apple command key (different code on different systems) is NOT being pressed
					if(!isSpecialKeyHeld(e)){
						//before keyup... delete selected letters, if any
						deleteSelectedLetters();
					}
					break;
			}
		});
		//hover event
		btnElems.hover(function(){
			jQuery(this).addClass('over');
		},function(){
			jQuery(this).removeClass('over');
		});
		//click event
		btnElems.click(function(e){
			var btn=jQuery(this);
			//set the focus of this hidden <input> (make sure it's set)
			var focusInput=btn.children('input:last');
			focusInput.focus();
			//if NOT already has double click class
			var isDblClick=false;
			if(!btn.hasClass('dbl-click')){
				//add dble click class... then remove the class after a delay
				btn.addClass('dbl-click');
				setTimeout(function(){btn.removeClass('dbl-click')},200);
			}else{
				//already has dbl-click class...
				isDblClick=true;
				//if there is text in this btn
				var txtElem=btn.children('txt:first');
				if(txtElem.length>0){
					//select all of the text and remove the cursor
					txtElem.children('l').addClass('sel').removeClass('cursor');
					//put the cursor at the start of the text
					txtElem.children('l:first').addClass('before').addClass('cursor');
				}
			}
			//if NOT double clicked
			if(!isDblClick){
				//if NOT already has focus
				if(!btn.hasClass('focus')){
					//set the focus class of this element
					btn.addClass('focus');
					//clear previous focus (but keep focus on btn)
					clearFocus(btn);
					//if there is existing text being modified
					var txtElem=btn.children('txt:first');
					if(txtElem.length>0){
						//get the input text
						var txt=txtElem.text(); txt=txt.trim();
						//record this previous text, before EDITS are made
						txtElem[0]['previousText']=txt;
						//split up each character
						var letterArray=txt.split('');txt='';
						//for each character
						for(var l=0;l<letterArray.length;l++){
							//if last letter... then add cursor class
							var json={};
							if(l==letterArray.length-1){json['cursorClass']='cursor'}
							//get the letter's markup
							var letter=letterArray[l];
							txt+=gLetterMarkup(letter,json);
						}
						//get the original text width
						var txtWidth=txtElem.innerWidth();
						//set the letters surronded by <l> updated text html
						txtElem.html(txt);
						//add the dynamic events to the new <l>etter elements
						evsLetters(txtElem);
						//if the mouse actually clicked the button
						if(btn.hasClass('over')){
							//figure out which letter to add the cursor to first based on click position
							var mouseLeft=e.clientX;
							var txtLeft=txtElem.offset().left;
							//if the mouse is NOT left of the text's left edge (shouldn't be IF clicked)
							if(mouseLeft>=txtLeft){
								//get the mouse position, relative to the text element
								mouseLeft=mouseLeft-txtLeft;
								//if the mouse is NOT right of the text's right edge (shouldn't be IF clicked)
								if(mouseLeft<=txtWidth){
									//calculate the percentage that the mouse cursor is centered horizontally in the text element
									var mouseLeftPercent=mouseLeft/txtWidth*100;
									//for each letter
									var lettersWidth=0;
									txtElem.children('l').each(function(){
										//accumulate the letters width
										var letterWidth=jQuery(this).outerWidth();
										lettersWidth+=letterWidth;
										//calculate current width percent
										var currentPercent=lettersWidth/txtWidth*100;
										//if the percent is greater or equal to the cursor position percent
										if(currentPercent>=mouseLeftPercent){
											//if there is NO previous letter
											var addCursorElem=jQuery(this).prev('l:first');
											if(addCursorElem.length<1){
												//the clicked letter is the first letter
												addCursorElem=jQuery(this);
												//make sure the cursor will appear to the left of the first letter
												addCursorElem.addClass('before');
											}
											//if this isn't already where the cursor is located
											if(!addCursorElem.hasClass('cursor')){
												//clear the default cursor class and before class
												txtElem.children('l.cursor').removeClass('cursor').not(addCursorElem).removeClass('before');
												//set the cursor on the letter that's closest to the mouse position
												addCursorElem.addClass('cursor');
											}
											//force the letter loop to end
											return false;
										}
									});
								}
							}
						}
					}else{
						//new text is being added (NOT modifying existing text)...
						//***
					}
				}
			}
		});
	}
}
