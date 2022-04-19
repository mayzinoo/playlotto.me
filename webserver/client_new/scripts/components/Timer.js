define([
    'react',
    'components/GraphicsContainer',
    'components/ControlsSelector' ,
    'game-logic/engine'
], function (
    React,
    GraphicsContainerClass,
    ControlsSelectorClass, 
    Engine

) {
    var D = React.DOM;

    var GraphicsContainer = React.createFactory(GraphicsContainerClass);
    var ControlsSelector = React.createFactory(ControlsSelectorClass);

     
    

    return React.createClass({
        displayName: 'Timer',

        propTypes: {
            minutes:React.PropTypes.string.isRequired,
            seconds:React.PropTypes.string.isRequired,
                        
        },      
        
          render: function () {
           // console.log('aaaaaaa', this.props.minutes + ":" + this.props.seconds );

            var myInterval = setInterval(() => {
            
            const seconds = 0;
            const minutes = 1;

                        if (seconds > 0) {
                            this.setState(({ seconds }) => ({
                                seconds: seconds - 1
                            }))
                        }
                        if (seconds === 0) {
                            if (minutes === 0) {
                                clearInterval(this.myInterval)
                            } else {
                                this.setState(({ minutes }) => ({
                                    minutes: minutes - 1,
                                    seconds: 59
                                }))
                            }
                        } 
                    }, 1000);

            var fortimer = [];  
            setInterval(this.myInterval,1000);            
                fortimer.push( 
                        D.div({ className: '' },
                                   D.span({  },                          
                                    this.state.minutes + ":" + this.state.seconds
                                    )
                        )
                    );              
                      
                   
            return  D.div({id:'',className:''},
                        fortimer

                    );


        }   
                                
    });
});

    

    



