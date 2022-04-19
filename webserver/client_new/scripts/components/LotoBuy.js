define([
    'react',
    'game-logic/clib',
    'game-logic/engine'
], function(
    React,
    Clib,
    Engine
){

    /** Constants **/
    var MAX_GAMES_SHOWED = 50;

    var D = React.DOM;

    function getState(){
        return {
            engine: Engine
        }
    }

    function copyHash(gameId, hash) {
        return function() {
            prompt('Game ' + gameId + ' Hash: ', hash);
        }
    }

    return React.createClass({
        displayName: 'LotoBuy',

        getInitialState: function () {
            return getState();
        },

        componentDidMount: function() {
            Engine.on({
                game_crash: this._onChange
            });
        },

        componentWillUnmount: function() {
            Engine.off({
                game_crash: this._onChange
            });
        },

        _onChange: function() {
            //Check if its mounted because when Game view receives the disconnect event from EngineVirtualStore unmounts all views
            //and the views unregister their events before the event dispatcher dispatch them with the disconnect event
            if(this.isMounted())
                this.setState(getState());
        },

        render: function () {
            

            return D.div({  }, "LotoBuy"
                   

            );
        }

    });

});
