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
        displayName: 'Bets',

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

            return D.div({  }, 
                    D.button({ className: 'allocation_text', } , "Dividend X0.0"),
                    D.div( { },
                        D.h5({}, "REGULAR BALL" ),
                        D.div({ className: "num_list_bets"},
                            D.div( { className: "num_list_item"} ,
                                D.button({type: "button", disabled: this.state.regulardisabled, className:"btn_common lotto_bet", onClick:this.regularClick, 
                                id: "regular", value:'' }  , "1.8" )
                            ),
                            D.div( { className: "num_list_item"} ,
                                D.button({type: "button", disabled: this.state.regulardisabled, className:"btn_common lotto_bet", onClick:this.regularClick, 
                                id: "regular", value:'' }  , "1.8" )
                            ),
                            D.div( { className: "num_list_item"} ,
                                D.button({type: "button", disabled: this.state.regulardisabled, className:"btn_common lotto_bet", onClick:this.regularClick, 
                                id: "regular", value:'' }  , "1.8" )
                            ),
                            D.div( { className: "num_list_item"} ,
                                D.button({type: "button", disabled: this.state.regulardisabled, className:"btn_common lotto_bet", onClick:this.regularClick, 
                                id: "regular", value:'' }  , "1.8" )
                            ),

                        )    
                    ),
                     D.div( { },
                        D.h5({}, "LUCKY BALL" ),
                        D.div({ className: "num_list_bets"},
                            D.div( { className: "num_list_item"} ,
                                D.button({type: "button", disabled: this.state.regulardisabled, className:"btn_common lotto_bet", onClick:this.regularClick, 
                                id: "regular", value:'' }  , "1.8" )
                            ),
                            D.div( { className: "num_list_item"} ,
                                D.button({type: "button", disabled: this.state.regulardisabled, className:"btn_common lotto_bet", onClick:this.regularClick, 
                                id: "regular", value:'' }  , "1.8" )
                            ),
                            D.div( { className: "num_list_item"} ,
                                D.button({type: "button", disabled: this.state.regulardisabled, className:"btn_common lotto_bet", onClick:this.regularClick, 
                                id: "regular", value:'' }  , "1.8" )
                            ),
                            D.div( { className: "num_list_item"} ,
                                D.button({type: "button", disabled: this.state.regulardisabled, className:"btn_common lotto_bet", onClick:this.regularClick, 
                                id: "regular", value:'' }  , "1.8" )
                            ),

                        )    
                    ),


                     D.div( { id:"", className:"buy_control"},
                        D.div( { className:"buy_price"} ,
                                D.button({ className:"btn_common", type:"button"}, "Reset"),
                                D.button({ className:"btn_common", type:"button"}, "5 XSRP"),
                                D.button({ className:"btn_common", type:"button"}, "10 XSRP"),
                                D.button({ className:"btn_common", type:"button"}, "15 XSRP"),
                                D.button({ className:"btn_common", type:"button"}, "100 XSRP")
                        ),
                        D.div( { className: "buy_total"},
                            D.div( {}, "Betting Quantity"),
                            D.div( {},
                                D.input( { className: "number" }),
                                D.span({}, "XSRP"),
                                D.p({}, "= 0.0026 ETH", )
                                ) 
                        ),

                    )

            );
        }

    });

});
