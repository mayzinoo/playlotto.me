define([
    'react',
    'lodash',
    'game-logic/clib',
    'components/BallDisplay',
    'components/BallDisplay2',
    'components/TextDisplay',
    'game-logic/engine',
    'stores/ChartStore',
    'stores/GameSettingsStore',
    'components/Bouncy',
    'components/ResultBall', 
       
], function(
    React,
    _,
    Clib,
    BallDisplayClass,
    BallDisplay2Class,
    TextDisplayClass,
    Engine,
    ChartStore,
    GameSettingsStore,
    BouncyClass,
    ResultBallClass, 
    
){

    var D = React.DOM;

    var BallDisplay = new BallDisplayClass();
    var BallDisplay2 = new BallDisplay2Class();
    var TextDisplay = React.createFactory(TextDisplayClass);
    var Bouncy = React.createFactory(BouncyClass);
    var ResultBall = React.createFactory(ResultBallClass);
    
    

    function getState(){
        return _.merge({}, ChartStore.getState(), GameSettingsStore.getState());
    }

    return React.createClass({
        displayName: 'Canvas',

        propTypes: {
                     
        },

        getThisElementNode: function() {
            return this.getDOMNode();
        },

        componentDidMount: function() {
            BallDisplay.startRendering(this.refs.canvas.getDOMNode(), this.getThisElementNode)              
        },

        render: function() {
            //console.log('gamestatus', this.props.status);
              

                   return D.div({ },
                       D.canvas({ ref: 'canvas' , width:'200px', height:'200px'   }),
                       

                
           ) 
        }
    });
});