define([
    'react',
    'lodash',
    'game-logic/clib',
    'components/GraphicDisplay',
    'components/TextDisplay',
    'game-logic/engine',
    'stores/ChartStore',
    'stores/GameSettingsStore',    
], function(
    React,
    _,
    Clib,
    GraphicDisplayClass,
    TextDisplayClass,
    Engine,
    ChartStore,
    GameSettingsStore,    
){

    var D = React.DOM;

    var GraphicDisplay = new GraphicDisplayClass();
    var TextDisplay = React.createFactory(TextDisplayClass);
    
   
    return React.createClass({
        displayName: 'Bouncy',

        propTypes: {
            color: React.PropTypes.string.isRequired,
            x: React.PropTypes.string.isRequired,
            y:React.PropTypes.string.isRequired, 
            //btext:React.PropTypes.string.isRequired,            
        },

        getInitialState: function () {
            var state = GameSettingsStore.getState();
            state.color = this.props.color;
            state.x = this.props.x;
            state.y = this.props.y;
            //state.btext = this.props.btext;
            return state;
        },

        componentDidMount() {           

            setInterval(this.animate,350);
          },

          animate: function()  {
            //alert(this.state.x);
            //alert('animate');

                const offset = 3;
                const ballSize = 30;
                const root = document.getElementById("circle");                
                let lastXCoeff = 1;
                let lastYCoeff = 1;
                root.offsetWidth = 300;
                root.offsetHeight = 300;

              let x = Number(this.state.x) + lastXCoeff * offset;
              if (x + ballSize > root.offsetWidth || x <= 0) {
                lastXCoeff = lastXCoeff;
                //x = Number(this.state.x) + lastXCoeff * offset;                  
              }

              //x = Number(this.state.x) + lastXCoeff * offset;
              x = this.newRandomNumber(50, 220);

              let y = Number(this.state.y) + lastYCoeff * offset;

              if (y + ballSize > root.offsetHeight || y <= 0) {
                lastYCoeff = lastYCoeff;
                //y = Number(this.state.y) + lastYCoeff * offset;
                
                //alert(y);
              }
              //y = Number(this.state.y) + lastYCoeff * offset;
              y = this.newRandomNumber(20, 220);

              
              //this.setState({ x, y });
              this.setState({ x: x });
              this.setState({ y: y });
            },

        newRandomNumber: function(min, max){
          return Math.floor(Math.random() * (max - min + 1)) + min; 
        },        

       

        render: function() {
        
          const spanStyle = {
                transform: "translate(" + Number(this.state.x) + "px, " + Number(this.state.y) + "px)", timeout: '3s', 
                backgroundColor: this.state.color
              };  
            

                   
             return D.span({ className: "bouncy", style: spanStyle } )           
            //return D.span({ className: "bouncy", style: spanStyle } , this.props.btext) 
        }
    });
});