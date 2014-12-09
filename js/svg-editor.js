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
			//replace tag with temporary placeholder, surronded by <e> element markup
			design=design.replace(matchedTagStr,'<e n="'+info.name.toLowerCase()+'" class="'+info.open_close+'"><<'+t+'>></e>');
			//insert the <t> markup around the tag name
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
						var matchedAttr=matchedAttrs[a];
						//replace the attribute with a temporary placeholder
						matchedTagStr=matchedTagStr.replace(matchedAttr,'<kv>>>'+a+'<<</kv>');
						//surround the attribute key with markup
						matchedAttr='<k>'+matchedAttr;
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
		//update the code
		codeElem.html(currentDesignSrc);
		//*** add wrappers around open and close <e> element tags
		//*** add javascript events for editing source code
	}
}