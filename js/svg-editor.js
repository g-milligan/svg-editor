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
		//function to attach the source editor events to the xml elements
		var evsSourceEditor=function(rootElem){
			if(rootElem==undefined){rootElem=codeElem;}
			//==OPEN/CLOSE ELEMENT EVENTS==
			var ocElems=rootElem.find('oc').not('.evs');
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
			//function to get data from the code completion data
			var getSuggestData=function(args){
				var retData;
				//get the params from args
				var ccJson;
				var pathArray=args.path;
				if(args.hasOwnProperty('root')){ccJson=args.root;}
				if(ccJson==undefined){ccJson=code_completion();}
				//for each item passed in pathArray
				var json=ccJson;
				for(var i=0;i<pathArray.length;i++){
					//if this next key exists in the json
					var key=pathArray[i];
					if(json.hasOwnProperty(key)){
						//get the data at this key
						json=json[key];
					}else{
						//the path wasn't fully completed, end the loop and return undefined
						json=undefined;
						break;
					}
				}
				retData=json;
				return retData;
			};
			//==EDIT XML EVENTS==
			var clickEditElems=rootElem.find('input').not('.evs');
			clickEditElems.addClass('evs');
			var btnElems=clickEditElems.parent();
			//function to clear the current focus
			var clearFocus=function(keepFocusBtn){
				var anyChanges=false;
				//if there are any elements with "blank-txt" then remove these elements
				var blankTxtElems=codeElem.find('.blank-txt');
				if(blankTxtElems.length>0){
					//for each blank txt element
					blankTxtElems.each(function(){
						var blankTxtElem=jQuery(this);
						//NOTE: the blank txt element will either be <g> or <kv>
						var xNextElem=blankTxtElem.next('x:first');
						//if the <x> button, after blankTxtElem, is the last one
						if(xNextElem.hasClass('last')){
							//this xNextElem, will no longer be the last...
							var xPrevElem=blankTxtElem.prev('x:first');
							//the previous <x> element will be last instead
							xNextElem.removeClass('last');
							xPrevElem.addClass('last');
						}
						//remove the <x> element after blankTxtElem
						xNextElem.remove();
						//remove blankTxtElem
						blankTxtElem.remove();
						//changes made
						anyChanges=true;
					});
				}
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
								btn.removeClass('focus'); btn.removeClass('over');
								//make sure any suggest menu is closed
								closeSuggestMenu(btn);
								//get the tag name of btn
								var btnTag=btn[0].tagName.toLowerCase();
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
									//if text was entered into an <x> element (then a new node must be created)
									if(btnTag=='x'){
										//reset the previous text for <x> element
										txtElem[0].previousText=undefined;
										//clear out the temporary text inside the <x> button
										txtElem.html('');
										//get the parent xml name, n=""
										var parentElem=btn.parent();
										//if the parent node has an n="" attribute (if there is no n attribute then treat the parent as the root, //)
										var xmlParentName=parentElem.attr('n'); if(xmlParentName==undefined){xmlParentName='';}
										if(xmlParentName.length<1){xmlParentName='//';}
										//try to get the code completion json for this xmlParentName
										var suggestJson=getSuggestData({'path':[xmlParentName]});
										//the type of new node that will be created depends on the parent of <x>
										var parentTag=parentElem[0].tagName.toLowerCase();
										switch(parentTag){
											case 'e': //create new ATTRIBUTE
												//if the <x> attr key text NOT blank
												if(newTxt.trim().length>0){
													//retrieve the suggested default attribute value, if there is one
													var attrVal=getSuggestData({'root':suggestJson,'path':['attr',newTxt,'default']});
													if(attrVal==undefined){attrVal='';}
													//create the new xml to add
													var xHtml='<x{pos-class}><input type="text" /></x>';
													var attrHtml='<kv><k><space> </space><txt>'+newTxt+'</txt><input type="text" /></k>="<v><txt>'+attrVal+'</txt><input type="text" class="ignore-keyup" /></v>"</kv>';
													//if this is the LAST <x> element
													if(btn.hasClass('last')){
														//this btn will no longer be last <x>
														btn.removeClass('last');
														//add the last class to the new <x> element
														xHtml=xHtml.replace('{pos-class}',' class="last"');
													}else{
														//the new <x> button doesn't have a "last" class
														xHtml=xHtml.replace('{pos-class}','');
													}
													//set the new xml
													btn.after(attrHtml+xHtml);
													//get the new <kv> element
													var newKvElem=btn.next('kv:first');
													//recursive call: add the events to the new <kv><x> elements
													evsSourceEditor(newKvElem.parent());
													//get the new <v> element
													var newVElem=newKvElem.children('v:first');
													//set the cursor in the new v element
													newVElem.click();
													newVElem.click(); //double clicked to select text, and show value suggestions
													//if the <v> value is starting blank, with no default value
													if(attrVal.length<1){newKvElem.addClass('blank-txt');}
												}
												break;
											default: //create new ELEMENT
												//***
												break;
										}
									}
								}
								//if a new item wasn't added (existing item edited)
								if(btnTag!='x'){
									//remove <l> elements markup; just need the plain text in the <txt> element when it doesn't have focus
									txtElem.html(newTxt);
								}else{
									//a new item was created, so reset the <txt> inside the <x> button to blank
									txtElem.html('');
								}
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
				//events for <l> each letter
				var lElems=txtElem.children('l').not('evs');
				lElems.addClass('evs');
				//if the text element doesn't already have events
				if(!txtElem.hasClass('evs')){
					txtElem.addClass('evs');
					//detect when mouse is down over the text element
					txtElem.mousedown(function(){
						//deselect previous selection
						jQuery(this).children('.sel').removeClass('sel');
					});
					var txtMouseUp=function(){
						//if mouse down selection was active
						if(txtElem.children('l.down').length>0){
							//end: disable selection, indicate mouse up
							txtElem.removeClass('mouse-down');
							//restore cursor (at one of the selection ends, right or left)
							var lastSel=txtElem.children('.sel:last');
							var firstSel=txtElem.children('.sel:first');
							//if cursor moved from RIGHT to LEFT
							if(lastSel.hasClass('down')){
								//if there is a NON selected element LEFT of the selected letters
								var firstNonSel=firstSel.prev('l:first');
								if(firstNonSel.length>0){
									//move cursor left of the first selected letter, right of the adjacent NON selected letter
									firstNonSel.addClass('cursor');
								}else{
									//no NON selected element LEFT of the first selected letter...

									//move cursor left of the first selected letter
									firstSel.addClass('before');
									firstSel.addClass('cursor');
								}
							}else{
								//cursor moved from LEFT to RIGHT...

								//cursor moves to the right of the last selected letter
								lastSel.addClass('cursor');
							}
							//reset the initial down letter
							txtElem.children('l.down').removeClass('down');
							//align the hidden <input> val with the selected letters (if any selected)
							inputSelectedTxt(txtElem);
						}
					};
					lElems.mouseup(function(){txtMouseUp();});
					txtElem.mouseup(function(){txtMouseUp();});
					txtElem.mouseleave(function(){txtMouseUp();});
				}
				//drag
				var letterDragSelect=function(lElem){
					//if dragging, mouse is down over text
					var txtParent=lElem.parent();
					if(txtParent.hasClass('mouse-down')){
						if(txtParent.children('l.down:first').length>0){
							if(!txtParent.parent().hasClass('dbl-click')){
								//if this letter was the first letter mousedown
								if(lElem.hasClass('down')){
									//this should be the only selected element
									txtParent.children('l.down').not(lElem).removeClass('sel');
									//select the down element, if not already selected
									if(!lElem.hasClass('sel')){lElem.addClass('sel');}
								}else{
									//the current mouseover letter isn't the inital mousedown letter...

									//get the first down letter (l.down should exist)
									var downLetter=txtParent.children('l.down:first');
									if(downLetter.length>0){
										//get down <l> element index and the current <l> index
										var downIndex=downLetter.index();
										var currentIndex=lElem.index();
										//get all of the letter elements
										var lelms=txtParent.children();
										//if the mouseenter letter is AFTER the initial mouse down letter
										if(downIndex<currentIndex){
											//add "drag" class between the downLetter and the lElem, current letter
											for(var d=downIndex;d<=currentIndex;d++){
												lelms.eq(d).addClass('drag');
											}
										}else{
											//mouseenter letter is BEFORE the initial mouse down letter...
											//add "drag" class between the downLetter and the lElem, current letter
											for(var d=currentIndex;d<=downIndex;d++){
												lelms.eq(d).addClass('drag');
											}
										}
										//remove extranious sel classes (if any)
										lelms.filter('.sel').not('.drag').removeClass('sel');
										//make sure sel classes are added to the drag selected letters
										lelms.filter('.drag').not('.sel').addClass('sel');
										lelms.filter('.drag').removeClass('drag');
									}
								}
							}
						}
					}
				};
				//mouse down
				lElems.mousedown(function(e){
					var lElem=jQuery(this);
					//remove existing initial mousedown letter flag
					var txtParent=lElem.parent();
					txtParent.children('.down').removeClass('down');
					//indicate that the mousedown happened on this letter
					lElem.addClass('down');
					//shouldn't be able to Ctl+C any text until selection ends on mouseup
					txtParent.children('input:last').val('');
				});
				//mouse move
				lElems.mousemove(function(){
					var lElem=jQuery(this);
					//if the drag has NOT already been initiated
					var txtParent=lElem.parent();
					if(!txtParent.hasClass('mouse-down')){
						//if the mouse clicked down on any letter
						if(txtParent.children('l.down:first').length>0){
							//start: enable selection, indicate mouse down
							txtParent.addClass('mouse-down');
							//remove cursor temporarily
							txtParent.children('.cursor').removeClass('cursor').removeClass('before');
							//start selection
							letterDragSelect(lElem);
						}
					}
				});
				//mouse enter
				lElems.mouseenter(function(e){
					//possibly start a drag select on this letter if mouse is held down
					letterDragSelect(jQuery(this));
				});
				//click
				lElems.click(function(e){
					//move the cursor to the clicked element
					var txtParent=jQuery(this).parent();
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
			//function to close the suggestion popup
			var closeSuggestMenu=function(menuBtn,doClose){
				//if the suggestion menu IS active
				if(menuBtn.hasClass('active')){
					var closeWhileOpen=false;
					//if only close when conditions are right
					if(doClose==undefined){
						doClose=false;
						//if doesn't currently have focus
						if(!menuBtn.hasClass('focus')){doClose=true;}
					}
					else{
						//if close, no matter what
						if(doClose){
							//close the menu, even while the button has focus
							closeWhileOpen=true;
						}
					}
					//if should close the menu
					if(doClose||closeWhileOpen){
						//give the fade css transition time to play
						setTimeout(function(){
							//if still doesn't have focus
							if(!menuBtn.hasClass('focus')||closeWhileOpen){
								menuBtn.removeClass('active');
							}
						},200);
					}
				}
			};
			//set the suggested item's text (if any) and clear focus
			var setSuggestItem=function(menuBtn){
				var didSet=false;
				//if <suggest> menu is open
				if(menuBtn.hasClass('active')){
					//if there is a <suggest> element
					var sugWrap=menuBtn.children('suggest:last');
					if(sugWrap.length>0){
						//*** clearFocus();
						didSet=true;
					}
				}
				return didSet;
			};
			//handle selecting an <it>em from the <suggest> menu
			var selectSuggestItem=function(sugWrap,itElem,doSet){
				//if there is a <suggest> wrapper
				if(sugWrap!=undefined&&sugWrap.length>0){
					if(doSet==undefined){doSet=false;}
					//deselect all of the <it>ems under <suggest>
					sugWrap.children('it.sel').removeClass('sel');
					//if the new <it> element exists
					if(itElem!=undefined){
						if(itElem.length>0){
							//add the select class to <it>
							itElem.addClass('sel');
						}
					}
					//if the suggested text should be set
					if(doSet){setSuggestItem(sugWrap.parent());}
				}
			};
			//function to show the suggestion popup
			var openSuggestMenu=function(menuBtn,doOpen){
				//if the suggestion menu is NOT already active
				if(!menuBtn.hasClass('active')){
					//if the menu button has focus
					if(menuBtn.hasClass('focus')){
						//if there is a <suggest> menu inside this button
						if(menuBtn.children('suggest:last').length>0){
							//check to see if conditions are good to open menu?
							if(doOpen==undefined){
								doOpen=false;
								//if there is empty text in this field
								if(menuBtn.find('txt l:first').not('.blank').length<1){
									doOpen=true;
								}
							}
							//if conditions are good to open menu
							if(doOpen){
								//show the suggestions after a delay (so the css transition works)
								setTimeout(function(){
									//if button still has focus
									if(menuBtn.hasClass('focus')){
										//show the suggest menu
										menuBtn.addClass('active');
									}
								},100);
							}
						}
					}
				}
			};
			//build the <suggest> menu html, if not already built
			var initSuggestMenu=function(menuBtn){
				//if the suggest menu hasn't been created yet
				var suggestWrap=menuBtn.children('suggest:first');
				if(suggestWrap.length<1){
					//get the name of the parent for the given elem
					var getParentName=function(elem){
						var ret='//';
						var parentNameElem=elem.parents('[n]:first');
						//if the root is NOT the parent
						if(parentNameElem.length>0){
							//get the parent name
							ret=parentNameElem.attr('n');
						}
						return ret;
					};
					var defaultVal;
					//get suggested attr keys
					var getAttrKeysJson=function(){
						var items=[];
						//if there are any suggested attributes
						var parentName=getParentName(menuBtn);
						var attrJson=getSuggestData({'path':[parentName,'attr']});
						if(attrJson!=undefined){
							//for each suggested attribute
							for (var attrName in attrJson){
								//if key is an actual property of an object, (not from the prototype)
								if (attrJson.hasOwnProperty(attrName)){
									//if first attribute, then set as default
									if(defaultVal==undefined){defaultVal=attrName;}
									//add this to items
									items.push({'val':attrName,'txt':attrName});
								}
							}
						}
						return items;
					};
					//get suggested attr values
					var getAttrValsJson=function(){
						var items=[];
						//if there are any suggested attribute values for this attribute key
						var kElem=menuBtn.parent().children('k:first');
						var kTxtElem=kElem.children('txt:first');
						var kTxt=kTxtElem.html();
						var parentName=getParentName(menuBtn);
						var valsArray=getSuggestData({'path':[parentName,'attr',kTxt,'vals']});
						if(valsArray!=undefined){
							if(valsArray.length>0){
								var defaultStr=getSuggestData({'path':[parentName,'attr',kTxt,'default']});
								//for each suggested value
								for(var v=0;v<valsArray.length;v++){
									var val=valsArray[v];
									//if first attribute, then set as default... by default :P
									if(defaultVal==undefined){defaultVal=val;}
									//is marked as default suggested value?
									var isDefault=false;
									if(defaultStr!=undefined){
										if(val==defaultStr){defaultVal=val;}
									}
									//add this to items
									items.push({'val':val,'txt':val});
								}
							}
						}
						return items;
					};
					//get suggested child names
					var getChildNamesJson=function(parentName){
						var items=[];
						//if there are any suggested attributes
						var childJson=getSuggestData({'path':[parentName,'child']});
						if(childJson!=undefined){
							//for each suggested child
							for (var childKey in childJson){
								//if key is an actual property of an object, (not from the prototype)
								if (childJson.hasOwnProperty(childKey)){
									//function to only return true for BOOLEAN true values
									var isTrue=function(){
										var ret=false;
										if(childJson[childKey]!=undefined){
											if(typeof childJson[childKey]=='boolean'){
												if(childJson[childKey]){ret=true;}
											}
										}return ret;
									};
									//depending on the child key
									switch(childKey){
										case 'default': //default selected element name
											defaultVal=childJson[childKey];
											break;
										case 'cdata':
											//if cdata is allowed in suggestions
											if(isTrue()){
												items.push({'val':'cdata','class':'cdata','start':'&lt;![CDATA[','end':']]&gt;','txt':'&lt;![CDATA[ ... ]]&gt;'}); //add this to items
											}
											break;
										case 'comment':
											//if comment is allowed in suggestions
											if(isTrue()){
												items.push({'val':'comment','class':'comment','start':'&lt;!--','end':'--&gt;','txt':'&lt;!-- ... --&gt;'}); //add this to items
											}
											break;
										case 'text':
											//if text is allowed in suggestions
											if(isTrue()){
												items.push({'val':'text','class':'text','txt':'text'}); //add this to items
											}
											break;
										case 'elem':
											//for each element
											var elems=childJson[childKey];
											for(var e=0;e<elems.length;e++){
												var elemJson=elems[e];
												//add this to items
												items.push({
													'start':'&lt;'+elemJson.tag+'&gt;','end':'&lt;/'+elemJson.tag+'&gt;',
													'class':elemJson.tag,'val':elemJson.tag,'txt':'&lt;'+elemJson.tag+'&gt;'
												});
											}
											break;
									}
								}
							}
						}
						return items;
					};
					//get the suggested data, depending on the menuBtn type
					var suggestItems=[];
					var menuBtnTag=menuBtn[0].tagName.toLowerCase();
					switch(menuBtnTag){
						case 'x': //new item button
							//if new attribute button
							var parentTag=menuBtn.parent()[0].tagName.toLowerCase();
							if(parentTag=='e'){
								//get a list of suggested attribute keys, if any
								suggestItems=getAttrKeysJson();
							}else{
								//new element button...
								var parentName=getParentName(menuBtn);
								//get a list of suggested child names, if any
								suggestItems=getChildNamesJson(parentName);
							}
							break;
						case 'n': //element <n>ame button
							var parentName='//';
							var superParentElem=menuBtn.parents('g:first').parents('[n]:first');
							if(superParentElem.length>0){
								parentName=superParentElem.attr('n');
							}
							//get a list of suggested child names, if any
							suggestItems=getChildNamesJson(parentName);
							break;
						case 'k': //attribute <k>ey button
							//get a list of suggested attribute keys, if any
							suggestItems=getAttrKeysJson();
							break;
						case 'v': //attribute <v>alue button
							//get a list of suggested attribute values, if any
							suggestItems=getAttrValsJson();
							break;
					}
					//if there are any suggested menu items
					if(suggestItems.length>0){
						//create the suggestions wrapper (since it doesn't already exist)
						menuBtn.append('<suggest></suggest>');
						suggestWrap=menuBtn.children('suggest:first');
						//for each suggested item
						var itemIndex=0;
						for(var s=0;s<suggestItems.length;s++){
							var sugJson=suggestItems[s];
							//val attribute
							var valStr;var valAttr='';if(sugJson.hasOwnProperty('val')){valAttr=' val="'+sugJson.val+'"';valStr=sugJson.val;}
							//start attribute
							var startAttr='';if(sugJson.hasOwnProperty('start')){startAttr=' start="'+sugJson.start+'"';}
							//end attribute
							var endAttr='';if(sugJson.hasOwnProperty('end')){endAttr=' end="'+sugJson.end+'"';}
							//class
							var classStr='';if(sugJson.hasOwnProperty('class')){classStr=sugJson.class;}
							var nameAttr='';
							if(classStr.length>0){
								nameAttr=' name="'+classStr+'"';
								classStr=' c_'+classStr;
							}
							//is default selected on init?
							var isDefaultSug=false;
							//if there is NO default value
							if(defaultVal==undefined){
								//select the first, by default
								if(itemIndex==0){isDefaultSug=true;}
							}else{
								//there is a default value...

								//so if THIS is the default value
								if(valStr==defaultVal){isDefaultSug=true;}
							}
							//if this item should be the default selected item on init
							var selClass=''; var defaultClass='';
							if(isDefaultSug){
								selClass=' sel';defaultClass=' default';
							}
							//append the item html
							suggestWrap.append('<it class="i'+defaultClass+selClass+classStr+'"'+valAttr+startAttr+endAttr+nameAttr+'>'+sugJson.txt+'</it>');
							//next item index
							itemIndex++;
						}
						//attach the events to the suggestion wrapper
						var itElems=suggestWrap.children('it').not('evs');
						itElems.addClass('evs');
						//click on suggested item element
						itElems.click(function(){
							selectSuggestItem(suggestWrap,jQuery(this),true);
						});
					}
				}
			};
			//set the selected text in the hidden <input> element so that Ctl+C will copy the selected
			var inputSelectedTxt=function(txtElem){
				//if the txtElem exists
				if(txtElem!=undefined&&txtElem.length>0){
					//get the hidden <input> element
					var inputElem=txtElem.parent().children('input:last');
					//if there are any selected letters
					var selElems=txtElem.children('l.sel');
					if(selElems.length>0){
						//get the selected string... for each selected letter
						var val='';
						selElems.each(function(){
							//get the letter
							var letter=jQuery(this).html();
							//decode the letter
							if(letter=='&nbsp;'){letter=' ';}
							//append the letter to the string val
							val+=letter;
						});
						//set the selected text into the hidden <input>
						inputElem.val(val);
					}else{
						//no selected letters... so the hidden <input> should be blank
						inputElem.val('');
					}
					//select the text in the hidden <input> so that it can be Ctl+C, Ctl+X copied, etc...
					inputElem.focus();inputElem.select();
				}
			};
			//function to select ALL of the <txt>
			var selectAllTxt=function(txtElem){
				//if the txtElem exists
				if(txtElem!=undefined&&txtElem.length>0){
					//select all of the text and remove the cursor
					txtElem.children('l').addClass('sel').removeClass('cursor');
					//put the cursor at the start of the text
					txtElem.children('l:first').addClass('before').addClass('cursor');
					//write the selected text to the hidden <input> so that Ctl+C works
					inputSelectedTxt(txtElem);
				}
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
			//detect special key press (ctl, alt, shift...)
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
			//detect shift key
			var isShiftKeyHeld=function(e){
				var isShift=false;
				if(e!=undefined){
					if(e.shiftKey!=undefined&&e.shiftKey){
						isShift=true;
					}
				}
				return isShift;
			};
			//detect Ctl OR Command key
			var isCtlKeyHeld=function(e){
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
				//if <input> element is NOT being used as a clipboard (eg: Ctl+C)
				if(!jQuery(this).hasClass('ignore-keyup')){
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
				}
			});
			clickEditElems.keydown(function(e){
				//set whether the keyup event will get ignored AFTER THIS keydown
				var ignoreKeyup=true;
				//get btn and <txt> elements
				var btn=jQuery(this).parent();
				var btnTag=btn[0].tagName.toLowerCase();
				var btnParent=btn.parent();
				var btnParentTag=btnParent[0].tagName.toLowerCase();
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
				//get the NEXT or PREV editable element, based on current focus element
				var getNextPrevBtn=function(nextOrPrev){
					var returnBtn;
					switch(btnTag){
						case 'x': //currently at <x> (new item) button
							//if this is a new item button for attributes
							if(btnParentTag=='e'){
								//previous or next button?
								switch(nextOrPrev){
									case 'prev':
										var prevBtn=btn.prev(':first');
										var prevTagName=prevBtn[0].tagName.toLowerCase();
										//what's the previous btn's tag name?
										switch(prevTagName){
											case 'n':
												returnBtn=prevBtn;
												break;
											case 'kv':
												returnBtn=prevBtn.children('v:last');
												break;
										}
										break;
									case 'next':
										//if NOT the last <x> in the attribute list
										if(!btn.hasClass('last')){
											var nextBtn=btn.next(':first'); //get next <kv>
											returnBtn=nextBtn.children('k:last');
										}else{
											//this IS the last <x> in the attribute list

											//if the <g>roup parent is closed
											var gParentElem=btnParent.parent();
											if(gParentElem.hasClass('closed')){
												//open parent <g>roup (parent of <e>)
												gParentElem.children('oc:first').click();
											}
											//get the <x> after the <e>
											var nextX=btnParent.next('x:first');
											returnBtn=nextX;
										}
										break;
								}
							}else{
								//new item <x> button for elements...

								//previous or next button?
								switch(nextOrPrev){
									case 'prev':
										//if NOT the first <x> button in this level
										if(!btn.hasClass('first')){
											//get the prev <g>roup element before this <x> button
											var gPrevElem=btn.prev('g:first');
											//if <g> element is closed
											if(gPrevElem.hasClass('closed')){
												//open the <g>roup
												gPrevElem.children('oc:first').click();
											}
											//get the last <x> button under this <g>roup
											var xPrevElem=gPrevElem.children('x.last:last');
											returnBtn=xPrevElem;
										}else{
											//first <x> button in this level

											//if there is a previous <e> (otherwise, this is probably the very first <x>)
											var prevE=btn.prev('e:first');
											if(prevE.length>0){
												//get the last <x> under the previous <e>
												var prevX=prevE.children('x.last:last');
												returnBtn=prevX;
											}
										}
										break;
									case 'next':
										//if NOT the last <x> button in this level
										if(!btn.hasClass('last')){
											//get the next <g>roup element after this <x> button
											var gNextElem=btn.next('g:first');
											//if <g> element is closed
											if(gNextElem.hasClass('closed')){
												//open the <g>roup
												gNextElem.children('oc:first').click();
											}
											//get the first <e> child under <g>
											var eNextElem=gNextElem.children('e:first');
											//get the first <n> child under <e>
											var nNextElem=eNextElem.children('n:first');
											returnBtn=nNextElem;
										}else{
											//last <x> button in this level

											//if there is a parent <g>roup (otherwise, this is probably the very last <x>)
											var gParentElem=btn.parent('g');
											if(gParentElem.length>0){
												//get the first <x> after this <g>roup
												var xNextElem=gParentElem.next('x:first');
												returnBtn=xNextElem;
											}
										}
										break;
								}
							}
							break;
						case 'n': //currently at element <n>ame button
							//previous or next button?
							switch(nextOrPrev){
								case 'prev':
									//get the previous <x> element before the parent <g>roup
									var gParentElem=btn.parents('g:first');
									var xPrevElem=gParentElem.prev('x:first');
									returnBtn=xPrevElem;
									break;
								case 'next':
									//get the next <x> after the current <k>
									var xNextElem=btn.next('x:first');
									returnBtn=xNextElem;
									break;
							}
							break;
						case 'k': //currently at attribute <k>ey button
							//previous or next button?
							switch(nextOrPrev){
								case 'prev':
									//get the <x> before the <kv> parent
									var xPrevElem=btnParent.prev('x:first');
									returnBtn=xPrevElem;
									break;
								case 'next':
									//get the next <v> after this <k>
									var vNextElem=btn.next('v:first');
									returnBtn=vNextElem;
									break;
							}
							break;
						case 'v': //currently at attribute <v>alue button
							//previous or next button?
							switch(nextOrPrev){
								case 'prev':
									//get the previous <k> before the current <v>
									var kPrevElem=btn.prev('k:first');
									returnBtn=kPrevElem;
									break;
								case 'next':
									//get the next <x> after the <kv>
									var xNextElem=btnParent.next('x:first');
									returnBtn=xNextElem;
									break;
							}
							break;
					}
					return returnBtn;
				}
				//jump to the previous input field
				var skipLeft=function(){
					var prevBtn=getNextPrevBtn('prev');
					if(prevBtn!=undefined){
						prevBtn.click();
					}
					return prevBtn;
				};
				//jump to the next input field
				var skipRight=function(){
					var nextBtn=getNextPrevBtn('next');
					if(nextBtn!=undefined){
						nextBtn.click();
						//put the cursor at the start
						var firstL=nextBtn.find('txt l:first');
						nextBtn.find('txt l.cursor').not(firstL).removeClass('cursor');
						firstL.addClass('before').addClass('cursor');
					}
					return nextBtn;
				};
				var cursorLeft=function(){
					//if NOT already at the left of the first letter
					if(!cursorElem.hasClass('before')){
						var focusTxtElem=txtElem;
						//if there is a previous element
						var prevElem=cursorElem.prev('l:first');
						if(prevElem.length>0){
							//transfer cursor to the previous left
							cursorElem.removeClass('cursor');
							prevElem.addClass('cursor');
							//need to select
							if(isShiftKeyHeld(e)){
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
								//if the ctl key is being held
								if(isCtlKeyHeld(e)){
									//move the cursor to the beginning
									prevElem.removeClass('cursor');
									txtElem.children('l:first').addClass('before').addClass('cursor');
								}
							}
						}else{
							//no previous element...

							//move the cursor to the left of this element
							cursorElem.addClass('before');
							//need to select
							if(isShiftKeyHeld(e)){
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
								//if the ctl key is being held
								if(isCtlKeyHeld(e)){
									//move to the left btn (like shift+tab)
									var prevBtn=skipLeft();
									//get the new <txt> element that has focus
									focusTxtElem=prevBtn.children('txt:first');
								}
							}
						}
						//align the hidden <input> val with the selected letters (if any selected)
						inputSelectedTxt(focusTxtElem);
					}else{
						//already at the left of the first letter...

						//if the ctl key is being held
						if(isCtlKeyHeld(e)){
							//move to the left btn (like shift+tab)
							var prevBtn=skipLeft();
							//get the new <txt> element that has focus
							focusTxtElem=prevBtn.children('txt:first');
						}
					}
					closeSuggestMenu(btn,true);
				};
				var cursorRight=function(){
					var focusTxtElem=txtElem;
					//if at the left of the first letter
					if(cursorElem.hasClass('before')){
						//move the cursor to the right side of this element
						cursorElem.removeClass('before');
						//need to select
						if(isShiftKeyHeld(e)){
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
							//if the ctl key is being held
							if(isCtlKeyHeld(e)){
								//if there is only one empty letter in this field
								if(txtElem.children('l').length<2){
									//move to the right button (like tab)
									var nextBtn=skipRight();
									//get the new <txt> element that has focus
									focusTxtElem=nextBtn.children('txt:first');
								}else{
									//more than just one empty letter in this field...

									//move the cursor to the right of the last letter
									var lastLElem=txtElem.children('l:last');
									txtElem.children('l.cursor').not(lastLElem).removeClass('cursor');
									lastLElem.addClass('cursor');
								}
							}
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
							if(isShiftKeyHeld(e)){
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
								//if the ctl key is being held
								if(isCtlKeyHeld(e)){
									//move the cursor to the last letter
									nextElem.removeClass('cursor');
									txtElem.children('l:last').addClass('cursor');
								}
							}
						}else{
							//if already at the last letter...

							//no letter should be selected
							txtElem.children('.sel').removeClass('sel');
							//if the ctl key is being held
							if(isCtlKeyHeld(e)){
								//move to the right button (like tab)
								var nextBtn=skipRight();
								//get the new <txt> element that has focus
								focusTxtElem=nextBtn.children('txt:first');
							}
						}
					}
					//align the hidden <input> val with the selected letters (if any selected)
					inputSelectedTxt(focusTxtElem);
					closeSuggestMenu(btn,true);
				};
				//handle arrow up/down
				var arrowUpDown=function(upOrDown){
					//if the <suggest> menu is NOT open
					if(!btn.hasClass('active')){
						//***
					}else{
						//the <suggest> menu IS open...

						//if there is a <suggest> menu
						var sugWrap=btn.children('suggest:first');
						if(sugWrap.length>0){
							//if there are ANY <it>ems under <suggest> menus
							if(sugWrap.children('it').length>0){
								//get the selected <it>, if any
								var selIt=sugWrap.children('it.sel:first');
								//if NO item is selected now
								if(selIt.length<1){
									//depending on arrow up/down...
									switch(upOrDown){
										case 'down': selIt=sugWrap.children('it:first'); break; //get the FIRST <it>em by default
										case 'up': selIt=sugWrap.children('it:last'); break; //get the LAST <it>em by default
									}
								}
								//if there is any <it>em in the <suggest> menu
								if(selIt.length>0){
									//if the <it>em is already selected (move to the next item)
									if(selIt.hasClass('sel')){
										var newIt;
										//depending on arrow up/down...
										switch(upOrDown){
											case 'down': newIt=selIt.next('it:first'); break; //get the FIRST <it>em by default
											case 'up': newIt=selIt.prev('it:first'); break; //get the LAST <it>em by default
										}
										//select the next/prev item
										selectSuggestItem(sugWrap,newIt);
									}else{
										//<it>em NOT already selected because no item was selected...

										//select the <it>em (either first or last item)
										selectSuggestItem(sugWrap,selIt);
									}
								}
							}
						}
					}
				};
				//handle arrow up
				var arrowUp=function(){arrowUpDown('up');};
				//handle arrow down
				var arrowDown=function(){arrowUpDown('down');};
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
						//if a special key is NOT held now
						if(!isSpecialKeyHeld(e)){
							//if the <suggest> menu wasn't open
							if(!setSuggestItem(btn)){
								//enter value and remove focus from this btn
								clearFocus();
							}
						}else{
							//special key IS being held...

							//suggest menu isn't already open
							if(btn.hasClass('active')){
								//close suggest menu
								closeSuggestMenu(btn,true);
							}else{
								//open suggest menu
								openSuggestMenu(btn,true);
							}
						}
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
						closeSuggestMenu(btn,true);
						break;
					case 9: //tab key
						e.preventDefault();
						//if the SHIFT key IS being held
						if(isShiftKeyHeld(e)){
							//jump left instead of right
							skipLeft();
						}else{
							//if some other special key is NOT being held... as in alt+tab or cmd+tab
							if(!isSpecialKeyHeld(e)){
								//jump right
								skipRight();
							}
						}
						break;
					case 37: //left arrow
						e.preventDefault();
						cursorLeft();
						break;
					case 38: //up arrow
						e.preventDefault();
						arrowUp();
						break;
					case 39: //right arrow
						e.preventDefault();
						cursorRight();
						break;
					case 40: //down arrow
						e.preventDefault();
						arrowDown();
						break;
					default:
						//if NOT holding a special key, like ctl, command, shift, alt...
						if(!isSpecialKeyHeld(e)){
							//before keyup... delete selected letters, if any
							deleteSelectedLetters();
							//allow keyup
							ignoreKeyup=false;
						}else{
							//some special IS being held...

							//if space bar pressed
							if(e.keyCode==32){
								e.preventDefault();
								//suggest menu isn't already open
								if(btn.hasClass('active')){
									//close suggest menu
									closeSuggestMenu(btn,true);
								}else{
									//open suggest menu
									openSuggestMenu(btn,true);
								}
							}else{
								//space bar NOT pressed...

								//if ctl OR apple command key is being held
								if(isCtlKeyHeld(e)){
									//depending on which key was pressed WITH the ctl key
									switch(e.keyCode){
										case 65: //Ctl+A (select all)
											e.preventDefault();
											selectAllTxt(txtElem);
											openSuggestMenu(btn,true);
											break;
										case 67: //Ctl+C (copy selected)
											//native functionality (copy from hidden <input> value)
											txtElem.addClass('copy');
											//close suggest menu
											closeSuggestMenu(btn,true);
											setTimeout(function(){txtElem.removeClass('copy');},100);
											break;
										case 86: //Ctl+V (paste)
											//native functionality (copy from hidden <input> value)
											//before keyup... delete selected letters, if any
											deleteSelectedLetters();
											//allow keyup
											ignoreKeyup=false;
											break;
										case 88: //Ctl+X (cut)
											//native functionality (copy from hidden <input> value)
											//delete selected letters, if any
											deleteSelectedLetters();
											//close suggest menu
											closeSuggestMenu(btn,true);
											break;
										case 90: //Ctl+Z (undo)
											e.preventDefault();
											//***
											break;
										case 89: //Ctl+Y (redo)
											e.preventDefault();
											//***
											break;
									}
								}else{
									//a special key OTHER THAN ctl/command is pressed...

									//if SHIFT is being pressed
									if(e.shiftKey!=undefined&&e.shiftKey){
										//before keyup... delete selected letters, if any
										deleteSelectedLetters();
										//close suggest menu
										closeSuggestMenu(btn,true);
										//allow keyup (capital letters)
										ignoreKeyup=false;
									}
								}
							}
						}
						break;
				}
				//if the keyup should be ignored (so that the hidden input contents DON'T get written)
				if(ignoreKeyup){
					//BLOCK the keyup input entry
					txtElem.parent().children('input:last').not('.ignore-keyup').addClass('ignore-keyup');
				}else{
					//ALLOW the keyup input entry
					txtElem.parent().children('input.ignore-keyup:last').removeClass('ignore-keyup');
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
				var btnTag=btn[0].tagName.toLowerCase();
				//set the focus of this hidden <input> (make sure it's set)
				var focusInput=btn.children('input:last');
				focusInput.focus();
				//function to set the focus on the clicked btn element
				var setBtnFocus=function(){
					//if NOT already has focus
					if(!btn.hasClass('focus')){
						//set the focus class of this element
						btn.addClass('focus');
						//clear previous focus (but keep focus on btn)
						clearFocus(btn);
						//if there is existing text being modified (should be)
						var txtElem=btn.children('txt:first');
						if(txtElem.length>0){
							//get the input text
							var txt=txtElem.text(); txt=txt.trim();
							//if the text is NOT blank
							if(txt.length>0){
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
								//set the letters surrounded by <l> updated text html
								txtElem.html(txt);
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
								//there is no text inside <txt> ...

								//add the cursor inside this <txt> element
								txtElem.html('<l class="blank before cursor"></l>');
							}
							//add the dynamic events to the new <l>etter elements
							evsLetters(txtElem);
						}
						//build the <suggest> menu for this button, if there is data AND the <suggest> html isn't already built
						initSuggestMenu(btn);
						//open the suggestion menu popup, if conditions are right
						openSuggestMenu(btn);
					}
				};
				//if NOT an <x> btn element
				if(btnTag!='x'){
					//if NOT already has double click class
					var isDblClick=false;
					if(!btn.hasClass('dbl-click')){
						//add dble click class... then remove the class after a delay
						btn.addClass('dbl-click');
						setTimeout(function(){btn.removeClass('dbl-click')},185);
					}else{
						//already has dbl-click class...
						isDblClick=true;
						//select all of the text in <txt>, if <txt> element exists
						var txtElem=btn.children('txt:first');
						selectAllTxt(txtElem);
						//open the suggestion menu popup
						openSuggestMenu(btn,true);
						//remove double click class now instead of waiting for timer
						btn.removeClass('dbl-click');
					}
					//if NOT double clicked
					if(!isDblClick){
						//finish setting the clicked button's focus
						setBtnFocus();
					}
				}else{
					//clicked on an <x> btn to create a new node...

					//get parent element of <x>
					var suggestCode=true;
					var xParent=btn.parent();
					//get the <x> type (attribute OR node?)
					var xType=xParent[0].tagName.toLowerCase();
					//if <g>roup node
					if(xType=='g'){
						//if this group is currently closed
						if(xParent.hasClass('closed')){
							//get the open/close button if it exists
							var ocBtn=xParent.children('oc:first');
							if(ocBtn.length>0){
								//open this group instead of suggesting code
								ocBtn.click();
								suggestCode=false;
							}
						}
					}
					//if a code suggestion is needed (if so, then user can enter text)
					if(suggestCode){
						//create a <txt> element, IF doesn't exist yet
						var txtElem=btn.children('txt:first');
						if(txtElem.length<1){
							btn.prepend('<txt></txt>');
							txtElem=btn.children('txt:first');
						}txtElem.html('');
						//finish setting the cursor focus for this empty <txt> element
						setBtnFocus();
					}
				}
			});
		};
		//on page load, attach all of the source code editor events
		evsSourceEditor();
	}
}
