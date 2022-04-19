define([
    'react',
    'lodash',
    'game-logic/clib',
    'components/GraphicDisplay',
    'components/TextDisplay',
    'game-logic/engine',
    'stores/ChartStore',
    'stores/GameSettingsStore',
    'components/Bouncy',
    'components/ResultBall',
    'components/ResultBall2', 
    'components/Canvas', 
    'components/Canvas2', 
    'components/BallDisplay',
    'components/BallDisplay2',
      
], function(
    React,
    _,
    Clib,
    GraphicDisplayClass,
    TextDisplayClass,
    Engine,
    ChartStore,
    GameSettingsStore,
    BouncyClass,
    ResultBallClass,
    ResultBall2Class, 
    CanvasClass, 
    Canvas2Class, 
    BallDisplayClass,
    BallDisplay2Class,
    
){

    var D = React.DOM;

    var GraphicDisplay = new GraphicDisplayClass();
    var TextDisplay = React.createFactory(TextDisplayClass);
    var Bouncy = React.createFactory(BouncyClass);
    var ResultBall = React.createFactory(ResultBallClass);
    var ResultBall2 = React.createFactory(ResultBall2Class);
    var Canvas = React.createFactory(CanvasClass);
    var Canvas2 = React.createFactory(Canvas2Class);
    var BallDisplay = new BallDisplayClass();
    var BallDisplay2 = new BallDisplay2Class();

    function getState(){
        return _.merge({}, ChartStore.getState(), GameSettingsStore.getState());
    }

   

    return React.createClass({
        displayName: 'Ball',

        propTypes: {
            num1: React.PropTypes.number.isRequired,
            num2: React.PropTypes.number.isRequired,
            num3:React.PropTypes.number.isRequired, 
            num4: React.PropTypes.number.isRequired,
            num5: React.PropTypes.number.isRequired,
            num6:React.PropTypes.number.isRequired, 
            status:React.PropTypes.string.isRequired,
            fornextround:React.PropTypes.string.isRequired,
            round:React.PropTypes.string.isRequired,
            windowsize: React.PropTypes.number.isRequired,            
        },

        getThisElementNode: function() {
            return this.getDOMNode();
        },

        componentDidMount: function() {           
            BallDisplay2.startRendering(this.refs.canvas2.getDOMNode(), this.getThisElementNode);
        },

       
        render: function() {

          setInterval(this.chkstate,1000);

          var resultball = [];
          
            var resultball2 = []; 
            

            if (this.props.status === 'STARTING') {                
                if(this.props.fornextround === 'true'){
                    if(this.props.num1 !== null && this.props.num2 !== null && this.props.num3 !== null && this.props.num4 !== null && this.props.num5 !== null && this.props.num6 !== null)               
                    {
                      if(this.props.windowsize === 1920){
                         resultball2.push( ResultBall2({ color: 'red', x: '190', y: '-70', num1: this.props.num1,
                                              num2: this.props.num2, num3: this.props.num3, num4: this.props.num4, num5: this.props.num5, num6: this.props.num6, 
                                              level: 'one', status: this.props.status, hide: 'false', nextlevel:'two', windowsize: this.props.windowsize   } ) );
                      } 
                      else if(this.props.windowsize === 1853){
                         resultball2.push( ResultBall2({ color: 'red', x: '207', y: '-70', num1: this.props.num1,
                                              num2: this.props.num2, num3: this.props.num3, num4: this.props.num4, num5: this.props.num5, num6: this.props.num6, 
                                              level: 'one', status: this.props.status, hide: 'false', nextlevel:'two', windowsize: this.props.windowsize   } ) );
                      } 
                      else if(this.props.windowsize === 1440){
                         resultball2.push( ResultBall2({ color: 'red', x: '150', y: '-70', num1: this.props.num1,
                                              num2: this.props.num2, num3: this.props.num3, num4: this.props.num4, num5: this.props.num5, num6: this.props.num6, 
                                              level: 'one', status: this.props.status, hide: 'false', nextlevel:'two'   } ) );
                      } 
                      else if(this.props.windowsize === 1280){
                         resultball2.push( ResultBall2({ color: 'red', x: '100', y: '-70', num1: this.props.num1,
                                              num2: this.props.num2, num3: this.props.num3, num4: this.props.num4, num5: this.props.num5, num6: this.props.num6, 
                                              level: 'one', status: this.props.status, hide: 'false', nextlevel:'two'   } ) );
                      }
                      else{}                        
                    }
                } else{}
                 if(this.props.num1 !== null && this.props.num2 !== null && this.props.num3 !== null && this.props.num4 !== null && this.props.num5 !== null && this.props.num6 !== null)               
                    {
                       if(this.props.windowsize === 1920){
                        resultball.push( ResultBall({ color: 'red', x: '190', y: '-70', num1: this.props.num1,
                                              num2: this.props.num2, num3: this.props.num3, num4: this.props.num4, num5: this.props.num5, num6: this.props.num6, 
                                              level: 'one', status: this.props.status, hide: 'false'   } ) );
                      }
                      else if(this.props.windowsize === 1853){
                        resultball.push( ResultBall({ color: 'red', x: '207', y: '-70', num1: this.props.num1,
                                              num2: this.props.num2, num3: this.props.num3, num4: this.props.num4, num5: this.props.num5, num6: this.props.num6, 
                                              level: 'one', status: this.props.status, hide: 'false'   } ) );
                      }
                      else if(this.props.windowsize === 1440){
                        resultball.push( ResultBall({ color: 'red', x: '150', y: '-70', num1: this.props.num1,
                                              num2: this.props.num2, num3: this.props.num3, num4: this.props.num4, num5: this.props.num5, num6: this.props.num6, 
                                              level: 'one', status: this.props.status, hide: 'false'   } ) );
                      }
                      else if(this.props.windowsize === 1280){
                        resultball.push( ResultBall({ color: 'red', x: '100', y: '-70', num1: this.props.num1,
                                              num2: this.props.num2, num3: this.props.num3, num4: this.props.num4, num5: this.props.num5, num6: this.props.num6, 
                                              level: 'one', status: this.props.status, hide: 'false'   } ) );
                      }                      
                      else{}
                    }     
                
            } 
                var spanStyle = {
                   borderradius: "200px"
                  };

                   return D.div({ id: 'circle'},                    
                        D.img({ src: 'img/tube.jpg', className: 'tube' }) ,
                        D.div({ className: 'circle' , id : 'balls'},                     

                         // Bouncy({ color: 'red', x: '1', y: '50'}),
                         // Bouncy({ color: 'yellow', x: '10', y: '5' }),
                         // Bouncy({ color: 'pupple', x: '5', y: '15' }),
                         // Bouncy({ color: 'blue', x: '8', y: '20'  }),
                         // Bouncy({ color: 'pink', x: '20', y: '30' }),
                         // Bouncy({ color: 'red', x: '5', y: '40'}),
                         // Bouncy({ color: 'yellow', x: '25', y: '15' }),
                         // Bouncy({ color: 'pupple', x: '35', y: '10' }),
                         D.canvas({ style: spanStyle, ref: 'canvas2' , width:'300px', height:'300px'   }), 
                         
                          
                         D.div({className:'myCanvas2'},
                                            resultball , resultball2                                       
                           
                          ),


                         
                    ),

                ) 
        }
    });
});