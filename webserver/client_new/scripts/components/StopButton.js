define([
    'react',
    'game-logic/clib',
    'game-logic/stateLib',
    'constants/AppConstants',
    'components/Payout',
    'game-logic/engine',
    'actions/ControlsActions',
], function(
    React,
    Clib,
    StateLib,
    AppConstants,
    PayoutClass,
    Engine,
    ControlsActions,
){

    var D = React.DOM;
    var Payout = React.createFactory(PayoutClass);

    return React.createClass({
        displayName: 'StopButton',


        propTypes: {
            engine: React.PropTypes.object.isRequired,
            state: Engine.gameState,
            isMobileOrSmall: React.PropTypes.bool.isRequired,
            controlsSize: React.PropTypes.string.isRequired
        },

        getInitialState: function() {
            return { nextrate: '' };
        },

        componentDidMount: function() {
            
        },

        componentWillUnmount: function() {
            
        },
       
        stopgame: function () {
            ControlsActions.stopgame(); 
        },

        handleChange: function(e) { 
            this.setState({ nextrate: e.target.value });         
          },

        presetnextround: function () {
            var nextrate;
            if(this.state.nextrate < 1.0) 
            {
               this.setState({ nextrate: 1.0 }); 
               nextrate = 1.0;
               ControlsActions.presetnextround(nextrate);                           
            }
            else{
                nextrate = this.state.nextrate;
                ControlsActions.presetnextround(nextrate);
            }
        },

        setrate: function(rate) {
            this.setState({ nextrate: rate }); 
        },

        getThisElementNode: function() {
            return this.getDOMNode();
        },

        render: function() {
        var self = this; 
            var quickButtons = [];
            var amounts =AppConstants.QuickBetAmountButton.AUTO_CASH_OUT_AMOUNTS;

            for (i = 0, length = amounts.length; i < length; i++) {
                quickButtons.push(D.button({
                    key: i,
                    value: amounts[i],
                    onClick: function (e) {
                        self.setrate(e.target.value)
                    }
                }, amounts[i]));
            }

            quickButtons.push(D.button({
                key: amounts.length,
                value: 1.00,
                onClick: function (e) { self.setrate(e.target.value) }
            }, 'Reset'));

            return D.div({  },
                D.button({ onClick:() => this.stopgame() , className:'' + (this.props.state ==='IN_PROGRESS' ? 'stop-button' : 'disabled') },
                    'StopGame'
                ),
                D.div({ className: 'bet-input-group'  },
                    D.input({
                        type: 'number',
                        min: 1,
                        onChange:this.handleChange.bind(this),
                        value : this.state.nextrate
                    }),
                    D.span({ className: '' }, 'rate')
                ),
                D.div({ className: 'quick-button-container' },
                    quickButtons
                ),
                D.button({  className:'stop-button' , onClick:() => this.presetnextround()  },
                    'Preset for Next Round'
                ),
            );           
            
        }
    });

});