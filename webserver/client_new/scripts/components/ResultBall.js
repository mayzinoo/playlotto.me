define([
    'react',
    'lodash',
    'game-logic/clib',
    'components/GraphicDisplay',
    'components/TextDisplay',
    'game-logic/engine',
    'stores/ChartStore',
    'stores/GameSettingsStore',
    'components/ResultBall2',        
], function(
    React,
    _,
    Clib,
    GraphicDisplayClass,
    TextDisplayClass,
    Engine,
    ChartStore,
    GameSettingsStore,   
    ResultBall2Class, 
){

    var D = React.DOM;

    var GraphicDisplay = new GraphicDisplayClass();
    var TextDisplay = React.createFactory(TextDisplayClass);
    var ResultBall2 = React.createFactory(ResultBall2Class);

    var hideorshow = 'false';
    
   
    return React.createClass({
        displayName: 'ResultBall',

        propTypes: {
            color: React.PropTypes.string.isRequired,
            x: React.PropTypes.string.isRequired,
            y:React.PropTypes.string.isRequired, 
            num1:React.PropTypes.number.isRequired,
            num2:React.PropTypes.number.isRequired,
            num3:React.PropTypes.number.isRequired,
            num4:React.PropTypes.number.isRequired,
            num5:React.PropTypes.number.isRequired,
            num6:React.PropTypes.number.isRequired,
            level:React.PropTypes.string.isRequired, 
            hide:React.PropTypes.string.isRequired, 
            status:React.PropTypes.string.isRequired,           
        },

        getInitialState: function () {
            var state = GameSettingsStore.getState();
            state.color = this.props.color;
            state.x = this.props.x;
            state.y = this.props.y;
            state.x1 = this.props.x;
            state.y1 = this.props.y;
            state.x2 = this.props.x;
            state.y2 = this.props.y;
            state.x3 = this.props.x;
            state.y3 = this.props.y;
            state.x4 = this.props.x;
            state.y4 = this.props.y;
            state.x5 = this.props.x;
            state.y5 = this.props.y;
            state.x6 = this.props.x;
            state.y6 = this.props.y;
            state.j1 = '130';
            state.k1 = '250';
            state.j2 = '130';
            state.k2 = '250';
            state.j3 = '130';
            state.k3 = '250';
            state.j4 = '130';
            state.k4 = '250';
            state.j5 = '130';
            state.k5 = '250';
            state.j6 = '130';
            state.k6 = '250';
            state.hide = this.props.hide; 
            state.upperhide = 'false';
            state.lowerhide = 'false'; 
            state.level = 'one';  
            state.nextlevel = 'one';  
            state.v2 = '';  
            state.underclass = 'resultball1'; 
            //state.btext = this.props.btext;
            return state;
        },


        componentDidMount() {                    

            setTimeout(this.animate1,1000);                  
            
          },

           animate1: function()  { 

              this.setState({'hide': 'false' }); 
              this.setState({ 'level': 'one'});             
              
              setTimeout(this.result1,2000);                                         
            },

            result1: function()  {
           this.setState({'hide': 'true' }); 
           this.setState({ 'level': 'two'});           
            let x1 = '10';              
            let y1 = '10';              
            this.setState({ x1: x1 });
            this.setState({ y1: y1 });

            this.setState({ underclass: 'under1' });

            setTimeout(this.animate2,2000);                   

            },

            animate2: function()  {                           
             
              setTimeout(this.result2,2000);
               
            },

           result2: function()  { 
           this.setState({ 'level': 'three'});   
           this.setState({'hide': 'true' });                  
            let x2 = '60';              
            let y2 = '10';              
            this.setState({ x2: x2}); 
              this.setState({ y2: y2}); 

              this.setState({ underclass: 'under2' });

            setTimeout(this.animate3,2000);                                
            },

            animate3: function()  {                                 
              
               setTimeout(this.result3,2000);
               
            },

           result3: function()  { 
           this.setState({ 'level': 'four'});
           this.setState({'hide': 'true' });                   
            let x3 = '110';              
            let y3 = '10';              
            this.setState({ x3: x3}); 
            this.setState({ y3: y3}); 

            this.setState({ underclass: 'under3' });

            setTimeout(this.animate4,2000);           
                        
            },

            animate4: function()  {            
             
               setTimeout(this.result4,2000);               
            },

           result4: function()  { 
            this.setState({ 'level': 'five'});
           this.setState({'hide': 'true' });                   
            let x4 = '160';              
            let y4 = '10';              
            this.setState({ x4: x4}); 
            this.setState({ y4: y4}); 

            this.setState({ underclass: 'under4' });

            setTimeout(this.animate5,2000);                        
            },

            animate5: function()  {              
             

               setTimeout(this.result5,2000);               
            },

            result5: function()  { 
           this.setState({ 'level': 'six'});   
           this.setState({'hide': 'true' });                   
            let x5 = '210';              
            let y5 = '10';              
            this.setState({ x5: x5}); 
            this.setState({ y5: y5}); 

            this.setState({ underclass: 'under5' });
               
            setTimeout(this.animate6,2000);    
            },

            animate6: function()  {             
                 setTimeout(this.result6,2000);               
            },

            result6: function()  { 
              this.setState({'hide': 'true' });              
                         
            let x6 = '260';              
            let y6 = '10';              
            this.setState({ x6: x6 }); 
            this.setState({ y6: y6 }); 

            this.setState({ underclass: 'under6' });    

            clearTimeout(this.animate1);              
            setTimeout(this.resetlevel,1000);
                               
            },           
            
            resetlevel: function()  {  
            //this.setState({ 'nextlevel' : 'two'});      
              this.setState({'level': '' });
              this.setState({'hide': 'false' });
              //setTimeout(this.nextanimate1,1000);

            },

        render: function() {
         console.log('xxxxxxxxxxxxxxx',this.state.x1)
          var resultball = [];
          let spanStyle1 = []; let spanStyle2 = []; let spanStyle3 = []; let spanStyle4 = []; let spanStyle5 = []; let spanStyle6 = []; 
          let spanStylenext1 = []; let spanStylenext2 = []; let spanStylenext3 = []; let spanStylenext4 = []; let spanStylenext5 = []; let spanStylenext6 = []; 
          let v1 = []; let v2 = []; let v3 = []; let v4 = []; let v5 = []; let v6 = []; 
          let resclass1; let resclass2; let resclass3; let resclass4; let resclass5; let resclass6;
         
          if(this.state.hide === 'false')    
          {             
             spanStyle1 = {
                  transform: "translate(" + Number(this.state.x1) + "px, " + Number(this.state.y1) + "px)",
                  backgroundColor: 'green'                   
                };
           
               spanStyle2 = {
                transform: "translate(" + Number(this.state.x2) + "px, " + Number(this.state.y2) + "px)", 
                backgroundColor: 'red' 
              };
            
              spanStyle3 = {
                transform: "translate(" + Number(this.state.x3) + "px, " + Number(this.state.y3) + "px)", 
                backgroundColor: 'green' 
              };

              spanStyle4 = {
                transform: "translate(" + Number(this.state.x4) + "px, " + Number(this.state.y4) + "px)", 
                backgroundColor: 'yellow'
              };

              spanStyle5 = {
                transform: "translate(" + Number(this.state.x5) + "px, " + Number(this.state.y5) + "px)", 
                backgroundColor: 'pink'
              };

              spanStyle6 = {
                transform: "translate(" + Number(this.state.x6) + "px, " + Number(this.state.y6) + "px)", 
                backgroundColor: 'blue'
              };              
                              
          }     

          else {
             

             spanStyle1 = {
                  transform: "translate(" + Number(this.state.x1) + "px, " + Number(this.state.y1) + "px)",
                  backgroundColor: 'green'                   
                };
           
               spanStyle2 = {
                transform: "translate(" + Number(this.state.x2) + "px, " + Number(this.state.y2) + "px)", 
                backgroundColor: 'red' 
              };
            
              spanStyle3 = {
                transform: "translate(" + Number(this.state.x3) + "px, " + Number(this.state.y3) + "px)", 
                backgroundColor: 'green' 
              };

              spanStyle4 = {
                transform: "translate(" + Number(this.state.x4) + "px, " + Number(this.state.y4) + "px)", 
                backgroundColor: 'yellow'
              };

              spanStyle5 = {
                transform: "translate(" + Number(this.state.x5) + "px, " + Number(this.state.y5) + "px)", 
                backgroundColor: 'pink'
              };

              spanStyle6 = {
                transform: "translate(" + Number(this.state.x6) + "px, " + Number(this.state.y6) + "px)", 
                backgroundColor: 'blue'
              };         

             
          } 

                           if(this.state.level === 'one'){
                v1.push( 
                              D.span({ className: "bouncy", style: spanStyle1 } , this.props.num1 )
                          );                
                 
              }   
              else if(this.state.level === 'two'){
                v1.push( 
                              D.span({ className: "bouncy", style: spanStyle1 } , this.props.num1 ),
                              D.span({ className: "bouncy", style: spanStyle2 } , this.props.num2 )
                          );                
                
              } 
              else if(this.state.level === 'three'){
                v1.push( 
                              D.span({ className: "bouncy", style: spanStyle1 } , this.props.num1 ),
                              D.span({ className: "bouncy", style: spanStyle2 } , this.props.num2 ),
                              D.span({ className: "bouncy", style: spanStyle3 } , this.props.num3 )
                          );
                
              }  
              else if(this.state.level === 'four'){
                v1.push( 
                              D.span({ className: "bouncy", style: spanStyle1 } , this.props.num1 ),
                              D.span({ className: "bouncy", style: spanStyle2 } , this.props.num2 ),
                              D.span({ className: "bouncy", style: spanStyle3 } , this.props.num3 ),
                              D.span({ className: "bouncy", style: spanStyle4 } , this.props.num4 )
                          );

               
                
              }  
              else if(this.state.level === 'five'){
                v1.push( 
                              D.span({ className: "bouncy", style: spanStyle1 } , this.props.num1 ),
                              D.span({ className: "bouncy", style: spanStyle2 } , this.props.num2 ),
                              D.span({ className: "bouncy", style: spanStyle3 } , this.props.num3 ),
                              D.span({ className: "bouncy", style: spanStyle4 } , this.props.num4 ),
                              D.span({ className: "bouncy", style: spanStyle5 } , this.props.num5 )
                          );
                
              }  
              else if(this.state.level === 'six'){
                v1.push( 
                              D.span({ className: "bouncy", style: spanStyle1 } , this.props.num1 ),
                              D.span({ className: "bouncy", style: spanStyle2 } , this.props.num2 ),
                              D.span({ className: "bouncy", style: spanStyle3 } , this.props.num3 ),
                              D.span({ className: "bouncy", style: spanStyle4 } , this.props.num4 ),
                              D.span({ className: "bouncy", style: spanStyle5 } , this.props.num5 ),
                              D.span({ className: "bouncy", style: spanStyle6 } , this.props.num6 )
                          );
               
               
              }  
              else{  v1 = '';
              }
            
              
                     
            return D.div( {  }, 
                    v1 
                    
        )
      }
    });
});