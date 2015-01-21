function code_completion(){
  var json={
    //has root parent element
    '//':{
      //child node suggestions
      'child':{
        'elem':['svg'],
        'cdata':true,'comment':true,'text':true
      }
    },
    //has svg parent element
    'svg':{
      //child attribute suggestions
      'attr':{
        'version':{
          'default':'1.1',
          'vals':['1.0','1.1','2']
        },
        'viewBox':{
          'default':'0 0 800 800'
        },
        'xmlns':{
          'default':'http://www.w3.org/2000/svg'
        },
        'xmlns:xlink':{
          'default':'http://www.w3.org/1999/xlink'
        }
      },
      //child node suggestions
      'child':{
        'elem':['circle','ellipse','line','path','polygon','polyline','rect','text'],
        'cdata':true,'comment':true,'text':true
      }
    }
  };
  return json;
}
