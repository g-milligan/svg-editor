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
			matchedTagStr=matchedTagStr.replace(info.name,'<n>'+info.name+'</n>');
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
						matchedAttr='<k><space> </space>'+matchedAttr.trim();
						matchedAttr=matchedAttr.replace('=','</k>=');
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
						matchedAttr=strBeforeVal+'<v>'+valStr+'</v>'+strAfterVal;
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
					matchedTagStr=matchedTagStr.replace('</n>','|____n____|<x class="first last"><input type="text" /></x>');
					matchedTagStr=matchedTagStr.replace('|____n____|','</n>');
				}
			}
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
		//*** more events
	}
}
