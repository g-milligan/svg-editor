jQuery(document).ready(function(){
	//==GRAB KEY ELEMENTS==
	var bodyElem=jQuery('body:first');
	var contentWrap=bodyElem.find('#content:first');
	var codeSection=contentWrap.find('#code:first');
	var designSection=contentWrap.find('#design:first');
	var codeHud=codeSection.find('#code-hud:first');
	//==WINDOW READY==
	jQuery(window).ready(function(){
		//==CODE HUD RESIZE==
		codeHud.draggable({
			'addClasses':false,
			'axis':'y',
			'zIndex':999,
			'start':function(e,ui){
				var allow=true;
				//disable draggable if the code content is minimized
				if(contentWrap.hasClass('minimized-code')){
					e.preventDefault();
					allow=false;
					contentWrap.removeClass('resize-code');
				}else{
					contentWrap.addClass('resize-code');
				}
				return allow;
			},
			'stop':function(e,ui){
				//when the drag stops...
				
				//calculate the percentage position where the drag stopped
				var newTopOffset=ui.helper.offset().top;
				var contentTop=contentWrap.offset().top;
				newTopOffset-=contentTop; //remove the space where the content does not reach
				var contentHeight=contentWrap.innerHeight();
				var newCodeHeight=contentHeight-newTopOffset;
				var codeHeightPercent=(newCodeHeight/contentHeight)*100;
				var designHeightPercent=100-codeHeightPercent;
				//set the new percentage heights 
				codeSection.css('height',codeHeightPercent+'%');
				designSection.css('height',designHeightPercent+'%');
				//remove the extra style junk from the drag handle
				codeHud.removeAttr('style');
				//remove the resize class
				contentWrap.removeClass('resize-code');
			}
		});
		//==WINDOW RESIZE==
		var doResize=function(){
			//***
		};
		var resize_timeout;
		jQuery(window).resize(function(){
			//execute resize function ONCE
			clearTimeout(resize_timeout);
			resize_timeout=setTimeout(function(){
				doResize();
			},100);
		});
		//execute resize function on page load
		doResize();
	});
});
//toggle showing / hiding the source code
function toggleExpandCode(){
	var contentWrap=jQuery('#content:first');
	var btn=contentWrap.find('#code #code-hud .btns .expand-contract:first');
	//get the design and code wraps
	var designSection=contentWrap.find('#design:first');
	var codeSection=contentWrap.find('#code:last');
	//switch title
	var title=btn.attr('title');
	var altTitle=btn.attr('alt-title');
	btn.attr('title',altTitle); btn.attr('alt-title',title);
	//if currently minimized
	if(contentWrap.hasClass('minimized-code')){
		//then expand
		contentWrap.removeClass('minimized-code');
		//restore inline-style heights, if any
		restoreInlineStyles(designSection);
		restoreInlineStyles(codeSection);
	}else{
		//NOT minimized...
		contentWrap.addClass('minimized-code');//then minimize
		//temporarily remove the inline style heights (if any)
		saveRemoveInlineStyles(designSection,['height']);
		saveRemoveInlineStyles(codeSection,['height']);
	}
}
//remove inline style rules in a way that allows them to be restored later
function saveRemoveInlineStyles(elem,targetRulesArray){
	//if currently has a style attribute
	var styleAttr=elem.attr('style');
	if(styleAttr!=undefined){
		if(typeof styleAttr=='string'&&styleAttr.length>0){
			//for each style rule
			var hasWidth=false;
			var styleAttrArray=styleAttr.split(';');
			for(var r=0;r<styleAttrArray.length;r++){
				//if there is a key/val dual style part
				var keyVal=styleAttrArray[r].split(':');
				if(keyVal.length>1){
					var key=keyVal[0].trim();key=key.toLowerCase();
					var val=keyVal[1].trim();val=val.toLowerCase();
					//for each target rule
					for(var t=0;t<targetRulesArray.length;t++){
						//if this is a target value 
						if(key.indexOf(targetRulesArray[t])!=-1){
							//preserve this target value 
							//so that when the element is re-pinned, the rule can be restored
							if(!elem[0].hasOwnProperty('restoreStyles')){
								//set the property
								elem[0]['restoreStyles']=[];
							}
							//push the style value into the array of styles to preserve
							elem[0].restoreStyles.push({'key':key,'val':val});
							//remove this style value for now
							elem.css(key,'');
						}
					}
				}
			}
		}
	}
};
//restores the inline styles that were removed by saveRemoveInlineStyles()
function restoreInlineStyles(elem){
	//if any styles should be restored
	if(elem[0].hasOwnProperty('restoreStyles')){
		//for each rule to restore
		for(var r=0;r<elem[0].restoreStyles.length;r++){
			//get the rule
			var rule=elem[0].restoreStyles[r];
			//restore the rule
			elem.css(rule.key,rule.val);
		}
	}
}